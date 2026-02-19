using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Schema;

namespace BackendAPI.Source.Attributes
{
    public class AgeAbove(int minAge=18, string errMsg="You must be at least 18 years old.") : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            try
            {
                if(value==null) return new ValidationResult("Date field must be provided");
                if(value is not DateTime birthDate) return new ValidationResult("Date should be in the correct format. ");
                
                var today = DateTime.Today;
                var age = today.Year - birthDate.Year;
                if(birthDate > today.AddYears(-age)) 

                if (age>=minAge){
                    return  ValidationResult.Success;
                }
                return new ValidationResult(FormatErrorMessage("null"));
            }
            catch (System.Exception)
            {
                throw;
            }
            
        }
       public override string FormatErrorMessage(string name)
        {
            return errMsg;
        }
    }

}