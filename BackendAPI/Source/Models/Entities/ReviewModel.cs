using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities
{
    public class ReviewModel : BaseEntity
    {
        public Guid ReviewId { get; set; } = Guid.NewGuid();
        public required string Comment { get; set; }
        public required int Rating { get; set; }

        public required Guid DoctorId { get; set; }
        public virtual DoctorModel? Doctor { get; set; }

        // public int MyProperty { get; set; }


        // Update the review with new comment and rating, and update the UpdatedAt timestamp
        public void updateReview(int starRating, string comment)
        {
            Comment = comment;
            Rating = starRating;
            UpdatedAt = DateTime.UtcNow;
        }

        // To Get Patient Full Name
        // public string GetPatientName()
        // {
        //     // Assuming you have a way to get the patient's name based on the PatientId
        //     // This is just a placeholder implementation
        //     return Patient?.User != null ? $"{Patient.User.FirstName} {Patient.User.LastName}".Trim() : string.Empty;
        // }

        // To Get Doctor Full Name
        public string GetDoctorName()
        {
            return Doctor?.User != null ? $"{Doctor.User.FirstName} {Doctor.User.LastName}".Trim() : string.Empty;
        }

        //Check if the review is updated or not 
        public bool IsUpdated()
        {
            return UpdatedAt > CreatedAt;
        }
    }
}