using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using System.Linq;


namespace BackendAPI.Source.Service.ChatService
{

public class ChatService(
  ApplicationDbContext appContext,
  UserService userService,
  FileService fileService,
  ILogger<ChatService> logger
) : IChatService
{
  public async Task<IConversationDto> CreateConversationAsync(
    CreateConversationDto createConversationDto
  )
  {
    try
    {
      // --- STRICT MESSAGING PRECONDITION ---
      if (createConversationDto.Participants.Count == 2)
      {
          var participantIds = createConversationDto.Participants.ToArray();
          var p1 = participantIds[0];
          var p2 = participantIds[1];

          var doctor = await appContext.Doctors.FirstOrDefaultAsync(d => d.UserId == p1 || d.UserId == p2);
          var patient = await appContext.Patients.FirstOrDefaultAsync(p => p.UserId == p1 || p.UserId == p2);

          // If this is specifically a Doctor <-> Patient conversation request
          if (doctor != null && patient != null)
          {
              // Verify they have an actual appointment relationship
              bool hasRelationship = await appContext.Appointments.AnyAsync(a => 
                  a.DoctorId == doctor.DoctorId && a.PatientId == patient.PatientId);
                  
              if (!hasRelationship)
              {
                  throw new InvalidOperationException("Messaging Precondition Failed: Patients and Doctors can only communicate if an Appointment links them.");
              }
          }
      }
      // -------------------------------------

      // Check if a conversation between these exact participants already exists
      // to avoid creating duplicate conversations
      if (createConversationDto.Participants.Count == 2)
      {
          var participantIds = createConversationDto.Participants.ToList();
          var existingConversationId = await appContext.ConversationMemberships
              .Where(cm => cm.UserId == participantIds[0])
              .Select(cm => cm.ConversationId)
              .Intersect(
                  appContext.ConversationMemberships
                      .Where(cm => cm.UserId == participantIds[1])
                      .Select(cm => cm.ConversationId)
              )
              .FirstOrDefaultAsync();

          if (existingConversationId != Guid.Empty)
          {
              // Return the existing conversation instead of creating a duplicate
              var existingParticipants = await GetConversationParticipantsAsync(existingConversationId);
              var existingConversation = await appContext.Conversations.FindAsync(existingConversationId);
              return existingConversation!.ToConversationDto(existingParticipants);
          }
      }

      var conversationId = Guid.NewGuid();
      var conversation = await appContext.Conversations.AddAsync(
        new Conversation() { ConversationId = conversationId }
      );

      // ✅ Save memberships for all participants — this is what was missing
      await CreateConversationMembershipsRangeAsync(
          createConversationDto.Participants.ToList(),
          conversationId
      );

      await appContext.SaveChangesAsync();

      // Reload with participants populated so ToConversationDto has full data
      var participants = await GetConversationParticipantsAsync(conversationId);
      var savedConversation = await appContext.Conversations.FindAsync(conversationId);
      return savedConversation!.ToConversationDto(participants);
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to create conversation.");
      throw;
    }
  }

  public async Task CreateConversationMembershipsRangeAsync(
    List<Guid> participants,
    Guid conversationId
  )
  {
    try
    {
      var conversationMemberships = participants.Select(userId => new ConversationMembershipModel
      {
        UserId = userId,
        ConversationId = conversationId
      }).ToList();

      await appContext.ConversationMemberships.AddRangeAsync(conversationMemberships);
      await appContext.SaveChangesAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to create conversation memberships.");
      throw;
    }
  }

  public async Task<List<MessageDto>> GetMessagesAsync(Guid conversationId)
  {
    try
    {
      var conversation = await appContext.Conversations
        .Where(c => c.ConversationId == conversationId)
        .Include(c => c.Messages)
          .ThenInclude(m => m.Sender)
        .FirstOrDefaultAsync();

      if (conversation == null)
        throw new KeyNotFoundException("Conversation with the given id doesn't exist.");

      // Load file associations separately — Message.Files is a direct nav that has no
      // MessageId FK on FileModel; files are linked via MessageFileAssociation join table
      var messageIds = conversation.Messages.Select(m => m.MessageId).ToList();
      var filesByMessage = await appContext.MessageFileAssociations
        .Where(fa => messageIds.Contains(fa.MessageId))
        .Include(fa => fa.File)
        .GroupBy(fa => fa.MessageId)
        .ToDictionaryAsync(
          g => g.Key,
          g => g.Where(fa => fa.File != null).Select(fa => fa.File!).ToList()
        );

      return conversation.Messages
        .OrderBy(m => m.CreatedAt)
        .Select(m => m.ToMessageDto(
          filesByMessage.TryGetValue(m.MessageId, out var files) ? files : []
        ))
        .ToList();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all messages.");
      throw;
    }
  }

  public async Task<List<IConversationDto>> GetAllConversations(Guid userId)
  {
    try
    {
      if (!await userService.UserExistsAsync(userId))
        throw new KeyNotFoundException("User with that userid is not found!");

      // Step 1: find all conversationIds this user belongs to
      var conversationIds = await appContext.ConversationMemberships
        .Where(cm => cm.UserId == userId)
        .Select(cm => cm.ConversationId)
        .ToListAsync();

      if (!conversationIds.Any())
        return [];

      // Step 2: for each conversation load ALL members + the conversation itself
      // (so the frontend can find the "other" participant)
      var conversations = await appContext.Conversations
        .Where(c => conversationIds.Contains(c.ConversationId))
        .Include(c => c.ConversationMemberships)
          .ThenInclude(cm => cm.User)
        .ToListAsync();

      var result = conversations.Select(c =>
      {
        var allParticipants = c.ConversationMemberships
          .Where(cm => cm.User != null)
          .Select(cm => cm.User!.ToConversationProfileDto())
          .ToList();

        return (IConversationDto) new ConversationDtoBase
        {
          ConversationId = c.ConversationId,
          Participants = allParticipants,
          LastMessageAt = c.LastMessageAt,
          Status = c.Status.ToString().ToLower()
        };
      }).ToList();

      return result;
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred while trying to get all conversations.");
      throw;
    }
  }

  public async Task<MessageDto> CreateMessageAsync(CreateMessageDto createMessageDto)
  {
    using var transaction = await appContext.Database.BeginTransactionAsync();
    try
    {
      var conversationId = createMessageDto.ConversationId;
      Guid messageId = Guid.NewGuid();

      // Build and save the Message first so the FK exists before file associations are inserted
      var message = createMessageDto.ToMessage(conversationId);
      message.MessageId = messageId;

      // Resolve role-specific IDs for prescription FK constraints.
      // PrescriptionModel.DoctorId → DoctorModel.DoctorId (not UserId)
      // PrescriptionModel.PatientId → PatientModel.PatientId (not UserId)
      if (message.PrescriptionDetails != null)
      {
        var senderDoctor = await appContext.Doctors
          .FirstOrDefaultAsync(d => d.UserId == createMessageDto.SenderId);
        if (senderDoctor == null)
          throw new InvalidOperationException("Only doctors can issue prescriptions.");

        var targetPatient = createMessageDto.TargetUserId.HasValue
          ? await appContext.Patients.FirstOrDefaultAsync(p => p.UserId == createMessageDto.TargetUserId.Value)
          : null;
        if (targetPatient == null)
          throw new InvalidOperationException("A valid patient target is required for prescriptions.");

        message.PrescriptionDetails.MessageId = messageId;
        message.PrescriptionDetails.DoctorId = senderDoctor.DoctorId;
        message.PrescriptionDetails.PatientId = targetPatient.PatientId;
      }

      var result = await appContext.Messages.AddAsync(message);

      // Update the conversation's LastMessageAt so the sidebar shows the correct time
      var conversation = await appContext.Conversations.FindAsync(conversationId);
      if (conversation != null)
      {
        conversation.LastMessageAt = DateTime.UtcNow;
        appContext.Conversations.Update(conversation);
      }

      // Save the Message row BEFORE creating file associations —
      // MessageFileAssociation has a FK on Messages.MessageId
      await appContext.SaveChangesAsync();

      // Now that the Message exists in the DB, create files and their associations
      List<FileModel> files = [];
      foreach (var file in createMessageDto.Files ?? [])
      {
        files.Add(await fileService.CreateFileAsync(file, messageId, DiscriminatorTypes.Message));
      }

      await transaction.CommitAsync();

      return result.Entity.ToMessageDto(files);
    }
    catch (Exception ex)
    {
      await transaction.RollbackAsync();
      logger.LogError($"{ex}: An error occured trying to create a message.");
      throw;
    }
  }

  // /// <summary>
  // /// Get the conversation ID between two users, if no conversation exists, creates one and returns the ID
  // /// </summary>
  // /// <param name="senderId"></param>
  // /// <param name="receiverId"></param>
  // /// <returns>ConversationId</returns>
  // /// <exception cref="InvalidOperationException"></exception>
  // public async Task<Guid> GetConversationIdOrCreate(Guid senderId, Guid participantId)
  // {
  //   using var transaction = await appContext.Database.BeginTransactionAsync();
  //   try
  //   {
  //     // Find common conversations between sender and receiver
  //     var commonConversation = await appContext
  //       .ConversationMemberships.Where(cm => cm.UserId == senderId || cm.UserId == participantId)
  //       .GroupBy(cm => cm.ConversationId)
  //       .Where(g => g.Count() == 2) // Both sender and receiver must be in this conversation
  //       .Select(g => g.Key)
  //       .FirstOrDefaultAsync();

  //     // If they don't have conversation yet
  //     if (commonConversation == default)
  //     {
  //       // Create a new conversation
  //       var conversation = new Conversation();
  //       var conversationMemberships = new List<ConversationMembership>
  //       {
  //         new ConversationMembership
  //         {
  //           UserId = senderId,
  //           ConversationId = conversation.ConversationId
  //         },
  //         new ConversationMembership
  //         {
  //           UserId = participantId,
  //           ConversationId = conversation.ConversationId
  //         }
  //       };
  //       await appContext.ConversationMemberships.AddRangeAsync(conversationMemberships); // create the conversation memberships
  //       await appContext.Conversations.AddAsync(conversation); // create the conversation
  //       commonConversation = conversation.ConversationId;
  //     }
  //     await appContext.SaveChangesAsync();
  //     transaction.Commit();
  //     return commonConversation;
  //   }
  //   catch (Exception ex)
  //   {
  //     await transaction.RollbackAsync();
  //     logger.LogError(ex, "An error occurred while getting the conversation ID.");
  //     throw;
  //   }
  // }

  public async Task<IConversationDto> GetConversationAsync(Guid conversationId)
  {
    try
    {
      if (!await ConversationExistsAsync(conversationId))
        throw new KeyNotFoundException("Conversation with the given id doesn't exist.");

      var kvp = await appContext
        .ConversationMemberships.Where(cm => cm.ConversationId == conversationId)
        .Include(cm => cm.Conversation)
        .Include(cm => cm.User)
        .GroupBy(g => g.ConversationId)
        .ToDictionaryAsync(
          g => g.Key,
          g =>
            g.Where(cm => cm.User != null)
              .Select(cm => cm.User!.ToConversationProfileDto())
              .ToList()
        );

      return kvp.Select(c =>
          (IConversationDto)
            new ConversationDtoBase { ConversationId = c.Key, Participants = [.. c.Value] }
        )
        .First();
    }
    catch (System.Exception)
    {
      throw;
    }
  }

  public async Task<ICollection<IConversationDto>> GetAllConversations()
  {
    try
    {
      var kvps = await appContext
        .ConversationMemberships.Include(cm => cm.Conversation)
        .Include(cm => cm.User)
        .GroupBy(g => g.ConversationId)
        .ToDictionaryAsync(
          g => g.Key,
          g =>
            g.Where(cm => cm.User != null)
              .Select(cm => cm.User!.ToConversationProfileDto())
              .ToList()
        );

      var result = kvps.Select(e =>
        (IConversationDto)
          new ConversationDtoBase { ConversationId = e.Key, Participants = e.Value.ToList() }
      );

      return result.ToList();
    }
    catch (System.Exception)
    {
      throw;
    }
  }

  public async Task<bool> ConversationExistsAsync(Guid conversationId)
  {
    return await appContext.Conversations.FindAsync(conversationId) != null;
  }

  public async Task DeleteMessage(Guid messageId)
  {
    try
    {
      var message = await appContext.Messages.FirstOrDefaultAsync(m => m.MessageId == messageId);

      if (message == default)
        throw new KeyNotFoundException("Message with the given id is not found!");

      appContext.Messages.Remove(message);

      await appContext.SaveChangesAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to delete message.");
      throw;
    }
  }

  public async Task<ICollection<UserModel>> GetConversationParticipantsAsync(Guid conversationId)
  {
    try
    {
      var result = await appContext
        .ConversationMemberships.Where(cm => cm.ConversationId == conversationId && cm.User != null)
        .Include(cm => cm.User)
        .Select(g => g.User!)
        .ToListAsync();

      return result;
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to get conversation participants.");
      throw;
    }
  }

  public async Task BlockConversationAsync(Guid conversationId, Guid requestUserId)
  {
    try
    {
      var membership = await appContext.ConversationMemberships
        .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == requestUserId);
            
      if (membership == null)
        throw new UnauthorizedAccessException("You are not part of this conversation and cannot block it.");
            
      var conversation = await appContext.Conversations.FindAsync(conversationId);
      if (conversation == null)
        throw new KeyNotFoundException("Conversation not found.");

      // We use the 'closed' lock state to permanently freeze interaction routing
      conversation.Status = Models.Enums.AppointmentStatus.closed;
      appContext.Conversations.Update(conversation);
      await appContext.SaveChangesAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "Error attempting to block conversation {id}", conversationId);
      throw;
    }
  }

  public async Task UpdateConversationStatusAsync(Guid conversationId, Guid requestUserId, Models.Enums.AppointmentStatus newStatus)
  {
    try
    {
      var membership = await appContext.ConversationMemberships
        .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == requestUserId);

      if (membership == null)
        throw new UnauthorizedAccessException("You are not part of this conversation.");

      var conversation = await appContext.Conversations.FindAsync(conversationId);
      if (conversation == null)
        throw new KeyNotFoundException("Conversation not found.");

      // Guard: only allow valid forward transitions
      // active → follow_up (doctor marks resolved)
      // follow_up → closed (patient accepts)
      bool validTransition =
        (conversation.Status == Models.Enums.AppointmentStatus.active   && newStatus == Models.Enums.AppointmentStatus.follow_up) ||
        (conversation.Status == Models.Enums.AppointmentStatus.follow_up && newStatus == Models.Enums.AppointmentStatus.closed);

      if (!validTransition)
        throw new InvalidOperationException($"Cannot transition conversation from '{conversation.Status}' to '{newStatus}'.");

      conversation.Status = newStatus;
      appContext.Conversations.Update(conversation);
      await appContext.SaveChangesAsync();
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "Error updating conversation status {id}", conversationId);
      throw;
    }
  }
}
}