using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using Microsoft.Extensions.Logging;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Helpers.Default;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore;




namespace BackendAPI.Source.Service
{
    public class FileService (
        ApplicationDbContext appContext,
        ILogger<FileService> logger
    )
    {
        public async Task<FileModel> CreateFileAsync(CreateFileDto dto)
        {
           try
           {
            // use extension method rather than attempting static call
            var file = await appContext.Files.AddAsync(dto.ToFileModel());
            await appContext.SaveChangesAsync();
            return file.Entity;         
           }

           catch (Exception ex)
           {
            logger.LogError(ex, "An error occurred while creating a file");
            throw;
           }
        }


        public async Task<FileModel> CreateFileAsync(
    CreateFileDto createFileDto,
    Guid assocId,
    DiscriminatorTypes entityType
  )
  {
    // NOTE: No transaction here — callers (e.g. CreateMessageAsync) manage the ambient
    // transaction. Starting a nested transaction on the same DbContext throws on SQL Server.
    try
    {
      var file = await appContext.Files.AddAsync(createFileDto.ToFileModel());
      await appContext.SaveChangesAsync();

      // establish an association between the file and the EntityType
      await CreateFileAssociationAsync(file.Entity.FileId, assocId, entityType);

      return file.Entity;
    }
    catch (Exception ex)
    {
      logger.LogError($"{ex}: An error occured trying to create a file");
      throw;
    }
  }
         public async Task<FileAssociation> CreateFileAssociationAsync(
    Guid fileId,
    Guid assocId,
    DiscriminatorTypes entityType
  )
  {
    try
    {
      FileAssociation fa = entityType switch
      {
        DiscriminatorTypes.Message
          => new MessageFileAssociation { FileId = fileId, MessageId = assocId },
        DiscriminatorTypes.Document
          => new DocumentFileAssociation { FileId = fileId, PatientId = assocId },
        _ => throw new ArgumentException($"Unsupported Discriminator Type: {entityType}")
      };

      if (fa is MessageFileAssociation m) await appContext.MessageFileAssociations.AddAsync(m);
      else if (fa is DocumentFileAssociation d) await appContext.DocumentFileAssociations.AddAsync(d);
      
      await appContext.SaveChangesAsync();
 
       return fa;
     }
     catch (Exception ex)
     {
       logger.LogError($"{ex}: Error occurred while creating file association");
       throw;
     }
   }
 
    public async Task<List<FileModel>> GetPatientFilesAsync(Guid patientId)
    {
      try
      {
        return await appContext.DocumentFileAssociations
          .Where(d => d.PatientId == patientId)
          .Include(d => d.File)
          .Select(d => d.File!)
          .ToListAsync();
      }
      catch (Exception ex)
      {
        logger.LogError(ex, "Error occurred while fetching files for patient {PatientId}", patientId);
        throw;
      }
    }

    public async Task<List<FileModel>> GetFilesForAssociationAsync(Guid assocId, DiscriminatorTypes entityType)
    {
      try
      {
        return entityType switch
        {
          DiscriminatorTypes.Message => await appContext.MessageFileAssociations
            .Where(m => m.MessageId == assocId)
            .Include(m => m.File)
            .Select(m => m.File!)
            .ToListAsync(),
          DiscriminatorTypes.Document => await appContext.DocumentFileAssociations
            .Where(d => d.PatientId == assocId)
            .Include(d => d.File)
            .Select(d => d.File!)
            .ToListAsync(),
          _ => throw new ArgumentException($"Unsupported Discriminator Type: {entityType}")
        };
      }
      catch (Exception ex)
      {
        logger.LogError(ex, "Error occurred while fetching files for assoc {AssocId}", assocId);
        throw;
      }
    }


    }
}