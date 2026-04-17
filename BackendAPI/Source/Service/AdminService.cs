using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Data;
using BackendAPI.Source.Models.Dto;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Helpers.Extensions;

namespace BackendAPI.Source.Service
{
    public class AdminService(ILogger<AdminService> logger  , ApplicationDbContext appContext)
    {
        public async Task<Admin?> CreateAdminAsync(CreateAdminDto CreateAdminDto)
        {
             try
             {
                 var adminResult = await appContext.Admins.AddAsync(CreateAdminDto.ToAdmin());
                 var admin = adminResult.Entity;

                 await appContext.SaveChangesAsync();
                 return admin;
           }
             catch (Exception ex)
           {
             logger.LogError(ex, "Failed to Create Admin");
             throw;
           }
        }
    }
}