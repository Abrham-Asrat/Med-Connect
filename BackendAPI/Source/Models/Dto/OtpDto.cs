using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Dto
{
    public class SendOtpDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set;}
    }

    public class VerifyOtpDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set;}

        [Required]
        [Range(100000, 999999, ErrorMessage = "OTP must be a 6-digit number.")]
        public required int Otp { get; set;}
    }

    public class ForgotPasswordResetDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [Range(100000, 999999, ErrorMessage = "OTP must be a 6-digit number.")]
        public required int Otp { get; set; }

        [Required]
        [MinLength(8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
        public required string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public required string ConfirmPassword { get; set; }
    }
}