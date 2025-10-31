using Microsoft.AspNetCore.Mvc;
using MiniProjectManager.Api.Data;
using MiniProjectManager.Api.Dtos.Auth;
using MiniProjectManager.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace MiniProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly IJwtService _jwt;

        public AuthController(IAuthService auth, IJwtService jwt)
        {
            _auth = auth;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            try
            {
                var user = await _auth.RegisterAsync(req.Username, req.Password);
                var token = _jwt.GenerateToken(user.Id, user.Username);
                return Ok(new AuthResponse { Token = token });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var user = await _auth.AuthenticateAsync(req.Username, req.Password);
            if (user == null) return Unauthorized(new { message = "Invalid username or password" });

            var token = _jwt.GenerateToken(user.Id, user.Username);
            return Ok(new AuthResponse { Token = token });
        }
    }
}
