using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Attributes;
using BackendAPI.Source.Models.Enums;


namespace BackendAPI.Source.Models.Entities
{
    public class UserModel
    {
        public Guid UserId {get;set;} = Guid.NewGuid();

        [Required]
        public required string Auth0Id {get;set;}

        [Required]
        public required string Auth0AccessToken { get; set; }

        [Required]
        public required string Auth0RefreshToken { get; set; }

        [Required]
        public required string FirstName { get; set; }

          [Required]
        public required string LastName { get; set; }

        [Required]
        [EmailAddress]
        public required string Email {get;set;}

         public bool IsEmailVerified { get; set; } = false;

        [Phone]
         public string? Phone{ get; set;} 

        [GenderAttrubute]
        public Gender? Gender { get; set; }

        [AgeAbove(18)]
        public DateOnly? DateOfBirth { get; set; }

        public string? ProfilePicture { get; set; }

        public string? Address { get; set; }

        [Required]
        [RoleValidaton]
        public Role Role { get; set; }

    }
}