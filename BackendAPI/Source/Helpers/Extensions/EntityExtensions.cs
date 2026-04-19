
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers;
using BackendAPI.Source.Models.Enums;
using Microsoft.Identity.Client;
using Microsoft.OpenApi.Extensions;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class EntityExtensions
    {



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

        public static CreateDoctorDto ToCreateDoctorDto(this RegisterUserDto registerUserDto, UserModel user, FileModel cv, List<CreateEducationDto>? createEducationDto, List<CreateExperienceDto>? createExperienceDto, DoctorStatus doctorStatus = DoctorStatus.Active)
        {
            // backend expects non-null lists; caller may have omitted fields in JSON
            createEducationDto ??= new List<CreateEducationDto>();
            createExperienceDto ??= new List<CreateExperienceDto>();

            return new CreateDoctorDto
            {
                User = user,
                Biography = registerUserDto.Biography ?? "None",
                Qualifications = registerUserDto.Qualifications ?? "None",
                Cv = cv,
                Educations = createEducationDto,
                Experiences = createExperienceDto,
                OnlineAppointmentFee = registerUserDto.OnlineAppointmentFee,
                InPersonAppointmentFee = registerUserDto.InPersonAppointmentFee,
                DoctorStatus = doctorStatus
            };
        }

        public static DoctorProfileDto ToDoctorProfileDto(this DoctorModel doctor, UserModel user,
        ICollection<DoctorAvailabilityModel> availabilities,
        ICollection<SpecialtyModel> specialties, ICollection<EducationModel> educations, ICollection<ExperienceModel> experiences)
        {
            return new DoctorProfileDto
            {
                // for user common 
                UserId = user.UserId,
                FirstName = user.FirstName,
                Email = user.Email,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture ?? "",
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address ?? "",
                Role = user.Role,


                // For Doctor specified 
                DoctorId = doctor.DoctorId,
                Specialties = specialties.Select(s => s.ToSpecialtyDto()).ToList(),
                Availabilities = availabilities.Select(a => a.ToAvailabilityDto()).ToList(),
                Educations = educations.Select(e => e.ToEducationDto()).ToList(),
                Experiences = experiences.Select(e => e.ToExperienceDto()).ToList(),
                Qualifications = doctor.Qualifications,
                Biography = doctor.Biography,
                DoctorStatus = doctor.DoctorStatus

            };
        }

        public static DoctorProfileDto ToDoctorProfileDto(this  UserModel user , DoctorModel doctor,
        ICollection<DoctorAvailabilityModel> availabilities,
        ICollection<SpecialtyModel> specialties, ICollection<EducationModel> educations, ICollection<ExperienceModel> experiences)
        {
            return new DoctorProfileDto
            {
                // for user common 
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture ?? "",
                Email = user.Email,
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address ?? "",
                Role = user.Role,


                // For Doctor specified 
                DoctorId = doctor.DoctorId,
                Specialties = specialties.Select(s => s.ToSpecialtyDto()).ToList(),
                Availabilities = availabilities.Select(a => a.ToAvailabilityDto()).ToList(),
                Educations = educations.Select(e => e.ToEducationDto()).ToList(),
                Experiences = experiences.Select(e => e.ToExperienceDto()).ToList(),
                Qualifications = doctor.Qualifications,
                Biography = doctor.Biography,
                DoctorStatus = doctor.DoctorStatus

            };
        }

        public static string ToSpecialtyDto(this SpecialtyModel specialty)
        {
            return specialty.SpecialtyName;
        }

        public static DoctorAvailabilityDto ToAvailabilityDto(this DoctorAvailabilityModel doctorAvailability)
        {
            return new DoctorAvailabilityDto
            (
                doctorAvailability.AvailableDay.GetDisplayName(),
                doctorAvailability.StartTime.ToString(),
                doctorAvailability.EndTime.ToString()

            );
        }
        public static EducationDto ToEducationDto(this EducationModel education)
        {
            return new EducationDto
            (
                education.EducationId,
                education.Degree,
                education.Institution,
                education.GraduationDate,
                education.DoctorId

            );
        }

        public static FileDto ToFileDto(this FileModel file)
        {
            return new FileDto
            (
                file.FileId,
                Mime.GetReverseMime(file.MimeType),
                FileHelper.ToBase64(file.FileData),
                file.FileName,
                file.FileSize
            );
        }

        public static CreateDoctorSpecialtyDto ToCreateDoctorSpecialtyDto(this SpecialtyModel specialty, DoctorModel doctor)
        {
            return new CreateDoctorSpecialtyDto
            {
                
                DoctorId = doctor.DoctorId,
                SpecialtyId = specialty.SpecialtyId
            };
            
        }

        public static DoctorDto ToDoctorDto(this DoctorModel doctor, UserModel user, ICollection<SpecialtyModel> specialties)
        {
            return new DoctorDto
            {
                UserId = user.UserId,
                DoctorId = doctor.DoctorId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsEmailVerified = user.IsEmailVerified,
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address ?? "",
                SpecialtyModel = specialties.Select(s => s.ToSpecialtyDto()).ToList(),
                Qualifications = doctor.Qualifications,
                Biography = doctor.Biography,
                DoctorStatus = doctor.DoctorStatus,

                ProfilePicture = user.ProfilePicture ?? "",
            };
        }

        public static PatientDto ToPatientDto(this PatientModel patient, UserModel user)
        {
            return new PatientDto
            {
                UserId = user.UserId,
                PatientId = patient.PatientId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                IsEmailVerified = user.IsEmailVerified,
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                ProfilePicture = user.ProfilePicture ?? "",
                Address = user.Address ?? "",
                MedicalHistory = patient.MedicalHistory ?? "",
                EmergencyContactName = patient.EmergencyContactName ?? "",
                EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
            };

        }

        // Patient Profile dto 
        public static PatientProfileDto ToPatientProfileDto(this UserModel user , PatientModel patient)
        {
            return new PatientProfileDto
            {
                UserId = user.UserId,
                PatientId = patient.PatientId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone, 
                Role = user.Role,
                Gender = user.Gender,
                Address = user.Address ?? "",
                DateOfBirth = user.DateOfBirth,
                ProfilePicture = user.ProfilePicture ?? "",
                MedicalHistory = patient.MedicalHistory ?? "",
                EmergencyContactName = patient.EmergencyContactName ?? "",
                EmergencyContactPhone = patient.EmergencyContactPhone ?? ""
                

            };
        }
        public static CreatePatientDto ToCreatePatientDto(this RegisterUserDto registerUserDto, UserModel user)
        {
            return new CreatePatientDto
            {
                User = user,
                EmergencyContactName = registerUserDto.EmergencyContactName,
                EmergencyContactPhone = registerUserDto.EmergencyContactPhone,
                MedicalHistory = registerUserDto.MedicalHistory
           };
        }

         public static CreateAdminDto ToCreateAdminDto(this RegisterUserDto registerUserDto, UserModel user)
        {
             return new CreateAdminDto { User = user };
        }
        public static ProfileDto ToProfileDto(this UserModel user)
        {
            return new ProfileDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                ProfilePicture = user.ProfilePicture ?? "",
                Phone = user.Phone,
                Gender = user.Gender,
                DateOfBirth = user.DateOfBirth,
                Address = user.Address ?? "",
                Role = user.Role
    };
  }

 public static PatientProfileDto ToPatientProfileDto(this PatientModel patient, UserModel user)
  {
    return new PatientProfileDto
    {
      UserId = user.UserId,
      PatientId = patient.PatientId,
      Address = user.Address ?? "",
      DateOfBirth = user.DateOfBirth,
      Email = user.Email,
      FirstName = user.FirstName,
      Gender = user.Gender,
      LastName = user.LastName,
      Phone = user.Phone,
      ProfilePicture = user.ProfilePicture ?? "",
      Role = user.Role,
      EmergencyContactName = patient.EmergencyContactName ?? "",
      EmergencyContactPhone = patient.EmergencyContactPhone ?? "",
      MedicalHistory = patient.MedicalHistory ?? ""
    };
  }

  
  public static AppointmentDto ToAppointmentDto(
    this Appointment appointment,
    DoctorModel doctor,
    PatientModel patient,
    UserModel doctorUser,
    UserModel patientUser,
    ICollection<SpecialtyModel> specialties
  )
  {
    return new AppointmentDto
    {
      AppointmentId = appointment.AppointmentId,
      Doctor = doctor.ToDoctorDto(doctorUser, specialties),
      Patient = patient.ToPatientDto(patientUser),
      AppointmentDate = appointment.AppointmentDate,
      AppointmentTime = appointment.AppointmentTime,
      AppointmentType = appointment.AppointmentType,
    };
  }

  public static AppointmentDto ToAppointmentDto(
    this Appointment appointment,
    PatientModel patient,
    UserModel patientUser
  )
  {
    return new AppointmentDto
    {
      AppointmentId = appointment.AppointmentId,
      Patient = patient.ToPatientDto(patientUser),
      AppointmentDate = appointment.AppointmentDate,
      AppointmentTime = appointment.AppointmentTime,
      AppointmentType = appointment.AppointmentType,
    };
  }

  public static AppointmentDto ToAppointmentDto(
    this Appointment appointment,
    DoctorModel doctor,
    UserModel doctorUser,
    ICollection<SpecialtyModel> specialties
  )
  {
    return new AppointmentDto
    {
      AppointmentId = appointment.AppointmentId,
      Doctor = doctor.ToDoctorDto(doctorUser, specialties),
      AppointmentDate = appointment.AppointmentDate,
      AppointmentTime = appointment.AppointmentTime,
      AppointmentType = appointment.AppointmentType,
    };
  }


  public static PaymentDto ToPaymentDto(this Payment payment)
  {
    return new PaymentDto
    {
      PaymentId = payment.PaymentId,
      SenderId = payment.SenderId,
      ReceiverId = payment.ReceiverId,
      Amount = payment.Amount,
      PaymentStatus = payment.PaymentStatus,
      PaymentProvider = payment.PaymentProvider,
      SenderName = payment.SenderEmail,
      SenderEmail = payment.SenderEmail,
      ReceiverName = payment.ReceiverName,
      ReceiverEmail = payment.ReceiverEmail,
      PaymentType = payment.PaymentType
    };
  }

    }
}
