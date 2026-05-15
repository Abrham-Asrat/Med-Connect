using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Services;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _service;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IContactService service, ILogger<ContactController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] ContactFormDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _service.SubmitContactFormAsync(dto);
                return Ok(new { message = "We have received your message!" });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Contact form submission failed due to configuration or validation.");
                return StatusCode(500, new { title = "Internal server error", message = "Mail service configuration is invalid.", errors = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Contact form submission failed.");
                return StatusCode(500, new { title = "Internal server error", message = "Failed to send contact message. Please try again later.", errors = ex.Message });
            }
        }

        [HttpGet("info")]
        public async Task<IActionResult> GetInfo()
            => Ok(await _service.GetContactInfoAsync());
    }
}