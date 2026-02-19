using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Attributes
{
    public class PasswordAttributes : ValidationAttribute
    {
         public int MinimumLength { get; set; } = 8; // Default minimum length
        
        public PasswordAttributes(int minimumLength)
        {
            MinimumLength = minimumLength;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
           try
           {

            if(value == null)
                {
                    return new ValidationResult("Password Required");
                }
            
            string Password = value.ToString() ?? "";

            if(Password.Length < MinimumLength)
                {
                    return new ValidationResult($"Password must be at least {MinimumLength} characters long.");
                }
            
            if(!Password.Any(char.IsUpper))
                {
                    return new ValidationResult("Password must contain at least one uppercase letter.");
                }
            if(!Password.Any(char.IsLower))
                {
                    return new ValidationResult("Password must contain at least one lowercase letter.");
                }
            if(!Password.Any(char.IsDigit))
                {
                    return new ValidationResult("Password must contain at least one digit.");
                }
            if(!Password.Any(ch => !char.IsLetterOrDigit(ch)))
                {
                    return new ValidationResult("Password must contain at least one special character.");
                }
            return ValidationResult.Success;
           }
           catch (System.Exception)
           {
            
            throw;
           }
        }
    }
}