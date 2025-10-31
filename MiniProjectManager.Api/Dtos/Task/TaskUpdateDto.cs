using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Dtos.Task
{
    public class TaskUpdateDto
    {
        [Required, MinLength(1), MaxLength(200)]
        public string Title { get; set; } = null!;

        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }
}
