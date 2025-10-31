using System.Collections.Generic;

namespace MiniProjectManager.Api.Dtos.Scheduler
{
    public class ScheduleResponse
    {
        public List<string> RecommendedOrder { get; set; } = new List<string>();
    }
}
