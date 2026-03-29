using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using Microsoft.Extensions.Logging;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Dto;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace BackendAPI.Source.Service
{
    public class SpecialtyService(
        ApplicationDbContext appContext,
        ILogger<SpecialtyService> logger
    )

    {

        // <summary>
        // Creates a new medical specialty if it doesn't already exist.
        // Checks for existing specialty by name (case-insensitive) to prevent duplicates.
        // <summary>  
       
        public async Task<SpecialtyModel> CreateSpecialtyAsync(CreateSpecialtyDto specialtyDto)
        {
            try
            {
                var existentSpecialty = await appContext.Specializations.FirstOrDefaultAsync(s => s.SpecialtyName.ToLower() == specialtyDto.SpecialtyName.ToLower());
                if (existentSpecialty != null)
                {
                    logger.LogWarning("Specialty already exists: {SpecialtyName}", specialtyDto.SpecialtyName);
                    return existentSpecialty;
                }

                var newSpecialty = specialtyDto.ToSpecialtyModel();
                var addedSpecialty = await appContext.Specializations.AddAsync(newSpecialty);
                await appContext.SaveChangesAsync();

                return addedSpecialty.Entity;
            }
            catch (System.Exception ex)
            {
                logger.LogError(ex, "An error occurred while creating a specialty: {SpecialtyName}", specialtyDto.SpecialtyName);
                throw;
            }
        }


        //<summary>
        //N Create all medical specialties from the database.
        //<summary>
  

        public async Task<List<SpecialtyModel>> CreateSpecialtiesAsync(List<CreateSpecialtyDto> specialtiesDto)

        {
            try
            {
                List<SpecialtyModel> createdResult = [];
                foreach (CreateSpecialtyDto specialtyDto in specialtiesDto)
                {
                    var createdSpecialty = await CreateSpecialtyAsync(specialtyDto);
                    if (createdSpecialty != null)
                    {
                    
                       createdResult.Add(createdSpecialty);
                    }
                }

                return createdResult;
            }
            catch (System.Exception Ex)
            {
                logger.LogError(Ex, "An error occurred while creating specialties.");

                throw;
            }
        }

    }
}