using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Helpers.Default;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/doctors")]
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

                if(!response.Success)
                   throw new Exception(response.Message);

                return Ok(response);
                
             
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching doctors.");
                throw new Exception("An error occurred while fetching doctors.");
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
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors by specialty.");
                throw new Exception("An error occurred while fetching doctors by specialty.");
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
            catch (System.Exception)
            {
                
                throw;
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
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctor availabilities.");
                throw new Exception("An error occurred while fetching doctor availabilities.");
            }
        }
    
 
    }
}