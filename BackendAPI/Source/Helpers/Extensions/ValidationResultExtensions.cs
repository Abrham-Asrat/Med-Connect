using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation.Results;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class ValidationResultExtensions
    {
        public static Dictionary<string, string[]> ToFluentValidationErrorResult(this ValidationResult validationResult)
        {
           return validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );
        }
    }
}