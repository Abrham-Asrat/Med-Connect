using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Dto
{
    public record CreateFileDto
    (
      [Required] string MimeType,
      [Required] string FileDataBase64,
      [Required] string FileName
    );
    
        
    // Received form client to edit a file
public record EditFileDto(Guid FileId, string? MimeType, string? FileDataBase64, string? FileName);

// Return to the Client
public record FileDto(
  Guid FileId,
  MimeDefaults MimeType,
  string FileDataBase64,
  string? FileName,
  int fileSize
);

}