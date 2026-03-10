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
    
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // EF convention doesn't recognize DoctorAvailabilityId as the key of
            // DoctorAvailabilityModel (class name ends with "Model"), so configure
            // explicitly.  The [Key] attribute should work but being explicit
            // eliminates any ambiguity and avoids the runtime exception.
            modelBuilder.Entity<DoctorAvailabilityModel>()
                .HasKey(d => d.DoctorAvailabilityId);

            // join table uses composite key
            modelBuilder.Entity<DoctorSpecialtyModel>()
                .HasKey(ds => new { ds.DoctorId, ds.SpecialtyId });

            // preference uses DoctorId as primary key (one-to-one)
            modelBuilder.Entity<DoctorPreference>()
                .HasKey(p => p.DoctorId);

            // other entities use simple single column keys by convention;
            // explicit configuration helps avoid silent issues later
            modelBuilder.Entity<UserModel>().HasKey(u => u.UserId);
            modelBuilder.Entity<DoctorModel>().HasKey(d => d.DoctorId);
            modelBuilder.Entity<EducationModel>().HasKey(e => e.EducationId);
            modelBuilder.Entity<ExperienceModel>().HasKey(e => e.ExperienceId);
            modelBuilder.Entity<ReviewModel>().HasKey(r => r.ReviewId);
            modelBuilder.Entity<AppointmentModel>().HasKey(a => a.AppointmentId);
            modelBuilder.Entity<SpecialtyModel>().HasKey(s => s.SpecialtyId);
            modelBuilder.Entity<FileModel>().HasKey(f => f.FileId);
        }
    }
}