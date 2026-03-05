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
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

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
        // Get Doctor Availabilities by DoctorId

        public async Task<List<DoctorAvailabilityModel>> AddDoctorAvailabilitiesAsync(List<DoctorAvailabilityDto> doctorAvailabilities, DoctorModel doctor)
        {
            try
            {
                List<DoctorAvailabilityModel> dbDoctorAvailabilities = [];

                if (doctorAvailabilities.Count == 0)
                {
                    foreach (DayOfWeek day in new List<DayOfWeek>{
                    DayOfWeek.Monday,
                    DayOfWeek.Tuesday,
                    DayOfWeek.Wednesday,
                    DayOfWeek.Thursday,
                    DayOfWeek.Friday,
                    DayOfWeek.Saturday,
                    DayOfWeek.Sunday
                    })
                    {
                        dbDoctorAvailabilities.Add(
                           new DoctorAvailabilityModel
                           {
                               Doctor = doctor,
                               DoctorId = doctor.DoctorId,
                               AvailableDay = day,
                               StartTime =new TimeOnly(10, 0),
                               EndTime =new TimeOnly(10, 0),
                           });

                    }
                }
                else
                {
                    foreach (var (day, startTime, endTime) in doctorAvailabilities)
                    {
                        dbDoctorAvailabilities.Add(
                            new DoctorAvailabilityModel
                            {
                                Doctor = doctor, 
                                DoctorId = doctor.DoctorId,
                                AvailableDay = day.ConvertToEnum<DayOfWeek>(),
                                StartTime = TimeOnly.Parse(startTime),
                                EndTime = TimeOnly.Parse(endTime)
                            }
                        );
                    }
                }

                await appContext.DoctorAvailabilities.AddRangeAsync(dbDoctorAvailabilities);

                await appContext.SaveChangesAsync();
                return dbDoctorAvailabilities;
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex} : An error trying to get doctor availabilities for DoctorId: {doctor.DoctorId}");
                throw;
            }
        }
        

        // instead of having separate methods for each type of doctor data (education, experience, etc), we can have a generic method that takes the type as a parameter and uses reflection to query the correct DbSet based on the type. This way, we can reduce code duplication and make it easier to maintain.

        // public async Task<List<EducationModel>> GetDoctorEducationsAsync(Guid doctorId)
        // {
        //     try
        //     {
        //         return await appContext.Educations.Where(e => e.DoctorId == doctorId).ToListAsync();       
        //     }
        //     catch (Exception ex)
        //     {
        //         logger.LogError($"{ex} : An error trying to get doctor educations for DoctorId: {doctorId}");
        //         throw;
        //     }
        // }
        public async Task<List<T>> GetDataAsync<T>(Guid doctorId) where T : class
        {
            try
            {
                return await appContext.Set<T>().Where(e => EF.Property<Guid>(e, "DoctorId") == doctorId).ToListAsync();  
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex} : An error trying to get doctor data for DoctorId: {doctorId}");
                throw;
            }
        }



    }
}