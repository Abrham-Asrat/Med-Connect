using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Dto
{
    public record CreateDoctorSpecialtyDto
    {
       public required Guid DoctorId { get; set; }
        public required Guid SpecialtyId { get; set; }
    }
}