using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Service;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Validation;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Config;
using FluentValidation;


namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("Users")]
    public class UserController(
        UserService userService,
        // AppConfig appConfig ,
        // ILogger<UserController> logger,

        IValidator <RegisterUserDto> RegisterUserDtoValidator
    ) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterUserDto registerUserDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    // return BadRequest(ModelState);
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;

                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                // Role based validation of payload
                var validation = RegisterUserDtoValidator.Validate(registerUserDto);

                if (!validation.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.FluentValidationErrors] = validation.Errors;
                    throw new BadHttpRequestException(ErrorMessages.FluentValidationError);
                }

                var Response = await userService.RegisterUser(registerUserDto);

                if(!Response.Success)
                {
                    throw new BadHttpRequestException(Response.Message!);
                }

              return Ok(new ApiResponse<ProfileDto>(true, Response.Message, Response.Data));
            }
            catch (System.Exception)
            {

                throw;
            }

        }
    }
}