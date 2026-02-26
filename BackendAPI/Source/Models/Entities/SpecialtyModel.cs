using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Entities
{
    public class SpecialtyModel : BaseEntity
    {
        public Guid SpecialtyId { get; set; } = Guid.NewGuid();
        public required string SpecialtyName { get; set; }
        public virtual ICollection<DoctorSpecialtyModel> DoctorSpecialties { get; set; } = new HashSet<DoctorSpecialtyModel>();
    }
}