using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;

namespace BackendAPI.Source.Validation
{
    public class ValidationHelper
    {
        public static bool BeAValidGuid(string? id)
        {
            if (id == null)
                return false;
            return Guid.TryParse(id, out _);
        }

        public static bool BeValidDateTimeString(string? date)
        {
            if (date == null)
                return false;

            return DateTime.TryParse(date, out _);
        }

        public static bool BeAValidDateOnlyString(string? date)
        {
            if (date == null)
                return false;

            return DateOnly.TryParse(date, out _);
        }
        // public static bool  BeAValidAppointmentType(string? appointmentType)
        //     {
        //         if (appointmentType == null)
        //             return false;

        //         return Enum.TryParse<AppointmentType>(appointmentType, true, out _);
        //     }

        public static bool BeNotPastDate(string? date)
        {
            if (date == null)
                return false;
            return DateTime.TryParse(date, out var parsedDate) && parsedDate >= DateTime.UtcNow.Date;
        }

        public static bool BeValidGender(string? genderString)
        {
            if (genderString == null)
                return false;
            return Enum.TryParse<Gender>(genderString, true, out _);
        }
        
        public static bool BeAtLeast18YearsOldFromString(string? dateString)
        {
            if (dateString == null)
                return false;
            if (!DateTime.TryParse(dateString, out var date))
                return false;

            var today = DateTime.Today;
            var age = today.Year - date.Year;

            if (date > today.AddYears(-age))
                age--;

            return age >= 18;
        }

        public static bool BeValidRole(string? roleString)
        {
            if (roleString == null)
                return false;
            return Enum.TryParse<Role>(roleString, true, out _);
        }




    }
}