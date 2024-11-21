using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WMS.Core.Entities
{
    public class UserProfileWithRole
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int CreatedBy { get; set; }
        public bool IsEnabled { get; set; }
        public string Password { get; set; }
        public int RolesId { get; set; }
        public string RolesDescription { get; set; }
    }

}
