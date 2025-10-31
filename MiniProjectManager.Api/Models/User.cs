using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        // Navigation
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
