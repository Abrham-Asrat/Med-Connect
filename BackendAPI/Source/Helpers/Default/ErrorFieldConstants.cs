using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Helpers.Default
{
    public static class ErrorFieldConstants
    {       
         public const string ModelStateErrors = "ModelStateErrors";
        public static string FluentValidationErrors = "FluentValidationErrors";
  
    }

    public static class ErrorMessages
    {
        public const string ModelValidationError = "Model validation failed. Please check the errors for details.";

        public const string FluentValidationError = "Validation failed. Please check the errors for details.";
        public static string InternalServerError = "An unexpected error occurred. Please try again later.";
        public static string NotFoundError = "The requested resource was not found.";
         public static string UnauthorizedError = "You are not authorized to perform this action.";
        public static string ValidationError = "Request Validation Error has occured!";
        public static string InvalidGenderProvided = "Invalid Gender Provided.";
    }
}