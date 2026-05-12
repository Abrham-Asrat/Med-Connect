using System.ComponentModel.DataAnnotations;

public record MessageDto(Guid MessageId, Guid? SenderId, string? MessageText, List<FileDto>? Files);

public record CreateMessageDto(
  [Guid] Guid ConversationId,
  [Guid] Guid SenderId,
  [MinLength(1)] string? MessageText,
  [ValidCreateFileList] List<CreateFileDto>? Files
);
