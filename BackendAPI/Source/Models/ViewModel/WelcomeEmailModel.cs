
namespace BackendAPI.Source.Models.ViewModel
{
    public class  WelcomeEmailModel
    {
        public string? Name { get; set; } 
        public string? Email { get; set; } 
        public int Otp { get; set; }
        public string? SupportEmail { get; set; } 
    }
}