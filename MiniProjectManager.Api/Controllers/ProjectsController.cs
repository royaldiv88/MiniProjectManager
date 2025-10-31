using System.IdentityModel.Tokens.Jwt;   // for JwtRegisteredClaimNames
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Dtos.Project;
using System.Security.Claims;

namespace MiniProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ProjectsController(AppDbContext db) => _db = db;

        // Safe helper: returns true and sets userId if claim exists and is an int
        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(sub)) return false;
            return int.TryParse(sub, out userId);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var projects = await _db.Projects
                .Where(p => p.UserId == userId)
                .Select(p => new ProjectDto { Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt })
                .ToListAsync();
            return Ok(projects);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProjectCreateDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var project = new Models.Project
            {
                Title = dto.Title,
                Description = dto.Description,
                UserId = userId
            };
            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            var resp = new ProjectDto { Id = project.Id, Title = project.Title, Description = project.Description, CreatedAt = project.CreatedAt };
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, resp);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var project = await _db.Projects
                .Include(p => p.Tasks)
                .Where(p => p.Id == id && p.UserId == userId)
                .FirstOrDefaultAsync();

            if (project == null) return NotFound();

            var result = new
            {
                Id = project.Id,
                project.Title,
                project.Description,
                project.CreatedAt,
                Tasks = project.Tasks.Select(t => new {
                    t.Id, t.Title, t.DueDate, t.IsCompleted, t.ProjectId
                })
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "Missing or invalid user claim." });

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (project == null) return NotFound();
            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
