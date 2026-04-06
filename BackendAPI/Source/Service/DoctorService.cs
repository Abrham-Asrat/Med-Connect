using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Models.Enums;

using BackendAPI.Source.Helpers.Extensions;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Source.Models.Responses;
using BackendAPI.Source.Models.Interface;

namespace BackendAPI.Source.Service
{
    public class DoctorService(
        ApplicationDbContext appContext,
        ILogger<DoctorService> logger,
    DoctorSpecialtyService doctorSpecialtyService,
    SpecialtyService specialtyService

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
                               StartTime = new TimeOnly(10, 0),
                               EndTime = new TimeOnly(10, 0),
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

        public async Task<List<EducationModel>> GetDoctorEducationsAsync(Guid doctorId)
        {
            try
            {
                return await appContext.Educations.Where(e => e.DoctorId == doctorId).ToListAsync();
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex} : An error trying to get doctor educations for DoctorId: {doctorId}");
                throw;
            }
        }
        public async Task<List<ExperienceModel>> GetDoctorExperiencesAsync(Guid doctorId)
        {
            try
            {
                return await appContext.Experiences.Where(e => e.DoctorId == doctorId).ToListAsync();
            }
            catch (Exception ex)
            {
                logger.LogError($"{ex} : An error trying to get doctor experiences for DoctorId: {doctorId}");
                throw;
            }
        }
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

        // Retrieves Doctor profile of the doctor with in specified userid 
        public async Task<DoctorProfileDto> GetDoctorProfileAsync(Guid userId)
        {
            try
            {
                var doctor = await appContext.Doctors.Where(d => d.UserId == userId).Include(d => d.User).Include(d => d.DoctorAvailabilities).Include(d => d.DoctorSpecialties).Include(d => d.Educations).Include(d => d.Experiences).SingleOrDefaultAsync();

                if (doctor == null)
                {
                    throw new KeyNotFoundException("Doctor with this user Id is not Found, Couldn't retrieve profile information ");
                }

                return doctor.ToDoctorProfileDto(
                    doctor.User,
                    doctor.DoctorAvailabilities,
                    doctor.DoctorSpecialties.Where(ds => ds.Specialty != null).Select(ds => ds.Specialty!).ToList(),
                    doctor.Educations,
                    doctor.Experiences
                );


            }
            catch (Exception ex)
            {
                logger.LogInformation(ex, "Failed to get doctor Profile");

                throw new Exception("Failed To get doctor Profile");
            }
        }

            public async Task<DoctorProfileDto> UpdateDoctorProfileAsync(UpdateDoctorProfileDto updateProfileDto)
        {
            try
            {
                var doctor = await appContext.Doctors.Include(d => d.User).Include(d => d.DoctorSpecialties).ThenInclude(d => d.Specialty).Include(d => d.DoctorAvailabilities).Include(d => d.Educations).Include(d => d.Experiences).FirstOrDefaultAsync(d => d.UserId == updateProfileDto.UserId);

                if (doctor == null)
                {
                    throw new KeyNotFoundException("Doctor with this user Id is not Found, Couldn't update profile information ");
                }


                // create new specialties if provided in the updateProfileDto, and get the list of specialties to be updated for the doctor

                var specialties = updateProfileDto.Specialties != null ? await specialtyService.CreateSpecialtiesAsync(updateProfileDto.Specialties.ToSpecialtyList(doctor.DoctorId)) : null;


                var DoctorSpecialties = specialties != null ? await doctorSpecialtyService.CreateDoctorSpecialtiesAsync(specialties.Select(s => s.ToCreateDoctorSpecialtyDto(doctor)).ToList()) : null;

                var availabilities = updateProfileDto.Availabilities != null ? await AddDoctorAvailabilitiesAsync(updateProfileDto.Availabilities, doctor) : null;

                // updates 
                doctor.DoctorSpecialties = DoctorSpecialties ?? doctor.DoctorSpecialties;

                doctor.Qualifications = updateProfileDto.Qualifications ?? doctor.Qualifications;

                doctor.DoctorStatus = updateProfileDto.DoctorStatus != null ? updateProfileDto.DoctorStatus.ConvertToEnum<DoctorStatus>() : doctor.DoctorStatus;

                doctor.Biography = updateProfileDto.Biography ?? doctor.Biography;

                doctor.DoctorAvailabilities = availabilities != null ? availabilities ?? doctor.DoctorAvailabilities : doctor.DoctorAvailabilities;

                if (updateProfileDto.Educations != null)
                {
                    await DeleteAllEducationAsync(doctor.DoctorId);

                    foreach (UpdateEducationDto dto in updateProfileDto.Educations)
                    {
                        await CreateEducationAsync(new CreateEducationDto
                        (
                            dto.Degree!,
                            dto.Institution!,
                            dto.GraduationDate!
                        ),
                          doctor.DoctorId
                        );
                    }
                }

                if(updateProfileDto.Experiences != null)
                {
                    await DeleteAllExperiencesAsync(doctor.DoctorId);

                    foreach (UpdateExperienceDto dto in updateProfileDto.Experiences)
                    {
                        await CreateExperienceAsync(new CreateExperienceDto
                        (
                            dto.Institution!,
                            dto.Position!,
                            dto.StartDate!,
                            dto.EndDate!,
                            dto.Description!
                            
                        ),
                          doctor.DoctorId
                        );
                    }
                }

               await appContext.SaveChangesAsync();

               return doctor.ToDoctorProfileDto(
                doctor.User,
                doctor.DoctorAvailabilities,
                doctor.DoctorSpecialties.Where(s => s != null).Select(ds=> ds.Specialty!).ToList(), doctor.Educations, doctor.Experiences
               );

            }
            catch (System.Exception ex)
            {
                logger.LogInformation($"{ex}: An error occurred trying to edit doctor");
                throw new Exception("Error Occured trying to update Doctor");
            }
        }





        // <summary>
        // Delete all doctor data related to the .
        // <summary>

        public async Task DeleteAllEducationAsync(Guid doctorId)
        {
            try
            {
                var educations = appContext.Educations.Where(e => e.DoctorId == doctorId);

                if (!educations.Any())
                {
                    throw new KeyNotFoundException($"Doctor with id {doctorId} has no education to delete");

                }

                appContext.Educations.RemoveRange(educations);
                await appContext.SaveChangesAsync();
            }
            catch (System.Exception ex)
            {
                logger.LogError($"{ex} : An error occurred while trying to delete educations for doctor with id {doctorId}");
                throw new Exception("Failed to delete doctor educations");
            }
        }
        public async Task DeleteAllExperiencesAsync(Guid doctorId)
        {
            try
            {
                var experiences = appContext.Experiences.Where(e => e.DoctorId == doctorId);

                if (!experiences.Any())
                {
                    throw new KeyNotFoundException($"Doctor with id {doctorId} has no experiences to delete");
                }

                appContext.Experiences.RemoveRange(experiences);
                await appContext.SaveChangesAsync();
            }
            catch (System.Exception ex)
            {
                logger.LogError($"{ex} : An error occurred while trying to delete experiences for doctor with id {doctorId}");
                throw new Exception("Failed to delete doctor experiences");
            }
        }


    //    <Summary>
    //    Get all doctors in the system
    //    </Summary>

       public async Task<ServiceResponse<List<DoctorProfileDto>>> GetAllDoctors()
        {
            try
            {
                List<DoctorProfileDto> doctorUsers = await appContext.Doctors.Include(d=> d.User).Include(d=> d.DoctorSpecialties).ThenInclude(ds=>ds.Specialty).Include(d=> d.Educations).Include(d=> d.Experiences).Select(d=> d.ToDoctorProfileDto(
                    d.User,
                    d.DoctorAvailabilities,
                    d.DoctorSpecialties.Where(ds => ds.Specialty != null).Select(ds => ds.Specialty!).ToList(),
                    d.Educations,
                    d.Experiences
                )).ToListAsync();
                return new ServiceResponse<List<DoctorProfileDto>>(true,200, doctorUsers, "Doctors fetched successfully");

            }
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors.");

                throw new Exception("An error occurred while fetching doctors");
            }
        }
        


        // <Summary>
        // Get doctors by gender
        // </Summary>

        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsByGenderAsync(Gender gender)
        {
            try
            {
                var doctorUsers = await appContext.Doctors.Include(d=> d.User).Include(d=> d.DoctorSpecialties).ThenInclude(ds=>ds.Specialty).Where(d=> d.User.Gender == gender).Select(d=> d.ToDoctorDto(d.User, d.DoctorSpecialties.Select(ds => ds.Specialty!).ToList())).ToListAsync();
                
                return new ServiceResponse<List<DoctorDto>>(true,200, doctorUsers, "Doctors fetched successfully");
            }
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors by gender.");
                throw new Exception("An error occurred while fetching doctors by gender");
            }

            
        }

        // <Summary>
        // Get doctors by specialty name
        // </Summary>
        public async Task<ServiceResponse<List<DoctorDto>>> GetDoctorsBySpecialtyAsync(string specialtyName)
        {
            try
            {
                var doctorUsers = await appContext.Doctors.Include(d => d.User).Include(d => d.DoctorSpecialties).ThenInclude(ds => ds.Specialty).Where(ds => ds.DoctorSpecialties.Where(ds=> ds.Specialty != null).Any(ds=> EF.Functions.Like(ds.Specialty!.SpecialtyName, $"%{specialtyName}%"))).Select(d=> d.ToDoctorDto(d.User, d.DoctorSpecialties.Select(ds => ds.Specialty!).ToList())).ToListAsync();


                return new ServiceResponse<List<DoctorDto>>(true, 200, doctorUsers, "Doctors fetched successfully");
            }
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors by specialty.");
                throw new Exception("An error occurred while fetching doctors by specialty");
            }
        }
        // <Summary>
        // Get doctors by  name
        // </Summary>
        public async Task<ServiceResponse<List<DoctorDto>>>GetDoctorsByNameAsync(string doctorName)
        {
            try
            {
                var doctorUsers = await appContext.Doctors.Include(d => d.User).Include(d => d.DoctorSpecialties).ThenInclude(ds => ds.Specialty).Where(d => d.DoctorSpecialties.Any(ds => EF.Functions.Like(d.User.FirstName + " " + d.User.LastName, $"{doctorName}%"))).Select(d => d.ToDoctorDto(d.User, d.DoctorSpecialties.Select(ds => ds.Specialty!).ToList())).ToListAsync();


                return new ServiceResponse<List<DoctorDto>>(true, 200, doctorUsers, "Doctors fetched successfully");
            }
            catch (System.Exception)
            {
                logger.LogError("An error occurred while fetching doctors by specialty.");
                throw new Exception("An error occurred while fetching doctors by specialty");
            }
        }
        
        // <Summary>
        // Get doctor availability for doctor along with the time the are available at that day
        // </Summary>
        public async Task<Dictionary<DayOfWeek, List<AppointmentTimeRange>>> GetDoctorAvailabilitiesAsync(Guid doctorId)
        {
            try
            {
                if(!await CheckDoctorExists(doctorId))
                {
                    throw new KeyNotFoundException($"Doctor with id {doctorId} is not found");
                }

                var dayTimesMap = new Dictionary<DayOfWeek, List<AppointmentTimeRange>>();

                await appContext.DoctorAvailabilities.Where(da => da.DoctorId == doctorId).ForEachAsync(da =>
                {
                    if(!dayTimesMap.ContainsKey(da.AvailableDay))
                        dayTimesMap[da.AvailableDay] = [];

                    dayTimesMap[da.AvailableDay].Add(new AppointmentTimeRange(da.StartTime, da.EndTime));
                       
                });

                return dayTimesMap;
            }
            catch (System.Exception)
            {
                
                throw;
            }
        }

        public async Task<bool> CheckDoctorExists(Guid doctorId)
        {
            try
            {
                var doctor = await appContext.Doctors.FindAsync(doctorId);

                return doctor != null;
            }
            catch (System.Exception)
            {
                logger.LogError($"An error occurred while checking if doctor with id {doctorId} exists.");
                throw;
            }
        }

       

    }
}
