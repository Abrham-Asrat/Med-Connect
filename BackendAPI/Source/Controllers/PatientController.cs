using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController(PatientService patientService , ILogger<PatientController> logger): ControllerBase
    {
        // <Summary>
        // To Get all patient record in the system 
        // </Summary>

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPatient()
        {
            try
            {
                if(!ModelState.IsValid)
                {
                    logger.LogWarning("Invalid model state while fetching patients: {ModelStateErrors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                    return BadRequest(ModelState);
                }   
                var patients = await patientService.GetAllPatientsAsync();
                if(!patients.Success)
                {
                    logger.LogWarning("Failed to fetch patients: {ErrorMessage}", patients.Message);
                    throw new Exception(patients.Message);    
                }
                return Ok(patients);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while fetching patients.");
                return StatusCode(500, "An error occurred while fetching patients.");
            }
        }
    }
}