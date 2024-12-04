using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using System.Security.Cryptography;
using System.IO;
using WMS.Core.Entities;
using Microsoft.AspNetCore.Authorization;

namespace WMS.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IConfiguration _configuration;  // Inject IConfiguration to access the app settings

        public UserProfileController(IUserProfileRepository userProfileRepository, IConfiguration configuration)
        {
            _userProfileRepository = userProfileRepository;
            _configuration = configuration;
        }

        public static string EncryptPassword(string textToEncrypt)
        {
            try
            {
                string ToReturn = "";
                string _key = "ay$a5%&jwrtmnh;lasjdf98787";
                string _iv = "abc@98797hjkas$&asd(*$%";
                byte[] _ivByte = { };
                _ivByte = System.Text.Encoding.UTF8.GetBytes(_iv.Substring(0, 8));
                byte[] _keybyte = { };
                _keybyte = System.Text.Encoding.UTF8.GetBytes(_key.Substring(0, 8));
                MemoryStream ms = null; CryptoStream cs = null;
                byte[] inputbyteArray = System.Text.Encoding.UTF8.GetBytes(textToEncrypt);
                using (DESCryptoServiceProvider des = new DESCryptoServiceProvider())
                {
                    ms = new MemoryStream();
                    cs = new CryptoStream(ms, des.CreateEncryptor(_keybyte, _ivByte), CryptoStreamMode.Write);
                    cs.Write(inputbyteArray, 0, inputbyteArray.Length);
                    cs.FlushFinalBlock();
                    ToReturn = Convert.ToBase64String(ms.ToArray());
                }
                return ToReturn;
            }
            catch (Exception ae)
            {
                throw new Exception(ae.Message, ae.InnerException);
            }
        }

        public static string DecryptPassword(string textToDecrypt)
        {
            try
            {
                string ToReturn = "";
                string _key = "ay$a5%&jwrtmnh;lasjdf98787";
                string _iv = "abc@98797hjkas$&asd(*$%";
                byte[] _ivByte = Encoding.UTF8.GetBytes(_iv.Substring(0, 8));
                byte[] _keybyte = Encoding.UTF8.GetBytes(_key.Substring(0, 8));
                byte[] inputbyteArray = Convert.FromBase64String(textToDecrypt.Replace(" ", "+"));

                using (var des = new DESCryptoServiceProvider())
                using (var ms = new MemoryStream())
                using (var cs = new CryptoStream(ms, des.CreateDecryptor(_keybyte, _ivByte), CryptoStreamMode.Write))
                {
                    cs.Write(inputbyteArray, 0, inputbyteArray.Length);
                    cs.FlushFinalBlock();
                    return Encoding.UTF8.GetString(ms.ToArray());
                }
            }
            catch (Exception ae)
            {
                throw new Exception(ae.Message, ae.InnerException);
            }
        }

        private string GenerateAccessToken(string userId)
        {
            // Define JWT token expiration time
            var expiration = DateTime.Now.AddHours(1); // Access token expires in 1 hour
            //var expiration = DateTime.UtcNow.AddMinutes(30); // change this if local time doesn't work.

            // Define claims (userId, and any other information you want to embed in the token)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourVeryLongSecureSecretKeyHere1234567890")); // Secret key should be stored securely, not hardcoded
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "WMS_Admin", // Can be your app name or domain
                audience: "WMS_Users",
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[32]; // Create a random byte array for the refresh token
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes); // Fill the byte array with random data
            }
            return Convert.ToBase64String(randomBytes); // Convert to Base64 string for safe transport
        }

        private bool ValidateRefreshToken(string refreshToken)
        {
            // Check if the refresh token exists and is not expired (this is where you'd check your memory cache or session)
            // This is just an example, adjust according to your storage mechanism
            return !string.IsNullOrEmpty(refreshToken);
        }

        [HttpPost("refresh-token/{RefreshToken}")]
        public async Task<IActionResult> RefreshToken(string RefreshToken)
        {
            // Validate the incoming refresh token
            var isValidRefreshToken = ValidateRefreshToken(RefreshToken);

            if (!isValidRefreshToken)
            {
                return Unauthorized("Invalid refresh token.");
            }

            // Generate a new access token
            var newAccessToken = GenerateAccessToken(RefreshToken);
            var newRefreshToken = GenerateRefreshToken();

            return Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken
            });
        }

        // Method to authenticate user and generate JWT token
        [HttpPost]
        [Route("Authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserProfile loginDto)
        {
            if (loginDto == null || string.IsNullOrEmpty(loginDto.UserName) || string.IsNullOrEmpty(loginDto.Password))
            {
                return BadRequest("Invalid credentials");
            }

            // Retrieve user from database
            var user = await _userProfileRepository.GetAllAsync();
            var authenticatedUser = user.FirstOrDefault(u => u.UserName == loginDto.UserName);

            if (authenticatedUser == null || DecryptPassword(authenticatedUser.Password) != loginDto.Password)
            {
                return Unauthorized("Invalid email or password");
            }

            // Check if the account is enabled
            if (!authenticatedUser.IsEnabled)
            {
                return Unauthorized("Your account is currently disabled.");
            }

            //// Generate JWT token
            //var token = GenerateJwtToken(authenticatedUser);
            //return Ok(new { Token = token });
            // Authenticate method in UserProfileController
            var token = GenerateJwtToken(authenticatedUser);
            var refreshToken = GenerateRefreshToken();

            return Ok(new { userId = authenticatedUser.UserId, Token = token, RefreshToken = refreshToken, roleId = authenticatedUser.RolesID });

        }

        // Helper method to generate JWT token
        private string GenerateJwtToken(UserProfile user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, user.RolesID.ToString()),  // You can add more claims such as Role if you have roles
                new Claim("Email", user.UserName) // Add email to claims if required
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Token expiry time
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Route: api/UserProfile/GetAllUsers
        [HttpGet]
        [Authorize]
        [Route("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            // This route is now protected by JWT authentication
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }

            var users = await _userProfileRepository.GetAllWithRolesAsync();
            foreach (var user in users)
            {
                user.Password = DecryptPassword(user.Password);
            }
            return Ok(users);
        }

        // Route: api/UserProfile/GetAllRoles
        [HttpGet]
        [Authorize]
        [Route("GetAllRoles")]
        public async Task<IActionResult> GetAllRoles()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }
            var roles = await _userProfileRepository.GetAllRoles();
            return Ok(roles);
        }

        // Route: api/UserProfile/GetById/{id}
        [HttpGet]   
        [Authorize]
        [Route("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }
            var user = await _userProfileRepository.GetByIdAsync(id);
            return user != null ? Ok(user) : NotFound();
        } 

        [HttpPost]
        [Authorize]
        [Route("Create")]
        public async Task<IActionResult> Create([FromBody] UserProfile user)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            user.Password = EncryptPassword(user.Password);

            await _userProfileRepository.AddAsync(user);
            return Ok();
            //return CreatedAtAction(nameof(GetById), new { id = user.UserId }, user);
        }

        // Route: api/UserProfile/Update/{id}
        [HttpPost]
        [Authorize]
        [Route("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserProfile user)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }
            if (id != user.UserId) return BadRequest();
            user.Password = EncryptPassword(user.Password);
            await _userProfileRepository.UpdateAsync(user);
            return Ok();
        }

        // Route: api/UserProfile/Delete/{id}
        [HttpPost]
        [Authorize]
        [Route("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }
            var user = await _userProfileRepository.GetByIdAsync(id);
            if (user == null) return NotFound();  // If the user doesn't exist, return 404

            await _userProfileRepository.DeleteAsync(id);  // Delete user by ID
            return Ok();  // Return 200 OK after deletion
        }

        [Authorize]
        [HttpPost]
        [Route("UpdatePassword/{userId}")]
        public async Task<IActionResult> UpdatePassword(int userId, [FromBody] string newPassword)
        {
            if (string.IsNullOrEmpty(newPassword))
                return BadRequest("Password cannot be empty");

            await _userProfileRepository.UpdatePasswordAsync(Convert.ToInt32(userId), EncryptPassword(newPassword));
            return Ok("Password updated successfully");
        }

        [Authorize]
        [HttpGet]
        [Route("GetCheckUserPermission/{roleId}")]
        public async Task<IActionResult> CheckUserPermission(int roleId, string module)
        {
            var permissions = await _userProfileRepository.CheckUserPermission(roleId, module);
            return permissions != null ? Ok(permissions) : NotFound();
        }
    }
}
