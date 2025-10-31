using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiniProjectManager.Api.Dtos.Scheduler
{
    public class ScheduleTaskDto
    {
        [Required]
        public string Title { get; set; } = null!;

        public int? EstimatedHours { get; set; } = null;

        public DateTime? DueDate { get; set; } = null;

        public List<string> Dependencies { get; set; } = new List<string>();
    }

    public class ScheduleRequest
    {
        [Required]
        public List<ScheduleTaskDto> Tasks { get; set; } = new List<ScheduleTaskDto>();
    }
}
