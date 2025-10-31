namespace MiniProjectManager.Api.Dtos.Task
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public int ProjectId { get; set; }
    }
}
