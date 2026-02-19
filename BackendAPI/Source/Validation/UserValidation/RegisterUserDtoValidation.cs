using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Models.Enums;
using FluentValidation;

namespace BackendAPI.Source.Validation
{
    public class RegisterUserDtoValidator : AbstractValidator<RegisterUserDto>
    {
        public RegisterUserDtoValidator()
        {
            RuleFor(x => x.DateOfBirth)
               .NotEmpty()
               .WithMessage("Date of birth is required.")
               .Must(ValidationHelper.BeValidDateTimeString)
               .WithMessage("DateOfBirth must be a valid DateTime (yyyy-MM-dd)")
              .Must(ValidationHelper.BeAtLeast18YearsOldFromString)
              .WithMessage("User must be at least 18 years old.");

            RuleFor(u => u.Role)
                .NotEmpty()
                .WithMessage("Role field is required")
                .Must(ValidationHelper.BeValidRole)
                .WithMessage("Role must be either Patient, Doctor, or Admin");

            RuleFor(u => u.Gender)
               .NotEmpty()
             .WithMessage("Gender field is required")
              .Must(ValidationHelper.BeValidGender)
              .WithMessage("Gender must be either Male or Female");


        }
    }
}