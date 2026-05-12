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

    /// <summary>
    /// Payload for requesting a new email verification link.
    /// </summary>
    public class ResendVerificationDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}