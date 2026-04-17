using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Responses;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("/api")]
    public class ErrorController : ControllerBase
    {
        [HttpGet("error")]
        public IActionResult Error()
        {
            var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();

            if (exceptionFeature?.Error == null)
            {
                return Ok(new ApiResponse<object>(true, "Error handler endpoint is alive. It only returns problem details when an exception is forwarded here.", null));
            }

            return Problem(
                statusCode: StatusCodes.Status500InternalServerError,
                title: "An error occurred while processing your request.",
                detail: exceptionFeature.Error.Message
            );
        }
    }
}