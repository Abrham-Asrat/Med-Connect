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
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
    
        }

        public DbSet<UserModel> Users { get; set; } = null!;
        public DbSet<DoctorModel> Doctors { get; set; } = null!;
        public DbSet<EducationModel> Educations { get; set; } = null!;
        public DbSet<ExperienceModel> Experiences { get; set; } = null!;
        public DbSet<ReviewModel> Reviews { get; set; } = null!;
        public DbSet<DoctorAvailabilityModel> DoctorAvailabilities { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<SpecialtyModel> Specializations { get; set; } = null!;
        public DbSet<DoctorSpecialtyModel> DoctorSpecialties { get; set; } = null!;
        public DbSet<DoctorPreference> DoctorPreferences { get; set; } = null!;
        public DbSet<FileModel> Files { get; set; } = null!;
        public DbSet<PatientModel> Patients { get; set; } = null!;
        public DbSet<Admin> Admins { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Blog> Blogs { get; set; } = null!;
        public DbSet<BlogComment> BlogComments { get; set; } = null!;
        public DbSet<BlogLike> BlogLikes { get; set; } = null!;
        public DbSet<BlogTag> BlogTags { get; set; } = null!;
        public DbSet<Tag> Tags { get; set; } = null!;
        public DbSet<Conversation> Conversations { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<ConversationMembershipModel> ConversationMemberships { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;

        public DbSet<MessageFileAssociation> MessageFileAssociations { get; set; } = null!;
        public DbSet<DocumentFileAssociation> DocumentFileAssociations { get; set; } = null!;
        public DbSet<DoctorTimeOff> DoctorTimeOffs { get; set; } = null!;
    
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
            modelBuilder.Entity<PatientModel>().HasKey(p => p.PatientId);
            modelBuilder.Entity<EducationModel>().HasKey(e => e.EducationId);
            modelBuilder.Entity<ExperienceModel>().HasKey(e => e.ExperienceId);
            modelBuilder.Entity<ReviewModel>().HasKey(r => r.ReviewId);
            modelBuilder.Entity<Appointment>().HasKey(a => a.AppointmentId);
            modelBuilder.Entity<SpecialtyModel>().HasKey(s => s.SpecialtyId);
            modelBuilder.Entity<FileModel>().HasKey(f => f.FileId);
            modelBuilder.Entity<Admin>().HasKey(a => a.AdminId);

            modelBuilder.Entity<Payment>().HasKey(a=> a.PaymentId);
            modelBuilder.Entity<Blog>().HasKey(b => b.BlogId);
            modelBuilder.Entity<BlogComment>().HasKey(bc => bc.BlogCommentId);
            modelBuilder.Entity<BlogLike>().HasKey(bl => bl.BlogLikeId);
            modelBuilder.Entity<Tag>().HasKey(bt => bt.TagId);
            modelBuilder.Entity<BlogTag>().HasKey(bt => new { bt.BlogId, bt.TagId });
            modelBuilder.Entity<Conversation>().HasKey(c => c.ConversationId);
            modelBuilder.Entity<Message>().HasKey(m => m.MessageId);
            modelBuilder.Entity<ConversationMembershipModel>()
                .HasKey(cm => new { cm.ConversationId, cm.UserId });
            modelBuilder.Entity<Notification>().HasKey(n => n.NotificationId);
            modelBuilder.Entity<MessageFileAssociation>().HasKey(fa => fa.FileAssociationId);
            modelBuilder.Entity<DocumentFileAssociation>().HasKey(fa => fa.FileAssociationId);
            



            // Configure foreign key delete behaviors to avoid multiple cascade paths
            modelBuilder.Entity<PatientModel>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DoctorModel>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany()
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ReviewModel>()
                .HasOne(r => r.Patient)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PatientId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ReviewModel>()
                .HasOne(r => r.Doctor)
                .WithMany(d => d.Reviews)
                .HasForeignKey(r => r.DoctorId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure BlogComment relationships to avoid multiple cascade paths
            modelBuilder.Entity<BlogComment>()
                .HasOne(bc => bc.Blog)
                .WithMany(b => b.BlogComments)
                .HasForeignKey(bc => bc.BlogId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BlogComment>()
                .HasOne(bc => bc.Sender)
                .WithMany(u => u.BlogComments)
                .HasForeignKey(bc => bc.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BlogComment>()
                .HasOne(bc => bc.ParentComment)
                .WithMany(bc => bc.Replies)
                .HasForeignKey(bc => bc.ParentCommentId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure BlogLike relationships to avoid multiple cascade paths
            modelBuilder.Entity<BlogLike>()
                .HasOne(bl => bl.Blog)
                .WithMany(b => b.BlogLikes)
                .HasForeignKey(bl => bl.BlogId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<BlogLike>()
                .HasOne(bl => bl.User)
                .WithMany(u => u.BlogLikes)
                .HasForeignKey(bl => bl.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure ConversationMembershipModel relationships to avoid multiple cascade paths
          

            // Add indexes for frequently queried fields
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");

            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Phone)
                .IsUnique()
                .HasDatabaseName("IX_Users_Phone");

            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Auth0Id)
                .IsUnique()
                .HasDatabaseName("IX_Users_Auth0Id");

            modelBuilder.Entity<Appointment>()
                .HasIndex(a => a.DoctorId)
                .HasDatabaseName("IX_Appointments_DoctorId");

            modelBuilder.Entity<Appointment>()
                .HasIndex(a => a.PatientId)
                .HasDatabaseName("IX_Appointments_PatientId");

            modelBuilder.Entity<Appointment>()
                .HasIndex(a => new { a.DoctorId, a.AppointmentDate, a.AppointmentTime })
                .HasDatabaseName("IX_Appointments_Doctor_Date_Time");

            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.TransactionReference)
                .IsUnique()
                .HasDatabaseName("IX_Payments_TransactionReference");

            modelBuilder.Entity<DoctorModel>()
                .HasIndex(d => d.UserId)
                .IsUnique()
                .HasDatabaseName("IX_Doctors_UserId");

            modelBuilder.Entity<PatientModel>()
                .HasIndex(p => p.UserId)
                .IsUnique()
                .HasDatabaseName("IX_Patients_UserId");
        }
    }
}