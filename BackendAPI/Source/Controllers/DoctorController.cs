using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Helpers.Default;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/doctors")]
    // [Authorize] // All doctor endpoints require authentication
    public class DoctorController(DoctorService doctorService , ILogger<DoctorController> logger) : ControllerBase
    {
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDoctors([FromQuery] Gender? gender = null)
        {
            try
            {
                IServiceResponse response;
                if(gender != null)
                {
                    response = await doctorService.GetDoctorsByGenderAsync((Gender)gender);
                }
                else
                {
                    response = await doctorService.GetAllDoctors();
                }

                if (!response.Success)
                    return StatusCode(response.StatusCode, response);

                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching doctors.");
                return Problem(detail: "An error occurred while fetching doctors.", statusCode: 500);
            }
        }

        //<summary>Get doctor by SpecialtyName  updated </summary>

        [HttpGet("specialty/{specialtyName}")]
        public async Task<IActionResult> GetDoctorsBySpecialty(string specialtyName)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                 HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                  throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }
                var response = await doctorService.GetDoctorsBySpecialtyAsync(specialtyName);

                if(!response.Success)
                   throw new Exception(response.Message);
                
                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, 
                    "Failed to fetch doctors by specialty '{Specialty}'. Error: {ExceptionType} - {Message}", 
                    specialtyName, ex.GetType().Name, ex.Message);
                
                throw new Exception($"Failed to fetch doctors by specialty '{specialtyName}': {ex.Message}", ex);
            }
        }
   

       //<summary>Get doctor by SpecialtyName</summary>
       [HttpGet("name/{doctorName}")]
       public async Task<IActionResult> GetDoctorsByName(string doctorName)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                 HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                  throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var response = await doctorService.GetDoctorsByNameAsync(doctorName); 

                if(!response.Success)
                   throw new Exception(response.Message);
                
                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, 
                    "Failed to search doctors by name '{DoctorName}'. Error: {ExceptionType} - {Message}", 
                    doctorName, ex.GetType().Name, ex.Message);
                
                throw new Exception($"Failed to search doctors by name '{doctorName}': {ex.Message}", ex);
            }
        }
    
       //<summary>
       // Get the available dayOfWeek for a doctor along with times are available at for that day
       // </summary>

       [HttpGet("availabilities/{doctorId}")]
       public async Task<IActionResult> GetDoctorAvailabilities([FromRoute] Guid doctorId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    HttpContext.Items[ErrorFieldConstants.ModelStateErrors] = ModelState;
                    throw new BadHttpRequestException(ErrorMessages.ModelValidationError);
                }

                var response = await doctorService.GetDoctorAvailabilitiesAsync(doctorId);

                return Ok(response);
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, 
                    "Failed to fetch availabilities for doctor ID '{DoctorId}'. Error: {ExceptionType} - {Message}", 
                    doctorId, ex.GetType().Name, ex.Message);
                
                throw new Exception($"Failed to fetch availabilities for doctor {doctorId}: {ex.Message}", ex);
            }
        }
    
 
        [HttpPost("availabilities/{doctorId}")]
        public async Task<IActionResult> UpdateDoctorAvailabilities([FromRoute] Guid doctorId, [FromBody] List<DoctorAvailabilityDto> availabilities)
        {
            try
            {
                var response = await doctorService.UpdateAvailabilitiesAsync(doctorId, availabilities);
                return Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update availabilities.");
                return StatusCode(500, new ServiceResponse<bool>(false, 500, false, ex.Message));
            }
        }
    }
}

