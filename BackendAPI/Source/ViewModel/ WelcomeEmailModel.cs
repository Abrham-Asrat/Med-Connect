using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source
{
    public class  WelcomeEmailModel
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Otp { get; set; }
        public string SupportEmail { get; set; } = string.Empty;
    }
}