using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Enums;


namespace BackendAPI.Source.Models.Entities
{
    public class DoctorModel
    {
        public Guid DoctorId { get; set; } = Guid.NewGuid();

        [Required]
        public required Guid UserId { get; set; }

        [Required]
        public required string Qualifications { get; set; }

        [Required]
        public required string Biography { get; set; }

        public DoctorStatus DoctorStatus { get; set; } = DoctorStatus.Active;

        // Doctor will be verified by staff, by default it is false
        public bool IsVerified { get; set; } = false;

        public required Guid DoctorPreferenceId { get; set; }
        public virtual DoctorPreference? DoctorPreference { get; set; }

        public  required Guid CvId { get; set; }
        public virtual FileModel? Cv { get; set; }

        public virtual required UserModel User {get;set;}

        public virtual ICollection<DoctorSpecialtyModel> DoctorSpecialties { get; set; } = new HashSet<DoctorSpecialtyModel>();

        public ICollection<AppointmentModel> Appointments { get; set; } = new HashSet<AppointmentModel>();
        public ICollection<EducationModel> Educations { get; set; } = new HashSet<EducationModel>();
        public ICollection<ExperienceModel> Experiences { get; set; } = new HashSet<ExperienceModel>();
        public ICollection<ReviewModel> Reviews { get; set; } = new HashSet<ReviewModel>();

    }
}