using WMS.Application.DTOs;
using WMS.Core.Entities;

namespace WMS.Application.Interfaces
{
    public interface IUserProfileRepository
    {
        Task<IEnumerable<UserProfile>> GetAllAsync();
        Task<IEnumerable<UserProfileWithRole>> GetAllWithRolesAsync();
        Task<IEnumerable<UserRoles>> GetAllRoles();
        Task<UserProfile> GetByIdAsync(int userId);
        Task AddAsync(UserProfile user);
        Task UpdateAsync(UserProfile user);
        Task DeleteAsync(int userId);
        Task UpdatePasswordAsync(int userId, string newPassword);
    }
}
