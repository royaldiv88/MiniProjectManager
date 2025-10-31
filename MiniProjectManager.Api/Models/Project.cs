using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Models
{
    public class Project
    {
        public int Id { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Owner
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Tasks
        public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    }
}
