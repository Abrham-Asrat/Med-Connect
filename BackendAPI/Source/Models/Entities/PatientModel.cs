using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class PatientModel
    {
        public Guid PatientId { get; set; }

        [Required]
        public required Guid UserId { get; set; }// fk

        public string? MedicalHistory { get; set; }     
        public string? EmergencyContactName{ get; set; }
        public string? EmergencyContactPhone {get;set;}

        public UserModel? User { get; set; }
        public virtual ICollection<AppointmentModel> Appointments { get; set; } = new HashSet<AppointmentModel>(); 
        public virtual ICollection<ReviewModel> Reviews{ get; set; } = new HashSet<ReviewModel>(); 


    }
}