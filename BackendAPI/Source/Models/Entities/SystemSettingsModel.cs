using System;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities
{
    public class SystemSettings
    {
        [Key]
        public int Id { get; set; } = 1;
        public bool MaintenanceMode { get; set; } = false;
        public bool AllowRegistration { get; set; } = true;
        public bool RequireEmailVerification { get; set; } = true;
        public int MaxUploadSize { get; set; } = 10;
        public bool TwoFactorAuth { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
