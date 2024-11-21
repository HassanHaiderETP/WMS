using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using WMS.Application.DTOs;

namespace WMS.Infrastructure.Data
{
    public class WMSDbContext : DbContext
    {
        public WMSDbContext(DbContextOptions<WMSDbContext> options) : base(options) { }

        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<UserRoles> UserRoles { get; set; }
        public DbSet<UserRolesPermission> UserRolesPermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Ensure the correct table names
            modelBuilder.Entity<UserProfile>().ToTable("UserProfile");
            modelBuilder.Entity<UserRoles>().ToTable("UserRoles");
            modelBuilder.Entity<UserRolesPermission>().ToTable("UserRolesPermission");

            // Define the relationship between UserProfile and UserRoles
            modelBuilder.Entity<UserProfile>()
                .HasOne(u => u.UserRole) // Each UserProfile has one associated UserRole
                .WithMany(r => r.UserProfiles) // Each UserRole can have many UserProfiles
                .HasForeignKey(u => u.RolesID) // Foreign key in UserProfile pointing to UserRoles
                .OnDelete(DeleteBehavior.Cascade); // Cascading delete behavior

            // Define the relationship between UserRolesPermission and UserRoles
            modelBuilder.Entity<UserRolesPermission>()
                .HasOne(p => p.UserRole) // Each UserRolesPermission has one associated UserRole
                .WithMany(r => r.UserRolesPermissions) // Each UserRole can be associated with many UserRolesPermissions
                .HasForeignKey(p => p.RolesId) // Foreign key in UserRolesPermission (RolesId)
                .OnDelete(DeleteBehavior.Cascade); // Cascade delete, meaning if a UserRole is deleted, all associated UserRolesPermission are deleted
        }
    }
}
