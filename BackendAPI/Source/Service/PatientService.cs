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

         public async Task<ServiceResponse<PatientModel>> GetPatientAsync(Guid patientId)
  {
    try
    {
      var patient = await appContext
        .Patients.Include(p => p.User)
        .SingleOrDefaultAsync(p => p.PatientId == patientId || p.UserId == patientId);
      if (patient == null)
      {
        return new ServiceResponse<PatientModel>
        {
          Data = null,
          Message = "Patient Not Found.",
          StatusCode = 404,
          Success = false
        };
      }
      return new ServiceResponse<PatientModel>(true, 200, patient, "Patient found.");
    }
    catch (Exception ex)
    {
      logger.LogError(ex, "Failed to Get Patient");
      throw;
    }
  }

   public async Task<bool> CheckPatientExistsAsync(Guid patientId)
  {
    try
    {
      var patientExists = await appContext.Patients.AnyAsync(p => p.PatientId == patientId || p.UserId == patientId);
      return patientExists;
    }
    catch (Exception ex)
    {
      logger.LogError($"Failed to check if patient exists {ex}");
      throw;
    }
  }

   public async Task<bool> UserExistsAsync(Guid userId)
  {
    return await appContext.Patients.AnyAsync(p => p.UserId == userId);
  }

    }
}