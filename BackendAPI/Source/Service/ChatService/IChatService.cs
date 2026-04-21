using BackendAPI.Source.Models.Entities;

namespace BackendAPI.Source.Service.ChatService
{

public interface IChatService
{
  Task<List<MessageDto>> GetMessagesAsync(Guid conversationId);

  Task<List<IConversationDto>> GetAllConversations(Guid userId);

  Task<MessageDto> CreateMessageAsync(CreateMessageDto createMessageDto);

  // Task<Guid> GetConversationIdOrCreate(Guid senderId, Guid receiverId);

  Task<IConversationDto> CreateConversationAsync(CreateConversationDto createConversationDto);

  Task<IConversationDto> GetConversationAsync(Guid conversationId);

  Task<ICollection<IConversationDto>> GetAllConversations();

  Task<bool> ConversationExistsAsync(Guid conversationId);

  Task DeleteMessage(Guid messageId);

  Task CreateConversationMembershipsRangeAsync(List<Guid> participants, Guid conversationId);

  Task<ICollection<UserModel>> GetConversationParticipantsAsync(Guid conversationId);
}
}