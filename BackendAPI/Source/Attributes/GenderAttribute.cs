using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Attributes
{
    public class GenderAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid (object? value,ValidationContext validationContext)
        {
            try
            {
                if (value == null)
                {
                    return new ValidationResult("Gender field cannot be empty.");
                }
                if(value is not Gender gender)
                {
                    return new ValidationResult("Invalid Gender Value");
                }
                if(!Enum.IsDefined(typeof(Gender), gender))
                {
                    return new ValidationResult("Gender must be either Male or Female.");
                }
            return ValidationResult.Success;
            }
            catch (Exception ex)
            {
                
                Console.WriteLine($"{ex}");
                
                return new ValidationResult("Invalid Gender type! Must Be either Mlae or FeMale!");
            }
        }
        

    }
}