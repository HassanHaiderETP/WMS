using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories
{
    public class UserRolesRepository : IUserRolesRepository
    {
        private readonly WMSDbContext _context;

        public UserRolesRepository(WMSDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserRoles>> GetAllRolesAsync()
        {
            return await _context.UserRoles.ToListAsync();
        }

        public async Task<UserRoles?> GetRoleByIdAsync(int id)
        {
            //return await _context.UserRoles.Include(r => r.UserProfiles).FirstOrDefaultAsync(r => r.RolesId == id);
            return await _context.UserRoles.FirstOrDefaultAsync(r => r.RolesId == id);
        }

        public async Task<UserRoles> AddRoleAsync(UserRoles role)
        {
            // Check if a role with the same description already exists
            var existingRole = await _context.UserRoles
                                             .FirstOrDefaultAsync(r => r.RolesDesc == role.RolesDesc);

            if (existingRole != null)
            {
                throw new Exception("Role with the same description already exists.");
            }

            // Step 1: Add the new role to the database
            await _context.UserRoles.AddAsync(role);
            await _context.SaveChangesAsync();  // Save the role first to generate the role ID

            // Step 2: Get the modules and permissions for the Admin role
            var adminRole = await _context.UserRoles
                                           .FirstOrDefaultAsync(r => (r.RolesDesc.ToLower() == "admin" || r.RolesId == 1));

            if (adminRole == null)
            {
                throw new Exception("Admin role does not exist.");
            }

            var adminPermissions = await _context.UserRolesPermissions
                                                  .Where(p => p.RolesId == adminRole.RolesId)
                                                  .ToListAsync();

            // Step 3: Add the Admin role's permissions to the new role
            foreach (var permission in adminPermissions)
            {
                var newPermission = new UserRolesPermission
                {
                    Module = permission.Module,
                    Permission = permission.Permission,
                    RolesId = role.RolesId,  // Use the newly created role's ID
                    IsEnable = false,
                    CreatedBy = permission.CreatedBy,
                    Device = permission.Device
                };

                // Add the new permission to the UserRolesPermission table
                await _context.UserRolesPermissions.AddAsync(newPermission);
            }

            // Step 4: Save changes to the UserRolesPermission table
            await _context.SaveChangesAsync();

            return role;
        }

        public async Task<UserRoles> UpdateRoleAsync(UserRoles role)
        {
            try
            {
                // Fetch the existing role from the database
                var existingRole = await _context.UserRoles
                                                  .Include(r => r.UserProfiles)
                                                  .Include(r => r.UserRolesPermissions)
                                                  .FirstOrDefaultAsync(r => r.RolesId == role.RolesId);

                if (existingRole == null)
                {
                    throw new Exception("Role not found");
                }

                // Preserve the CreatedBy field and existing UserProfiles
                role.CreatedBy = existingRole.CreatedBy;
                role.UserProfiles = existingRole.UserProfiles;
                role.UserRolesPermissions = existingRole.UserRolesPermissions;

                // Update only the properties that are allowed to change
                existingRole.RolesDesc = role.RolesDesc;

                _context.UserRoles.Update(existingRole);
                await _context.SaveChangesAsync();

                return existingRole;
            }
            catch (Exception ex)
            {
                //_logger.LogError($"Error updating role: {ex.Message}");
                throw new Exception("An error occurred while updating the role.");
            }
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            try
            {
                // Fetch the role and its associated permissions and profiles
                var role = await _context.UserRoles
                    .Include(r => r.UserProfiles)
                    .Include(r => r.UserRolesPermissions) // Include the related UserRolesPermissions
                    .FirstOrDefaultAsync(r => r.RolesId == id);

                if (role == null)
                {
                    return false; // Role not found
                }

                // Step 1: Delete associated permissions (UserRolesPermission)
                if (role.UserRolesPermissions != null && role.UserRolesPermissions.Any())
                {
                    _context.UserRolesPermissions.RemoveRange(role.UserRolesPermissions); // Remove related permissions
                }

                // Step 2: Delete associated UserProfiles
                if (role.UserProfiles != null && role.UserProfiles.Any())
                {
                    _context.UserProfiles.RemoveRange(role.UserProfiles); // Remove related profiles
                }

                // Step 3: Delete the role itself
                _context.UserRoles.Remove(role); // Remove the role

                // Save changes to the database
                var result = await _context.SaveChangesAsync();

                // Check if any changes were made
                if (result > 0)
                {
                    return true; // Role and associated profiles and permissions deleted successfully
                }
                else
                {
                    return false; // No changes were made
                }
            }
            catch (Exception ex)
            {
                // Log exception (use a logger here)
                Console.WriteLine($"Error deleting role: {ex.Message}");
                return false; // Return false if an exception occurs
            }
        }
    }
}
