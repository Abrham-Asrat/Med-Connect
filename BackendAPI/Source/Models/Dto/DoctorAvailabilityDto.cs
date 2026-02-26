using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Interface;

namespace BackendAPI.Source.Models.Dto
{
    public record DoctorAvailabilityDto(string AvailableDay, string startTime , string EndTime);

    public record Availability
    {
        public required Guid DoctorAvailabilityID { get; set; }
        public required DayOfWeek Day { get; set; }

        public required List<AppointmentTimeRange> AvailableTimes { get; set; }
    }
   
}