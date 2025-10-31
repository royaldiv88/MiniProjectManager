namespace MiniProjectManager.Api.Services
{
    public interface IJwtService
    {
        string GenerateToken(int userId, string username);
    }
}
