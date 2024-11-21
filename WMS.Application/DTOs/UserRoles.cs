using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs
{
    public class UserRoles
    {
        [Key]
        public int RolesId { get; set; }
        public string RolesDesc { get; set; }
        public int? CreatedBy { get; set; }

        // Navigation property to UserProfiles
        public ICollection<UserProfile>? UserProfiles { get; set; }

        // Navigation property to UserRolesPermission (the permissions assigned to this role)
        public ICollection<UserRolesPermission>? UserRolesPermissions { get; set; } // UserRoles can have many permissions
    }
}
