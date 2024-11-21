using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;

namespace WMS.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Apply authorization globally to the entire controller
    public class UserRolesController : ControllerBase
    {
        private readonly IUserRolesRepository _userRolesRepository;

        public UserRolesController(IUserRolesRepository userRolesRepository)
        {
            _userRolesRepository = userRolesRepository;
        }

        // GET: api/UserRoles
        [Route("GetAllUserRoles")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRoles>>> GetAllUserRoles()
        {
            var roles = await _userRolesRepository.GetAllRolesAsync();
            return Ok(roles);
        }

        // GET: api/UserRoles/{id}
        [Route("GetRoleById/{id}")]
        [HttpGet]
        public async Task<ActionResult<UserRoles>> GetRoleById(int id)
        {
            var role = await _userRolesRepository.GetRoleByIdAsync(id);
            if (role == null)
                return NotFound();

            return Ok(role);
        }

        // POST: api/UserRoles/Add
        [Route("Add")] // Custom route for adding role
        [HttpPost]
        public async Task<ActionResult<UserRoles>> AddRole([FromBody] UserRoles role)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newRole = await _userRolesRepository.AddRoleAsync(role);
            //return CreatedAtAction(nameof(GetRoleById), new { id = newRole.RolesId }, newRole);
            return Ok();
        }

        // POST: api/UserRoles/Update/{id}
        [Route("Update/{id}")]
        [HttpPost]
        public async Task<ActionResult<UserRoles>> UpdateRole(int id, [FromBody] UserRoles role)
        {
            if (id != role.RolesId)
                return BadRequest("Role ID mismatch");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedRole = await _userRolesRepository.UpdateRoleAsync(role);
            return Ok();
        }

        // POST: api/UserRoles/Delete/{id}
        [Route("Delete/{id}")] // Custom route for deleting role
        [HttpPost]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _userRolesRepository.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound(); // Return 404 if role is not found
            }

            await _userRolesRepository.DeleteRoleAsync(id); // Delete the role by ID
            return Ok("Role deleted successfully");
        }
    }
}
