using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories
{
    public class UserRolesPermissionRepository : IUserRolesPermission
    {
        private readonly WMSDbContext _context;
        public UserRolesPermissionRepository(WMSDbContext context)
        {
            _context = context;
        }

        // Fetch all roles
        public async Task<List<UserRoles>> GetAllRolesAsync()
        {
            return await _context.UserRoles.ToListAsync();
        }

        // Fetch permissions based on role ID
        public async Task<List<UserRolesPermission>> GetPermissionsByRoleIdAsync(int roleId)
        {
            return await _context.UserRolesPermissions
                .Where(p => p.RolesId == roleId)
                .ToListAsync();
        }

        // Update permissions
        public async Task UpdatePermissionsAsync(List<UserRolesPermission> permissions)
        {
            foreach (var permission in permissions)
            {
                var existingPermission = await _context.UserRolesPermissions
                    .FirstOrDefaultAsync(p => p.PermissionId == permission.PermissionId);

                if (existingPermission != null)
                {
                    existingPermission.IsEnable = permission.IsEnable;
                    existingPermission.Device = permission.Device;
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
