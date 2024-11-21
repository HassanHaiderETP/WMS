using WMS.Application.Interfaces;
using WMS.Application.DTOs;
using WMS.Core.Entities;
using WMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace WMS.Infrastructure.Repositories
{
    public class UserProfileRepository : IUserProfileRepository
    {
        private readonly WMSDbContext _context;

        public UserProfileRepository(WMSDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserProfile>> GetAllAsync()
        {
            return await _context.UserProfiles.Include(u => u.UserRole).ToListAsync();
        }

        public async Task<IEnumerable<UserProfileWithRole>> GetAllWithRolesAsync()
        {
            return await _context.UserProfiles
                .Include(u => u.UserRole)
                .Select(u => new UserProfileWithRole
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    CreatedBy = u.CreatedBy,
                    IsEnabled = u.IsEnabled,
                    Password = u.Password,
                    RolesId = u.RolesID,
                    RolesDescription = u.UserRole != null ? u.UserRole.RolesDesc : string.Empty
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<UserRoles>> GetAllRoles()
        {
            return await _context.UserRoles
                .Select(u => new UserRoles
                {
                    RolesId = u.RolesId,
                    RolesDesc = u.RolesDesc,
                    CreatedBy = u.CreatedBy
                })
                .ToListAsync();
        }

        public async Task<UserProfile> GetByIdAsync(int userId)
        {
            return await _context.UserProfiles.Include(u => u.UserRole)
                                              .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task AddAsync(UserProfile user)
        {
            await _context.UserProfiles.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(UserProfile user)
        {
            _context.UserProfiles.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePasswordAsync(int userId, string newPassword)
        {
            var user = await _context.UserProfiles.FindAsync(userId);
            if (user != null)
            {
                user.Password = newPassword;
                _context.Entry(user).Property(u => u.Password).IsModified = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(int userId)
        {
            var user = await GetByIdAsync(userId);
            _context.UserProfiles.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
