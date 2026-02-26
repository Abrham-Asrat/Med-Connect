using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Interface
{
    public class AppointmentTimeRange(TimeOnly startTime, TimeOnly endTime)
    {
        public TimeOnly StartTime { get; set; } = startTime;
        public TimeOnly EndTime { get; set; } = endTime;

        public void Deconstruct(out TimeOnly startTime, out TimeOnly endTime)
        {
            startTime = StartTime;
            endTime = EndTime;
        }
    }
}