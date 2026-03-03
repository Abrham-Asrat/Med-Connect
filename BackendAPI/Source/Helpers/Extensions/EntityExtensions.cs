using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using Microsoft.Identity.Client;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class EntityExtensions
    {

        public static EducationDto ToEducationDto(this EducationModel education)
        {
            return new EducationDto(
                education.EducationId,
                education.Degree,
                education.Institution,
                education.GraduationDate,
                education.DoctorId
            );
        }
        public static ExperienceDto ToExperienceDto(this ExperienceModel experience)
        {
            return new ExperienceDto(

               experience.ExperienceId,

               experience.Institution,
               experience.Position,
               experience.StartDate,
               experience.EndDate,
               experience.Description,
               experience.DoctorId
            );
        }
        
        public static CreateDoctorDto ToCreateDoctorDto (this RegisterUserDto registerUserDto, UserModel user , FileModel cv , List<CreateEducationDto> createEducationDto , List<CreateExperienceDto> createExperienceDto)
        {
            return new CreateDoctorDto
            {
                User = user ,
                Biography = registerUserDto.Biography?? "None",
                Qualifications = registerUserDto.Qualifications?? "None",
                Cv = cv ,
                Educations =createEducationDto,
                Experiences = createExperienceDto,
                OnlineAppointmentFee = registerUserDto.OnlineAppointmentFee,
                InPersonAppointmentFee = registerUserDto.InPersonAppointmentFee
            };
        }
    }
}