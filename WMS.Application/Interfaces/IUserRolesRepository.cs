using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;

namespace WMS.Application.Interfaces
{
    public interface IUserRolesRepository
    {
        Task<IEnumerable<UserRoles>> GetAllRolesAsync();
        Task<UserRoles?> GetRoleByIdAsync(int id);
        Task<UserRoles> AddRoleAsync(UserRoles role);
        Task<UserRoles> UpdateRoleAsync(UserRoles role);
        Task<bool> DeleteRoleAsync(int id);
    }
}
