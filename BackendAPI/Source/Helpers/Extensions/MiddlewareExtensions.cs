using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Middlewares;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomValidationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CustomValidationMiddleware>();
        }
        public static IApplicationBuilder UseCookieMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CookieMiddleware>();
        }

    
    }
}