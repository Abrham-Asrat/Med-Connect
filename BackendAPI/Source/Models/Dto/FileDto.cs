// Recieved from client to create a file

using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Models.Enums;

public record CreateFileDto(
  [Required] string MimeType,
  [Required] string FileDataBase64,
  [Required] string? FileName
);

// Recieved form client to edit a file
public record EditFileDto(Guid FileId, string? MimeType, string? FileDataBase64, string? FileName);

// Return to the Client
public record FileDto(
  Guid FileId,
  string MimeType,       // MIME string e.g. "audio/webm", not the enum integer
  string FileDataBase64,
  string? FileName,
  int fileSize
);