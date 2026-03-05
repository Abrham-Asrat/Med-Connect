using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
// using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Dto;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class ListExtensions
    {
        public static List<CreateSpecialtyDto> ToSpecialtyList (this List<string> strings , Guid doctorId) 
        {
            return strings.Select(str => new CreateSpecialtyDto {SpecialtyName = str}).ToList();
        }
    }
}