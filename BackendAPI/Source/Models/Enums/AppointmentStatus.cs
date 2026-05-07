namespace BackendAPI.Source.Models.Enums
{
    public enum AppointmentStatus
    {
        scheduled,
        completed, // keeping for backward compatibility (maps to closed)
        cancelled,
        active,
        follow_up,
        closed
    }
}