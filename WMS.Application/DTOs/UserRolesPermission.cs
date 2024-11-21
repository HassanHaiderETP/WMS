using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WMS.Application.DTOs
{
    public class UserRolesPermission
    {
        [Key]
        public int PermissionId { get; set; }
        public string Module { get; set; }
        public string Permission { get; set; }
        public int RolesId { get; set; }
        public bool IsEnable { get; set; }
        public int CreatedBy { get; set; }
        public string Device { get; set; }

        [JsonIgnore]
        public UserRoles? UserRole { get; set; } // Navigation Property
    }
}
