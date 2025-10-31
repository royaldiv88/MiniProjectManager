using System;
using System.Collections.Generic;
using System.Linq;
using MiniProjectManager.Api.Dtos.Scheduler;

namespace MiniProjectManager.Api.Services
{
    public interface ISchedulerService
    {
        /// <summary>
        /// Returns ordered list of task titles respecting dependencies and tie-breakers.
        /// Throws ArgumentException for missing dependency reference.
        /// Throws InvalidOperationException for cycles.
        /// </summary>
        List<string> ComputeSchedule(ScheduleRequest request);
    }

    public class SchedulerService : ISchedulerService
    {
        public List<string> ComputeSchedule(ScheduleRequest request)
        {
            if (request.Tasks == null || request.Tasks.Count == 0) return new List<string>();

            // normalize titles -> unique checks
            var tasks = request.Tasks;
            var titleToTask = new Dictionary<string, ScheduleTaskDto>(StringComparer.OrdinalIgnoreCase);
            foreach (var t in tasks)
            {
                if (string.IsNullOrWhiteSpace(t.Title))
                    throw new ArgumentException("Task title cannot be empty.");

                // ensure unique titles
                if (titleToTask.ContainsKey(t.Title))
                    throw new ArgumentException($"Duplicate task title found: '{t.Title}'.");

                titleToTask[t.Title] = t;
            }

            // Build graph: edges dependency -> task (i.e., dependency must come before task)
            var inDegree = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            var children = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
            foreach (var title in titleToTask.Keys)
            {
                inDegree[title] = 0;
                children[title] = new List<string>();
            }

            foreach (var t in tasks)
            {
                foreach (var dep in t.Dependencies ?? new List<string>())
                {
                    if (!titleToTask.ContainsKey(dep))
                        throw new ArgumentException($"Task '{t.Title}' depends on unknown task '{dep}'. Please include it in the tasks list.");

                    // dep -> t.Title
                    children[dep].Add(t.Title);
                    inDegree[t.Title] = inDegree[t.Title] + 1;
                }
            }

            // Kahn's algorithm with priority: earliest dueDate, then larger estimatedHours, then title
            var comparer = Comparer<string>.Create((a, b) =>
            {
                var ta = titleToTask[a];
                var tb = titleToTask[b];

                // due date ascending (earlier first). nulls considered max (i.e., later)
                var da = ta.DueDate;
                var db = tb.DueDate;
                int cmp;
                if (da.HasValue && db.HasValue)
                    cmp = DateTime.Compare(da.Value, db.Value);
                else if (da.HasValue && !db.HasValue)
                    cmp = -1;
                else if (!da.HasValue && db.HasValue)
                    cmp = 1;
                else
                    cmp = 0;

                if (cmp != 0) return cmp;

                // estimatedHours: higher first -> sort descending
                var ea = ta.EstimatedHours ?? 0;
                var eb = tb.EstimatedHours ?? 0;
                cmp = -ea.CompareTo(eb);
                if (cmp != 0) return cmp;

                // fallback alphabetical
                return string.Compare(a, b, StringComparison.OrdinalIgnoreCase);
            });

            // Min-heap / priority queue behaviour using SortedSet
            var available = new SortedSet<string>(comparer);
            foreach (var kv in inDegree)
            {
                if (kv.Value == 0) available.Add(kv.Key);
            }

            var result = new List<string>();
            while (available.Count > 0)
            {
                var next = available.Min;
                available.Remove(next);
                result.Add(next);

                foreach (var child in children[next])
                {
                    inDegree[child]--;
                    if (inDegree[child] == 0)
                    {
                        available.Add(child);
                    }
                }
            }

            // If we didn't schedule all tasks -> cycle exists
            if (result.Count != titleToTask.Count)
            {
                // detect cycle nodes
                var remaining = titleToTask.Keys.Except(result, StringComparer.OrdinalIgnoreCase).ToList();
                throw new InvalidOperationException("Cycle detected in task dependencies. Remaining tasks in cycle: " + string.Join(", ", remaining));
            }

            return result;
        }
    }
}
