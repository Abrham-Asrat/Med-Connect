using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Models.Dtos
{
    public record ProfileDto
    {
        public required Guid UserId { get; init; }
        public required string FirstName { get; init; }
        public required string LastName { get; init; }
        public required string Email { get; init; }
        public required string ProfilePicture { get; init; }
        public required string Phone { get; init; }
        public required Gender Gender { get; init; }
        public required DateOnly DateOfBirth { get; init; }
        public required string Address { get; init; }
        public required Role Role { get; init; }
    }
}