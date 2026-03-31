
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class DtoExtensions
    {

        /// Maps RegisterUserDto to User,
        public static UserModel ToUserModel(this RegisterUserDto dto)
        {
            return new UserModel
            {
                
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                Gender = dto.Gender.ConvertToEnum<Gender>(),

                Role = dto.Role.ConvertToEnum<Role>(),
                DateOfBirth = dto.DateOfBirth.ConvertTo<DateOnly>()
            };
        }   

     

         // Doctor Dto to Doctor Models
         public static DoctorModel ToDoctorModel(this CreateDoctorDto dto, Guid doctorPreferenceId)
         {
             return new DoctorModel()
             {
                 User = dto.User,
                 UserId = dto.User.UserId,
                 Qualifications = dto.Qualifications,
                 Biography = dto.Biography,
                 DoctorStatus = dto.DoctorStatus,
                 CvId = dto.Cv.FileId,
                 Cv = dto.Cv,
                 DoctorPreferenceId = doctorPreferenceId
             };
         }

         public static SpecialtyModel ToSpecialtyModel (this CreateSpecialtyDto dto)
        {
            return new SpecialtyModel()
            {
                SpecialtyName = dto.SpecialtyName
            };
        }

        public static DoctorSpecialtyModel ToDoctorSpecialty (this CreateDoctorSpecialtyDto createDoctorSpecialtyDto, Guid DoctorId , Guid SpecialtyId)
        {
            return new DoctorSpecialtyModel()
            {
                DoctorId = DoctorId, 
                SpecialtyId = SpecialtyId
            };
        }
       
     
       public static FileModel ToFileModel (this CreateFileDto fileDto)
        {
            return new FileModel()
            {
                FileName = fileDto.FileName,
                FileData = FileHelper.ToByteStream(fileDto.FileDataBase64),
                MimeType = fileDto.MimeType
            };
        }
       
       public static EducationModel ToEducationModel(this CreateEducationDto dto, Guid doctorId)
       {
           return new EducationModel()
           {
               Degree = dto.Degree,
               Institution = dto.Institution,
               GraduationDate = dto.GraduationDate.ConvertTo<DateTime>(),
               DoctorId = doctorId
           };
       }

       public static ExperienceModel ToExperienceModel(this CreateExperienceDto dto, Guid doctorId)
       {
           return new ExperienceModel()
           {
               Institution = dto.Institution,
               Position = dto.Position,
               StartDate = dto.StartDate.ConvertTo<DateTime>(),
               EndDate = dto.EndDate == null ? null : dto.EndDate.ConvertTo<DateTime>(),
               Description = dto.Description,
               DoctorId = doctorId
           };
       }

       public static ReviewModel ToReviewModel(this CreateReviewDto dto, Guid doctorId, Guid userId)
       {
           return new ReviewModel()
           {
               Comment = dto.Comment,
               Rating = dto.Rating,
               DoctorId = doctorId,
            //    PatientId = PatientId
           };
       }
   
   
   
    }
}