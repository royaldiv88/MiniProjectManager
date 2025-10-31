using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Models;

namespace MiniProjectManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ProjectTask> Tasks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Optional: configure cascade delete for tasks when projects removed
            builder.Entity<Project>()
                .HasMany(p => p.Tasks)
                .WithOne(t => t.Project)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }
    }
}
