using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Dtos.Auth
{
    public class RegisterRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Username { get; set; } = null!;

        [Required, MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
