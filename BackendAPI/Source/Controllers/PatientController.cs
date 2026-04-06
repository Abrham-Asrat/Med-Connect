using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
    public class PatientController(PatientService patientService , ILogger<PatientController> logger): ControllerBase
    {
        // <Summary>
        // To Get all patient record in the system 
        // </Summary>

        // [HttpGet("all")]
        // public async Task<IActionResult> GetAllPatient([FromBody])
    }
}