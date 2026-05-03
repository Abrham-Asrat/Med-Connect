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
    using IDbContextTransaction transaction = await appContext.Database.BeginTransactionAsync();
    try
    {
      var file = await appContext.Files.AddAsync(createFileDto.ToFileModel());
      await appContext.SaveChangesAsync();

      // estabilish an association between the file and the EntityType
      await CreateFileAssociationAsync(file.Entity.FileId, assocId, entityType);

      await transaction.CommitAsync();

      return file.Entity;
    }
    catch (Exception ex)
    {
      await transaction.RollbackAsync();

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

    }
}