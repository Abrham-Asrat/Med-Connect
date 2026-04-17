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
        public async Task<PatientModel> CreatePatientAsync(CreatePatientDto createPatientDto)
        {
             try
             {
                var patientResult = await appContext.Patients.AddAsync(createPatientDto.ToPatientModel());
                var patient = patientResult.Entity;

                await appContext.SaveChangesAsync();

                  return patient;
              }
                catch (Exception ex)
                 {
                   logger.LogError(ex, "Failed to Create Patient");
        
                  throw new Exception("Failed to Create Patient");
          }
        }

         /// <summary>
         /// Retrieves the profile of the patient specified with the userId
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>A <see cref="PatientProfileDto"/> representing the patients's profile.</returns>
         /// <exception cref="KeyNotFoundException"/>Thrown when no patient is found with the specified userId.<exception/>
         public async Task<PatientProfileDto> GetPatientProfileAsync(Guid userId)
         {
            try
            {
                var patient = await appContext.Patients.Where(p => p.UserId == userId).Include(p => p.User).SingleOrDefaultAsync();
                
                if (patient == null)
                {
                    throw new KeyNotFoundException("Patient with that user id is not found. Couldn't retrieve profile information.");
                }

                return patient.ToPatientProfileDto(patient.User!);
            }
            catch (Exception ex)
            {
              logger.LogError($"{ex}: An error occurred to get patient profile");
              throw;
            }
        }
    }
}