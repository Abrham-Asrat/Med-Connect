using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Dto
{
    public record ExperienceDto
    (
        Guid ExperienceId,
        string Institution,
        string Position,
        DateTime StartDate,
        DateTime? EndDate,
        string? Description,
        Guid DoctorId
    );

    public record CreateExperienceDto
    (
        [Required] string Institution,
        [Required] string Position,
        [Required] string StartDate,
        string? EndDate,
        string? Description
    );

    public record UpdateExperienceDto
    (
        string? Institution,
        string? Position,
        string? StartDate,
        string? EndDate,
        string? Description
    );
}