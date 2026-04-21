
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

      
      
        

        // Change to PatientModel
       public static PatientModel ToPatientModel(this CreatePatientDto dto)
        {
            return new PatientModel()
            {
                User = dto.User,
                UserId = dto.User.UserId,
                MedicalHistory = dto.MedicalHistory,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone
            };
        }
   
        /// <summary>
        /// Maps CreateAdminDto to Admin
       /// </summary>
         /// <param name="createAdminDto"></param>
        /// <returns></returns>
         public static Admin ToAdmin(this CreateAdminDto createAdminDto)
          {
           return new Admin() { User = createAdminDto.User, UserId = createAdminDto.User.UserId };
         }

           public static CreatePaymentDto ToCreatePaymentDto( this TransferRequestDto transferRequestDto, Guid senderId, bool isSuccessful
  )
  {
    return new CreatePaymentDto
    {
      Amount = transferRequestDto.Amount,
      ReceiverId = transferRequestDto.ReceiverId,
      SenderId = senderId,
      PaymentProvider = transferRequestDto.PaymentProvider,
      PaymentStatus = isSuccessful ? PaymentStatus.Success : PaymentStatus.Failed,
      SenderName = transferRequestDto.SenderName,
      SenderEmail = transferRequestDto.SenderEmail,
      ReceiverName = transferRequestDto.ReceiverName,
      ReceiverEmail = transferRequestDto.ReceiverEmail,
      PaymentType = PaymentType.Transfer
    };
  }

  public static Payment ToPayment(
    this CreatePaymentDto createPaymentDto,
    string transactionReference
  )
  {
    return new Payment
    {
      Amount = createPaymentDto.Amount,
      SenderId = createPaymentDto.SenderId,
      SenderName = createPaymentDto.SenderName,
      SenderEmail = createPaymentDto.SenderEmail,
      ReceiverId = createPaymentDto.ReceiverId,
      ReceiverName = createPaymentDto.ReceiverName,
      ReceiverEmail = createPaymentDto.ReceiverEmail,
      PaymentProvider = createPaymentDto.PaymentProvider,
      PaymentStatus = PaymentStatus.Pending,
      TransactionReference = transactionReference,
      PaymentType = createPaymentDto.PaymentType
    };
  }

    

  public static ReviewModel ToReview(this CreateReviewDto createReviewDto)
  {
    return new ReviewModel
    {
      ReviewText = createReviewDto.ReviewText,
      DoctorId = createReviewDto.DoctorId,
      PatientId = createReviewDto.PatientId,
      StarRating = createReviewDto.StarRating
    };
  }

  public static Blog ToBlog(this CreateBlogDto createBlogDto)
  {
    return new Blog
    {
      AuthorId = createBlogDto.AuthorId,
      Content = createBlogDto.Content,
      Title = createBlogDto.Title,
      ImageId = createBlogDto.ImageId,
    };
  }

  public static BlogComment ToBlogComment(this CreateBlogCommentDto createBlogCommentDto)
  {
    return new BlogComment
    {
      BlogId = createBlogCommentDto.BlogId,
      CommentText = createBlogCommentDto.CommentText,
      SenderId = createBlogCommentDto.SenderId
    };
  }

  public static BlogLike ToBlogLike(this CreateBlogLikeDto createBlogLikeDto)
  {
    return new BlogLike { BlogId = createBlogLikeDto.BlogId, UserId = createBlogLikeDto.UserId };
  }

  
  public static Message ToMessage(this CreateMessageDto createMessageDto , Guid conversationId)
  {
    return new Message
    {
      MessageText = createMessageDto.MessageText,
      SenderId = createMessageDto.SenderId,
      ConversationId = createMessageDto.ConversationId
    };
  }


  
}

}