namespace BackendAPI.Source.Models.ViewModel
{
    public class VerifyEmailModel
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? VerificationLink { get; set; }
        public string? SupportEmail { get; set; }
    }
}
