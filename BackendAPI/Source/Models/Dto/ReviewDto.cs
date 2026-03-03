using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
namespace BackendAPI.Source.Models.Dto
{
    public record ReviewDto(
        Guid ReviewId,
        string Comment,
        int Rating,
        Guid DoctorId
    );

    public record CreateReviewDto(
        [Required] string Comment,
        [Required] int Rating
    );

    public record UpdateReviewDto(
        string? Comment,
        int? Rating
    );
} 