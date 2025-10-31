using Microsoft.EntityFrameworkCore;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Models;
using BCrypt.Net;

namespace MiniProjectManager.Api.Services
{
    public interface IAuthService
    {
        Task<User?> AuthenticateAsync(string username, string password);
        Task<User> RegisterAsync(string username, string password);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        public AuthService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            var user = await _db.Users.SingleOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
            if (user == null) return null;
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash)) return null;
            return user;
        }

        public async Task<User> RegisterAsync(string username, string password)
        {
            var exists = await _db.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower());
            if (exists) throw new InvalidOperationException("Username already exists");

            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User { Username = username, PasswordHash = hash };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }
    }
}
