using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs
{
    public class UserProfile
    {
        [Key]
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int CreatedBy { get; set; }
        public int RolesID { get; set; }
        public string Password { get; set; }
        public bool IsEnabled { get; set; }

        public UserRoles? UserRole { get; set; } // Navigation Property
    }
}
