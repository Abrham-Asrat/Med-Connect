using System.Text.Json;
using BackendAPI.Source.Helpers.Default;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace BackendAPI.Source.Filters.Error;

public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger) : IExceptionFilter
{
  public void OnException(ExceptionContext context)
  {
    var exception = context.Exception;
    
    // Log the exception with appropriate level based on type
    if (exception is BadHttpRequestException or KeyNotFoundException)
    {
      logger.LogWarning(exception, "Client error occurred: {ExceptionType}", exception.GetType().Name);
    }
    else
    {
      logger.LogError(exception, "Unhandled exception occurred: {ExceptionType}", exception.GetType().Name);
    }

    ObjectResult result;

    // Handle Bad Request errors
    if (exception is BadHttpRequestException badRequest)
    {
      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "Bad Request",
          message = badRequest.Message,
          errors = exception.Data.Count > 0 ? exception.Data : null
        }
      )
      {
        StatusCode = StatusCodes.Status400BadRequest
      };
    }
    // Handle Key Not Found errors
    else if (exception is KeyNotFoundException notFound)
    {
      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "Not Found",
          message = notFound.Message
        }
      )
      {
        StatusCode = StatusCodes.Status404NotFound
      };
    }
    // Handle Unauthorized access
    else if (exception is UnauthorizedAccessException unauthorized)
    {
      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "Unauthorized",
          message = unauthorized.Message
        }
      )
      {
        StatusCode = StatusCodes.Status401Unauthorized
      };
    }
    // Handle Invalid Operation errors
    else if (exception is InvalidOperationException invalidOp)
    {
      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "Invalid Operation",
          message = invalidOp.Message
        }
      )
      {
        StatusCode = StatusCodes.Status400BadRequest
      };
    }
    // Handle FluentValidation errors from middleware
    else if (context.HttpContext.Items.ContainsKey("FluentValidationErrors"))
    {
      var fluentResult =
        (IDictionary<string, string[]>)context.HttpContext.Items["FluentValidationErrors"]!;
      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "Validation Error",
          message = ErrorMessages.ModelValidationError,
          errors = fluentResult
        }
      )
      {
        StatusCode = StatusCodes.Status400BadRequest
      };
    }
    // Handle JSON serialization errors
    else if (exception is JsonException jsonEx)
    {
      var validationErrors = context.ModelState.IsValid 
        ? null 
        : context
          .ModelState.Where(ms => ms.Value!.Errors.Count > 0)
          .ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
          );

      result = new ObjectResult(
        new 
        { 
          success = false,
          title = "JSON Processing Error",
          message = "Invalid JSON format. Please check your request body.",
          errors = validationErrors,
          details = jsonEx.Message
        }
      )
      {
        StatusCode = StatusCodes.Status400BadRequest
      };
    }
    // Handle all other unhandled exceptions
    else
    {
      result = new ObjectResult(
        new 
        {
          success = false,
          title = "Internal Server Error",
          message = "An error occurred while processing your request. Please try again later.",
          // Only include exception details in development environment
          details = context.HttpContext.RequestServices
            .GetRequiredService<IHostEnvironment>()
            .IsDevelopment() 
            ? exception.Message 
            : null
        }
      )
      {
        StatusCode = StatusCodes.Status500InternalServerError
      };
    }

    context.Result = result;
    context.ExceptionHandled = true;
  }
}
