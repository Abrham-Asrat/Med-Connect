using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Dto
{
    public record ReviewDto(
        Guid ReviewId,
        string Comment,
        int Rating,
        Guid DoctorId
    );
} 