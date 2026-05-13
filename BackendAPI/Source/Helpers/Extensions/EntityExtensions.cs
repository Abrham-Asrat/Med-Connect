
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
                Languages = (doctor.Languages ?? "").Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                DoctorStatus = doctor.DoctorStatus,
                IsVerified = doctor.IsVerified

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
                Languages = (doctor.Languages ?? "").Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
                DoctorStatus = doctor.DoctorStatus,
                IsVerified = doctor.IsVerified

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
                doctorAvailability.AvailableDay.ToString(),
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
                file.MimeType,   // already stored as the MIME string e.g. "audio/webm"
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
                Languages = (doctor.Languages ?? "").Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
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
      Status = appointment.Status
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
      Status = appointment.Status
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
      Status = appointment.Status
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
      PaymentType = payment.PaymentType,
      PaymentDate = payment.CreatedAt
      
    };
  }

    public static ReviewDto ToReviewDto(this ReviewModel review)
  {
    return new ReviewDto
    {
      ReviewId = review.ReviewId,
      DoctorId = review.DoctorId,
      PatientId = review.PatientId,
      StarRating = review.StarRating,
      ReviewText = review.ReviewText,
      CreatedAt = review.CreatedAt,
      UpdatedAt = review.UpdatedAt,
      IsEdited = review.HasBeenUpdated(),
      HelpfulCount = review.HelpfulCount,
      IsPublic = review.IsPublic,
      Doctor = review.Doctor != null ? new ReviewProfileDto
      {
        Id = review.Doctor.User?.UserId ?? Guid.Empty,
        UserId = review.Doctor.User?.UserId ?? Guid.Empty,
        FirstName = review.Doctor.User?.FirstName ?? "",
        LastName = review.Doctor.User?.LastName ?? "",
        Email = review.Doctor.User?.Email ?? "",
        ProfilePicture = review.Doctor.User?.ProfilePicture ?? ""
      } : new ReviewProfileDto { Id = Guid.Empty, UserId = Guid.Empty },
      Patient = review.Patient != null ? new ReviewProfileDto
      {
        Id = review.Patient.User?.UserId ?? Guid.Empty,
        UserId = review.Patient.User?.UserId ?? Guid.Empty,
        FirstName = review.Patient.User?.FirstName ?? "",
        LastName = review.Patient.User?.LastName ?? "",
        Email = review.Patient.User?.Email ?? "",
        ProfilePicture = review.Patient.User?.ProfilePicture ?? ""
      } : new ReviewProfileDto { Id = Guid.Empty, UserId = Guid.Empty }
    };
  }

   public static ReviewSummaryDto ToReviewSummaryDto(this ReviewModel review)
  {
    return new ReviewSummaryDto
    {
      ReviewId = review.ReviewId,
      StarRating = review.StarRating,
      ReviewText = review.ReviewText,
      CreatedAt = review.CreatedAt,
      UpdatedAt = review.UpdatedAt,
      IsEdited = review.HasBeenUpdated(),
      HelpfulCount = review.HelpfulCount,
      IsPublic = review.IsPublic,
      PatientName = review.GetPatientFullName(),
      PatientProfilePicture = review.Patient?.User?.ProfilePicture ?? ""
    };
  }

  public static DoctorReviewStatsDto ToDoctorReviewStatsDto(
    this ICollection<ReviewModel> reviews,
    DoctorModel doctor,
    UserModel doctorUser
  )
  {
    if (!reviews.Any())
    {
      return new DoctorReviewStatsDto
      {
        DoctorId = doctor.DoctorId,
        DoctorName = $"{doctorUser.FirstName} {doctorUser.LastName}",
        AverageRating = 0,
        TotalReviews = 0,
        FiveStarReviews = 0,
        FourStarReviews = 0,
        ThreeStarReviews = 0,
        TwoStarReviews = 0,
        OneStarReviews = 0,
        ZeroStarReviews = 0,
        RecentReviews = new List<ReviewSummaryDto>()
      };
    }

    var averageRating = reviews.Average(r => r.StarRating);
    var totalReviews = reviews.Count;
    var fiveStarReviews = reviews.Count(r => r.StarRating == 5);
    var fourStarReviews = reviews.Count(r => r.StarRating == 4);
    var threeStarReviews = reviews.Count(r => r.StarRating == 3);
    var twoStarReviews = reviews.Count(r => r.StarRating == 2);
    var oneStarReviews = reviews.Count(r => r.StarRating == 1);
    var zeroStarReviews = reviews.Count(r => r.StarRating == 0);

    var recentReviews = reviews
      .OrderByDescending(r => r.CreatedAt)
      .Take(5)
      .Select(r => r.ToReviewSummaryDto())
      .ToList();

    return new DoctorReviewStatsDto
    {
      DoctorId = doctor.DoctorId,
      DoctorName = $"{doctorUser.FirstName} {doctorUser.LastName}",
      AverageRating = Math.Round(averageRating, 1),
      TotalReviews = totalReviews,
      FiveStarReviews = fiveStarReviews,
      FourStarReviews = fourStarReviews,
      ThreeStarReviews = threeStarReviews,
      TwoStarReviews = twoStarReviews,
      OneStarReviews = oneStarReviews,
      ZeroStarReviews = zeroStarReviews,
      RecentReviews = recentReviews
    };
  }

  public static PatientReviewHistoryDto ToPatientReviewHistoryDto(
    this ICollection<ReviewModel> reviews,
    PatientModel patient,
    UserModel patientUser
  )
  {
    if (!reviews.Any())
    {
      return new PatientReviewHistoryDto
      {
        PatientId = patient.PatientId,
        PatientName = $"{patientUser.FirstName} {patientUser.LastName}",
        TotalReviewsPosted = 0,
        AverageRatingGiven = 0,
        Reviews = new List<ReviewSummaryDto>()
      };
    }

    var totalReviewsPosted = reviews.Count;
    var averageRatingGiven = reviews.Average(r => r.StarRating);

    var reviewSummaries = reviews
      .OrderByDescending(r => r.CreatedAt)
      .Select(r => r.ToReviewSummaryDto())
      .ToList();

    return new PatientReviewHistoryDto
    {
      PatientId = patient.PatientId,
      PatientName = $"{patientUser.FirstName} {patientUser.LastName}",
      TotalReviewsPosted = totalReviewsPosted,
      AverageRatingGiven = Math.Round(averageRatingGiven, 1),
      Reviews = reviewSummaries
    };
  }

    public static BlogDto ToBlogDto(
    this Blog blog,
    UserModel author,
    ICollection<BlogLike> blogLikes,
    ICollection<Tag> tags,
    ICollection<BlogComment> comments
  )
  {
    return new BlogDto
    {
      Author = author.ToBlogProfileDto(),
      AuthorId = author.UserId,
      BlogId = blog.BlogId,
      BlogLikes = blogLikes
        .Select(bl =>
          bl.ToBlogLikeDto(
            bl.User ?? throw new Exception("You forgot to include user when querying blogLikes.")
          )
        )
        .ToList(),
      Comments = comments
        .Select(bc => 
           bc.ToBlogCommentDto(bc.Sender ?? throw new Exception("You forgot to include sender when querying comments."))
        )
        .ToList(),
      Content = blog.Content,
      Title = blog.Title,
      ImageId = blog.ImageId,
      ImageUrl = blog.Image?.Url,
      CreatedAt = blog.CreatedAt,
      Tags = tags.Select(t => t.TagName).ToList()
    };
  }

  public static IProfileDto ToBlogProfileDto(this UserModel user)
  {
    return new BlogProfileDto
    {
      Email = user.Email,
      FirstName = user.FirstName,
      LastName = user.LastName,
      UserId = user.UserId,
      ProfilePicture = user.ProfilePicture ?? ""
    };
  }

   public static BlogCommentDto ToBlogCommentDto(this BlogComment blogComment, UserModel sender)
  {
    return new BlogCommentDto
    {
      BlogCommentId = blogComment.BlogCommentId,
      BlogId = blogComment.BlogId,
      CommentText = blogComment.CommentText,
      SenderId = blogComment.SenderId,
      Sender = sender.ToBlogProfileDto(),
      ParentCommentId = blogComment.ParentCommentId,
      CreatedAt = blogComment.CreatedAt,
      Replies = blogComment.Replies != null 
        ? blogComment.Replies.Select(r => r.ToBlogCommentDto(r.Sender ?? throw new Exception("Include sender for replies"))).ToList()
        : new List<BlogCommentDto>()
    };
  }

  public static BlogLikeDto ToBlogLikeDto(this BlogLike blogLike, UserModel liker)
  {
    return new BlogLikeDto(
      blogLike.BlogLikeId,
      blogLike.UserId,
      blogLike.BlogId,
      liker.ToBlogProfileDto()
    );
  }

    public static MessageDto ToMessageDto(
    this Message message,
    ICollection<FileModel>? files
  )
  {
    return new MessageDto(
      message.MessageId,
      message.ConversationId,
      message.SenderId,
      message.MessageText,
      files != null ? files.Select(f => f.ToFileDto()).ToList() : [],
      message.Type,
      message.IsRead,
      message.AudioUrl,
      message.AudioDuration,
      message.PrescriptionDetails != null ? new PrescriptionDto(
        message.PrescriptionDetails.PrescriptionId,
        message.PrescriptionDetails.Medication,
        message.PrescriptionDetails.Dosage,
        message.PrescriptionDetails.Frequency,
        message.PrescriptionDetails.Duration
      ) : null,
      message.CreatedAt
    );
  }

   public static IProfileDto ToConversationProfileDto(this UserModel user)
  {
    return new ConversationProfileDto
    {
      Email = user.Email,
      FirstName = user.FirstName,
      LastName = user.LastName,
      UserId = user.UserId,
      ProfilePicture = user.ProfilePicture ?? "",
      Role = user.Role.ToString()
    };
  }

   public static IConversationDto ToConversationDto(
    this Conversation conversation,
    ICollection<UserModel> participants
  )
  {
    return new ConversationDtoBase
    {
      ConversationId = conversation.ConversationId,
      Participants = participants.Select(u => u.ToConversationProfileDto()).ToList(),
      LastMessageAt = conversation.LastMessageAt,
      Status = conversation.Status.ToString().ToLower()
    };
  }

    }
}
