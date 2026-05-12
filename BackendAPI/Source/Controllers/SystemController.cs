using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Service;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemController(Auth0Service auth0Service) : ControllerBase
    {
        [HttpPost("wipe-auth0")]
        public async Task<IActionResult> WipeAuth0()
        {
            var result = await auth0Service.WipeAllUsersAsync();
            if (result) return Ok("All Auth0 users have been deleted.");
            return BadRequest("Failed to delete Auth0 users.");
        }
    }
}
