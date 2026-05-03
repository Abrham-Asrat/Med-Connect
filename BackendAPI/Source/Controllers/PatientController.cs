using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Helpers.Default;
using System.Security.Claims;
namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All patient endpoints require authentication
    public class PatientController(PatientService patientService , FileService fileService, ILogger<PatientController> logger): ControllerBase
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

        [HttpPost("{patientId}/medical-records")]
        public async Task<IActionResult> UploadMedicalRecord(Guid patientId, [FromBody] CreateFileDto fileDto)
        {
            try
            {
                if(!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verify the patient is uploading for themselves, or user is an admin/doctor etc based on your auth logic.
                // For now, we assume standard auth.
                
                var file = await fileService.CreateFileAsync(fileDto, patientId, DiscriminatorTypes.Document);
                
                return Ok(new { success = true, message = "Medical record uploaded successfully.", data = file });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred while uploading medical record for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while uploading medical record.");
            }
        }
    }
}