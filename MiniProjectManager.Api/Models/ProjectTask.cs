using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }

        [Required, MinLength(1), MaxLength(200)]
        public string Title { get; set; } = null!;

        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; } = false;

        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
    }
}
