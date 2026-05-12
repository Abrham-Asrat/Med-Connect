using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using BackendAPI.Source.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BackendAPI.Source.Controllers
{
    /// <summary>
    /// Handles registration, email verification, and login.
    ///
    /// Flow:
    ///   POST  /api/auth/register          → create account (is_verified=false) + send verification email
    ///   GET   /api/auth/verify-email      → validate token, set is_verified=true, delete token
    ///   POST  /api/auth/login             → authenticate (blocks unverified accounts)
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController(
        UserService userService,
        EmailVerificationService emailVerificationService,
        ILogger<AuthController> logger,
        IValidator<RegisterUserDto> registerUserDtoValidator
    ) : ControllerBase
    {
        // ------------------------------------------------------------------ //
        //  POST /api/auth/register
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Creates a new user account and sends a verification email.
        /// The account is created with <c>IsEmailVerified = false</c>.
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        [EnableRateLimiting("RegistrationLimit")]
        [ProducesResponseType(typeof(ApiResponse<ProfileDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 409)]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var validation = registerUserDtoValidator.Validate(dto);
                if (!validation.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.FluentValidationErrors] =
                        validation.ToFluentValidationErrorResult();
                }

                // 1. Create the user (IsEmailVerified = false by default).
                var response = await userService.RegisterUser(dto);

                if (!response.Success)
                {
                    return response.StatusCode switch
                    {
                        400 => BadRequest(new ApiResponse<object>(false, response.Message, null)),
                        409 => Conflict(new ApiResponse<object>(false, response.Message, null)),
                        _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                    };
                }

                // 2. Send the verification email (best-effort — don't fail registration if email fails).
                if (response.Data?.UserId != null)
                {
                    try
                    {
                        await emailVerificationService.SendVerificationEmailAsync(response.Data.UserId);
                    }
                    catch (Exception emailEx)
                    {
                        // Log but don't surface to the caller — the account was created successfully.
                        logger.LogError(emailEx,
                            "Failed to send verification email for userId={UserId}", response.Data.UserId);
                    }
                }

                return StatusCode(201,
                    new ApiResponse<ProfileDto>(
                        true,
                        "Registration successful! Please check your email to verify your account.",
                        response.Data
                    ));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Registration failed");
                return StatusCode(500,
                    new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

        // ------------------------------------------------------------------ //
        //  GET /api/auth/verify-email?token=XYZ
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Validates the email verification token, marks the user as verified,
        /// and deletes the token so it cannot be reused.
        /// </summary>
        [HttpGet("verify-email")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    return BadRequest(new ApiResponse<object>(false, "Verification token is required.", null));
                }

                var user = await emailVerificationService.VerifyEmailTokenAsync(token);

                return Ok(new ApiResponse<object>(true, "Email verified successfully.",
                    new { email = user.Email }));
            }
            catch (ArgumentException ex)
            {
                logger.LogWarning(ex, "Email verification failed for token");
                return BadRequest(new ApiResponse<object>(false, ex.Message, null));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during email verification");
                return StatusCode(500,
                    new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

        // ------------------------------------------------------------------ //
        //  POST /api/auth/login
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Authenticates the user. Returns 403 if the email has not been verified yet.
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting("LoginLimit")]
        [ProducesResponseType(typeof(ApiResponse<Auth0LoginDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 403)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> Login([FromBody] LoginUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                // 1. Check that the user exists and has verified their email.
                var user = await userService.GetUserByEmail(dto.Email);

                if (user == null)
                {
                    return NotFound(new ApiResponse<object>(false, "No account found with that email address.", null));
                }

                if (!user.IsEmailVerified)
                {
                    return StatusCode(403,
                        new ApiResponse<object>(
                            false,
                            "Your email address has not been verified. Please check your inbox for the verification link.",
                            null
                        ));
                }

                // 2. Delegate authentication to Auth0 via UserService.
                var response = await userService.LoginUserAsync(dto);

                if (!response.Success)
                {
                    return response.StatusCode switch
                    {
                        400 => BadRequest(new ApiResponse<object>(false, response.Message, null)),
                        404 => NotFound(new ApiResponse<object>(false, response.Message, null)),
                        _ => StatusCode(response.StatusCode, new ApiResponse<object>(false, response.Message, null))
                    };
                }

                // 3. Set HttpOnly cookies (mirrors the existing UserController.LoginUserAsync behaviour).
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7)
                };

                Response.Cookies.Append(
                    AuthDefaults.AccessToken.ToSnakeCase(),
                    response.Data?.AccessToken ?? string.Empty,
                    cookieOptions);

                var profile = response.Data?.Profile;
                if (profile != null)
                {
                    foreach (var field in profile.GetType().GetProperties(
                        System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance))
                    {
                        var value = field.GetValue(profile);
                        Response.Cookies.Append(field.Name.ToSnakeCase(), value?.ToString() ?? string.Empty, cookieOptions);
                    }
                }

                return Ok(new ApiResponse<Auth0LoginDto>(true, "Login successful.", response.Data));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Login failed for {Email}", dto.Email);
                return StatusCode(500,
                    new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }

        // ------------------------------------------------------------------ //
        //  POST /api/auth/resend-verification
        // ------------------------------------------------------------------ //

        /// <summary>
        /// Resends the verification email for an unverified account.
        /// </summary>
        [HttpPost("resend-verification")]
        [AllowAnonymous]
        [EnableRateLimiting("OtpSendLimit")] // reuse the existing 3/15-min rate limit
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(typeof(ApiResponse<object>), 400)]
        [ProducesResponseType(typeof(ApiResponse<object>), 404)]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>(false, "Invalid email address.", null));
                }

                var user = await userService.GetUserByEmail(dto.Email);

                if (user == null)
                {
                    // Return 200 to avoid leaking whether an email is registered.
                    return Ok(new ApiResponse<object>(true,
                        "If that email is registered and unverified, a new link has been sent.", null));
                }

                if (user.IsEmailVerified)
                {
                    return BadRequest(new ApiResponse<object>(false, "This email is already verified.", null));
                }

                await emailVerificationService.SendVerificationEmailAsync(user.UserId);

                return Ok(new ApiResponse<object>(true,
                    "A new verification link has been sent to your email address.", null));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to resend verification email for {Email}", dto.Email);
                return StatusCode(500,
                    new ApiResponse<object>(false, "An unexpected error occurred. Please try again later.", null));
            }
        }
    }
}
