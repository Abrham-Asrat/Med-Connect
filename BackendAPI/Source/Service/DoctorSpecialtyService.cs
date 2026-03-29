using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Helpers.Extensions;
namespace BackendAPI.Source.Service
{
    public class DoctorSpecialtyService(
        ApplicationDbContext applicationDbContext,
        ILogger<DoctorSpecialtyService> logger
    )
    {
        public async Task<DoctorSpecialtyModel> CreateDoctorSpecialtyAsync(CreateDoctorSpecialtyDto doctorSpecialtyDto)
        {
            try
            {
                var existingDoctorSpecialty = await applicationDbContext.DoctorSpecialties.FirstOrDefaultAsync(s => s.DoctorId == doctorSpecialtyDto.DoctorId);

                if (existingDoctorSpecialty != null)
                {

                    return existingDoctorSpecialty;
                }

                var newDoctorSpecialty = doctorSpecialtyDto.ToDoctorSpecialty(doctorSpecialtyDto.DoctorId, doctorSpecialtyDto.SpecialtyId);

                var doctorSpecialty = await applicationDbContext.DoctorSpecialties.AddAsync(newDoctorSpecialty);

                await applicationDbContext.SaveChangesAsync();

                return doctorSpecialty.Entity;


            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating Doctor Specialty!");
                throw;
            }
        }
  

    public async Task<List<DoctorSpecialtyModel>> CreateDoctorSpecialtiesAsync(List<CreateDoctorSpecialtyDto> doctorSpecialtyDto)
        {
            try
            {
                List<DoctorSpecialtyModel> createResult = [];

                foreach (CreateDoctorSpecialtyDto createDoctorSpecialty in doctorSpecialtyDto)
                {
                    var doctorSpecialtyResult = await CreateDoctorSpecialtyAsync(createDoctorSpecialty);

                    if (doctorSpecialtyResult != null)
                    {
                        createResult.Add(doctorSpecialtyResult);
                    }

                }
                 return createResult;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error Creating Doctor Specialties ");
                throw;
            }
        }
    }
}