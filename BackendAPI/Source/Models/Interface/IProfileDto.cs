using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Interface
{
    public interface IProfileDto
    {
           Guid Id { get; set; }
           string FirstName { get; set; }
           string LastName { get; set; }
           string Email { get; set; }
           string? ProfilePicture { get; set; }
        
    }
}