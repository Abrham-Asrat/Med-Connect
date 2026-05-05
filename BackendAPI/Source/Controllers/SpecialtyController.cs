using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Service;
using BackendAPI.Source.Models.Responses;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/specialties")]
    public class SpecialtyController(SpecialtyService specialtyService, ILogger<SpecialtyController> logger) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllSpecialties()
        {
            try
            {
                var specialties = await specialtyService.GetAllSpecialtiesAsync();
                return Ok(new ApiResponse<List<string>>(true, "Specialties retrieved successfully", specialties));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get all specialties");
                return StatusCode(500, new ApiResponse<List<string>>(false, "An error occurred while retrieving specialties", null));
            }
        }
    }
}
