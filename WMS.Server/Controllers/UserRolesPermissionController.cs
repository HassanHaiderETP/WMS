using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;

namespace WMS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserRolesPermissionController : ControllerBase
    {
        private readonly IUserRolesPermission _userRolesPermissionRepo;

        public UserRolesPermissionController(IUserRolesPermission userRolesPermissionRepo)
        {
            _userRolesPermissionRepo = userRolesPermissionRepo;
        }

        [HttpGet("GetAllRoles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _userRolesPermissionRepo.GetAllRolesAsync();
            return Ok(roles);
        }

        [HttpGet("GetPermissions/{roleId}")]
        public async Task<IActionResult> GetPermissions(int roleId)
        {
            var permissions = await _userRolesPermissionRepo.GetPermissionsByRoleIdAsync(roleId);
            return Ok(permissions);
        }

        [HttpPost("UpdatePermissions")]
        public async Task<IActionResult> UpdatePermissions([FromBody] List<UserRolesPermission> permissions)
        {
            if (permissions == null || !permissions.Any())
            {
                return BadRequest("No permissions data received");
            }

            try
            {
                // Clean up the userRole property on the server-side if necessary
                foreach (var permission in permissions)
                {
                    permission.UserRole = null; // Ensure it's null to prevent issues
                }

                await _userRolesPermissionRepo.UpdatePermissionsAsync(permissions);
                return Ok("Permissions updated successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An error occurred while updating permissions.");
            }
        }


    }
}
