
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Dtos;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class DtoExtensions
    {

        /// Maps RegisterUserDto to User,
        public static UserModel ToUser(this RegisterUserDto dto, string auth0Id)
        {
            return new UserModel
            {
                Auth0Id = auth0Id, // ✅ Comes ONLY from validated token
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email, // Set Email property as required
                Phone = dto.Phone,
                Address = dto.Address,
                Gender = Enum.Parse<Gender>(dto.Gender, true),
                Role = Enum.Parse<Role>(dto.Role, true),
                DateOfBirth = DateOnly.Parse(dto.DateOfBirth)
            };
        }

        public static ProfileDto ToProfileDto(this UserModel user)
        {
            return new ProfileDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                Address = user.Address ?? string.Empty,
                Gender = user.Gender,
                Role = user.Role,
                DateOfBirth = user.DateOfBirth,
                ProfilePicture = user.ProfilePicture // Ensure this property exists in UserModel
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

         public static SpecialtyModel ToSpecialty (this CreateSpecialtyDto dto)
        {
            return new SpecialtyModel()
            {
                SpecialtyName = dto.SpecialtyName
            };
        }

        public static DoctorSpecialtyModel ToDoctorSpecialty (this Guid DoctorId , Guid SpecialtyId)
        {
            return new DoctorSpecialtyModel()
            {
                DoctorId = DoctorId,
                SpecialtyId = SpecialtyId
            };
        }
       

       public static FileModel ToFile (this CreateFileDto fileDto)
        {
            return new FileModel()
            {
                FileName = fileDto.FileName,
                FileData = FileHelper.ToBeStream(fileDto.FileDataBase64),
                MimeType = fileDto.MimeType
            };
        }
  
    }
}