using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Service;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Source.Controllers
{
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
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors.");
                throw;
            }
        }

        //
    }
}