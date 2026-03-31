using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using Microsoft.Extensions.Logging;
using BackendAPI.Source.Helpers.Extensions;



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
        

    }
}