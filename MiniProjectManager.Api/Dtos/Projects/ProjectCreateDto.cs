using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Dtos.Project
{
    public class ProjectCreateDto
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
