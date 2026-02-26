using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Dtos
{
    public class CreateSpecialtyDto
    {
        public required string SpecialtyName { get; set; }
    }
}