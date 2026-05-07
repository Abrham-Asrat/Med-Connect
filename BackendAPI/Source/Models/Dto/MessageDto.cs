using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Views;

public record MessageDto(
  Guid MessageId, 
  Guid? SenderId, 
  string? MessageText, 
  List<FileDto>? Files,
  BackendAPI.Source.Models.Enums.MessageType Type = BackendAPI.Source.Models.Enums.MessageType.text,
  bool IsRead = false,
  string? AudioUrl = null,
  string? AudioDuration = null,
  PrescriptionDto? PrescriptionDetails = null,
  DateTime? CreatedAt = null
);

public record CreateMessageDto(
  [Guid] Guid ConversationId,
  [Guid] Guid SenderId,
  string? MessageText = null,
  [ValidCreateFileList] List<CreateFileDto>? Files = null,
  BackendAPI.Source.Models.Enums.MessageType Type = BackendAPI.Source.Models.Enums.MessageType.text,
  string? AudioUrl = null,
  string? AudioDuration = null,
  CreatePrescriptionDto? PrescriptionDetails = null,
  Guid? TargetUserId = null
);

public record CreatePrescriptionDto(
  [Required] string Medication,
  [Required] string Dosage,
  [Required] string Frequency,
  [Required] string Duration
);

public record PrescriptionDto(
  Guid PrescriptionId,
  string Medication,
  string Dosage,
  string Frequency,
  string Duration
);
