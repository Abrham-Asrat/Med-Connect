using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Source.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
            
        }
        public DbSet<UserModel> Users { get; set; }
        public DbSet<DoctorModel> Doctors { get; set; }
        public DbSet<EducationModel> Educations { get; set; }
        public DbSet<ExperienceModel> Experiences { get; set; }
        public DbSet<ReviewModel> Reviews { get; set; }
        public DbSet<DoctorAvailabilityModel> DoctorAvailabilities { get; set; }
        public DbSet<AppointmentModel> Appointments { get; set; }
        public DbSet<SpecialtyModel> Specializations { get; set; }
        public DbSet<DoctorSpecialtyModel> DoctorSpecialties { get; set; }
        public DbSet<DoctorPreference> DoctorPreferences { get; set; }

        public DbSet<FileModel> Files { get; set; }
        
    }
}