using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Source.Models.Entities
{
    public class Admin
    {
        public Guid AdminId { get; set; }

        [Required]
        public Guid UserId { get; set; }
        public virtual required UserModel User { get; set; }
    }
}