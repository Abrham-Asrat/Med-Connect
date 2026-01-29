using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Attributes
{
    public class RoleValidaton: ValidationAttribute
    {
        protected override ValidationResult? IsValid (object? value , ValidationContext validationContext)
        {
            try
            {
                if (value == null)
            {
                return new ValidationResult("Role is Required");
            }

            if(value is not Role role)
            {
                return new ValidationResult("Invalid Role Type");
            }
           if (!Enum.IsDefined(typeof(Role), role))
                {
                    return new ValidationResult("Role Shold be Either Admin, Doctor, or Patient");
                    
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