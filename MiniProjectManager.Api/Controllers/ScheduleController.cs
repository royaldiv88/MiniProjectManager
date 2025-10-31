using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniProjectManager.Api.Dtos.Scheduler;
using MiniProjectManager.Api.Services;

namespace MiniProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/v1/projects/{projectId}/[controller]")]
    [Authorize] // optional: require auth to use scheduler
    public class ScheduleController : ControllerBase
    {
        private readonly ISchedulerService _scheduler;

        public ScheduleController(ISchedulerService scheduler)
        {
            _scheduler = scheduler;
        }

        [HttpPost]
        public IActionResult ComputeSchedule(int projectId, [FromBody] ScheduleRequest request)
        {
            // Optional: you can validate that projectId exists and belongs to the user
            // For now, we just compute schedule for the provided tasks JSON.

            try
            {
                var order = _scheduler.ComputeSchedule(request);
                var resp = new ScheduleResponse { RecommendedOrder = order };
                return Ok(resp);
            }
            catch (ArgumentException aex)
            {
                return BadRequest(new { message = aex.Message });
            }
            catch (InvalidOperationException iex)
            {
                return BadRequest(new { message = iex.Message });
            }
            catch (Exception ex)
            {
                // unexpected server error
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }
    }
}
