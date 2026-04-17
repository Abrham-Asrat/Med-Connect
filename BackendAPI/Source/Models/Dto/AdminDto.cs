using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Entities;

namespace BackendAPI.Source.Models.Dto
{
    public record CreateAdminDto
    {
        public required UserModel User;
    }
}