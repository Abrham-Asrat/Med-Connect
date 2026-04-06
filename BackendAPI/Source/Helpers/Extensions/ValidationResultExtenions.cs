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

        public static string ToSnakeCase(this string str)
        {
            string snake_str = "";

            foreach (char c in str)
            {
                if (char.IsWhiteSpace(c))
                {
                    snake_str += '_';
                }
                else if (char.IsUpper(c))
                {
                    // only add an underscore if it's not the first character
                    if (snake_str.Length > 0)
                    {
                        snake_str += '_';
                    }

                    snake_str += char.ToLower(c);
                }
                else
                {
                    snake_str += c;
                }


            }

            return snake_str.Trim('_'); // remove leading/trailing underscores if any
        }
    }
}