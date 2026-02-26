using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Dto
{
    public record EducationDto
    (
        Guid EducationId,
        string Degree,
        string Institution,
        DateTime GraduationDate,
        Guid DoctorId

    );

    public record CreateEducationDto
    (
        [Required] string Degree,
        [Required] string Institution,
        [Required] string GraduationDate

    );

    public record UpdateEducationDto
    (
        string? Degree,
        string? Institution,
        string? GraduationDate
    );

}