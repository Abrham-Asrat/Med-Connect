using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class ReviewModel
    {
        public Guid ReviewId { get; set; } = Guid.NewGuid();
        public required string Comment { get; set; }
        public required int Rating { get; set; }

        public required Guid DoctorId { get; set; }
        public virtual DoctorModel? Doctor { get; set; }

        // public int MyProperty { get; set; }
    }
}