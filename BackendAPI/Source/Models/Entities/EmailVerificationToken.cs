using System;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities
{
    /// <summary>
    /// Stores a one-time email verification token linked to a user.
    /// The token is deleted once the user successfully verifies their email.
    /// </summary>
    public class EmailVerificationToken
    {
        [Key]
        public Guid TokenId { get; set; } = Guid.NewGuid();

        [Required]
        public required Guid UserId { get; set; }

        [Required]
        public required string Token { get; set; }

        /// <summary>
        /// UTC expiry time. Tokens are valid for 24 hours by default.
        /// </summary>
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

        public virtual UserModel? User { get; set; }
    }
}
