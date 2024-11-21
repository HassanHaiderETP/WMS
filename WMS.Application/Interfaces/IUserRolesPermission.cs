using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;

namespace WMS.Application.Interfaces
{
    public interface IUserRolesPermission
    {
        Task<List<UserRoles>> GetAllRolesAsync();
        Task<List<UserRolesPermission>> GetPermissionsByRoleIdAsync(int roleId);
        Task UpdatePermissionsAsync(List<UserRolesPermission> permissions);
    }
}
