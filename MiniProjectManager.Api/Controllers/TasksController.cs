using System.IdentityModel.Tokens.Jwt;   // for JwtRegisteredClaimNames
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Dtos.Task;
using System.Security.Claims;

namespace MiniProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _db;
        public TasksController(AppDbContext db) => _db = db;

        // Safe helper: returns true and sets userId if claim exists and is an int
        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(sub)) return false;
            return int.TryParse(sub, out userId);
        }

        // POST /api/projects/{projectId}/tasks
        [HttpPost("projects/{projectId}/tasks")]
        public async Task<IActionResult> CreateTask(int projectId, TaskCreateDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
            if (project == null) return NotFound(new { message = "Project not found or not owned by user" });

            var projectTask = new Models.ProjectTask
            {
                Title = dto.Title,
                DueDate = dto.DueDate,
                ProjectId = projectId
            };
            _db.Tasks.Add(projectTask);
            await _db.SaveChangesAsync();

            var responseDto = new TaskDto
            {
                Id = projectTask.Id,
                Title = projectTask.Title,
                DueDate = projectTask.DueDate,
                IsCompleted = projectTask.IsCompleted,
                ProjectId = projectTask.ProjectId
            };

            return CreatedAtAction(nameof(GetTask), new { taskId = projectTask.Id }, responseDto);
        }

        // PUT /api/tasks/{taskId}
        [HttpPut("tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, TaskUpdateDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var taskEntity = await _db.Tasks.Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);

            if (taskEntity == null) return NotFound();

            taskEntity.Title = dto.Title;
            taskEntity.DueDate = dto.DueDate;
            taskEntity.IsCompleted = dto.IsCompleted;
            await _db.SaveChangesAsync();

            var responseDto = new TaskDto
            {
                Id = taskEntity.Id,
                Title = taskEntity.Title,
                DueDate = taskEntity.DueDate,
                IsCompleted = taskEntity.IsCompleted,
                ProjectId = taskEntity.ProjectId
            };

            return Ok(responseDto);
        }

        // DELETE /api/tasks/{taskId}
        [HttpDelete("tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var taskEntity = await _db.Tasks.Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);
            if (taskEntity == null) return NotFound();

            _db.Tasks.Remove(taskEntity);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("tasks/{taskId}")]
        public async Task<IActionResult> GetTask(int taskId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var taskDto = await _db.Tasks.Include(t => t.Project)
                .Where(t => t.Id == taskId && t.Project.UserId == userId)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    IsCompleted = t.IsCompleted,
                    ProjectId = t.ProjectId
                })
                .FirstOrDefaultAsync();

            if (taskDto == null) return NotFound();
            return Ok(taskDto);
        }
    }
}
