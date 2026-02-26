using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class DoctorSpecialtyModel
    {
        public required Guid DoctorId { get; set; }
        public virtual DoctorModel? Doctor { get; set; }

        public required Guid SpecialtyId { get; set; }
        public virtual SpecialtyModel? Specialty { get; set; }

    }
}