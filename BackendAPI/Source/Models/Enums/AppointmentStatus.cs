namespace BackendAPI.Source.Models.Enums
{
    public enum AppointmentStatus
    {
        pending,
        scheduled,
        confirmed,
        completed, // keeping for backward compatibility (maps to closed)
        cancelled,
        active,
        follow_up,
        closed
    }
}