using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WMS.Application.DTOs
{
    public class Vendor
    {
        [Key]
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public DateTime CreatedDateTime { get; set; }
        // Navigation property to represent the many PurchaseOrders
        [JsonIgnore]
        public ICollection<PurchaseOrderM> PurchaseOrders { get; set; }
    }
}
