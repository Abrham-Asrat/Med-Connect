using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BackendAPI.Source.Service
{
    public class DoctorService(
        ApplicationDbContext appContext,
        ILogger<DoctorService> logger
        // DoctorSpecialtyService doctorSpecialtyService,
        // SpecialtyService specialtyService

    )
    {
        public async Task<DoctorModel> CreateDoctorAsync(CreateDoctorDto createDoctorDto)
        {
            try
            {
                Guid doctorId = Guid.NewGuid();



                var doctorPreference = await appContext.DoctorPreferences.AddAsync(
                    new DoctorPreference
                    {
                        DoctorId = doctorId,
                        OnlineAppointmentFee = createDoctorDto.OnlineAppointmentFee,
                        InPersonAppointmentFee = createDoctorDto.InPersonAppointmentFee
                    }
                );

                var doctorCreate = createDoctorDto.ToDoctorModel(doctorPreference.Entity.DoctorId);

                doctorCreate.DoctorId = doctorId; // Share the DoctorId with the preference to establish connection

                var doctorResult = await appContext.Doctors.AddAsync(doctorCreate);
                var doctor = doctorResult.Entity;



                // Create all education for the doctor
                foreach (CreateEducationDto createEducationDto in createDoctorDto.Educations)
                {
                    await CreateEducationAsync(createEducationDto, doctor.DoctorId);
                }


                // Create all Experience for the doctor 

                foreach (CreateExperienceDto createExperienceDto in createDoctorDto.Experiences)
                {
                    await CreateExperienceAsync(createExperienceDto, doctor.DoctorId);
                }

                await appContext.SaveChangesAsync();
                return doctor;



            }
            catch (System.Exception)
            {

                throw;
            }
        }


        // <summary>
        // Create education  
        // <summary>

        public async Task<EducationDto> CreateEducationAsync(CreateEducationDto createEducationDto, Guid doctorId)
        {
            try
            {

                var education = await appContext.Educations.AddAsync(createEducationDto.ToEducationModel(doctorId));

                await appContext.SaveChangesAsync();
                return education.Entity.ToEducationDto();
            }

            catch (Exception ex)
            {

                logger.LogError($"{ex} : An error trying to create education");
                throw;
            }
        }


        //<Summary>
        //Create Experience for the doctor 
        //<summary>

        public async Task<ExperienceDto> CreateExperienceAsync(CreateExperienceDto createExperienceDto, Guid doctorId)
        {
            try
            {
                var experience = await appContext.Experiences.AddAsync(createExperienceDto.ToExperienceModel(doctorId));

                await appContext.SaveChangesAsync();

                return experience.Entity.ToExperienceDto();
            } 

            catch (Exception ex)
            {

                logger.LogError($"{ex} : An error trying to create Experience");

                throw;  
            }
        }

        // <summary>
        

    }
}