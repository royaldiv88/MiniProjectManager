namespace MiniProjectManager.Api.Dtos.Project
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
