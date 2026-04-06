using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Models.Dto;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Helpers.Extensions; 

namespace BackendAPI.Source.Service
{
    public class PatientService(ApplicationDbContext appContext, ILogger<PatientService> logger)
    {
        public async Task<ServiceResponse<List<PatientDto>>> GetAllPatientsAsync()
        {
            try
            {
                var patients = await appContext.Patients.Include(p => p.User).Where(p => p.User != null).Select(p => p.ToPatientDto(p.User!)).ToListAsync();
                
                return new ServiceResponse<List<PatientDto>>
                { 
                    Success = true,
                    StatusCode = 200,
                    Data = patients
                   
                };
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "Error occurred while fetching patients");
                throw new Exception("An error occurred while fetching patients");   
            }
        }
    }
}