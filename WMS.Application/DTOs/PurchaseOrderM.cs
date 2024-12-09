using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WMS.Application.DTOs
{
    public class PurchaseOrderM
    {
        [Key]
        public int PurchaseOrderMId { get; set; }
        public int? RequisitionId { get; set; }
        public int VendorId { get; set; }
        public DateTime? CreatedDateTime { get; set; }
        public string POSatus { get; set; }
        public int? ApprovedBy { get; set; }

        // Navigation property to the Vendor entity
        public Vendor? Vendor { get; set; }
        public ICollection<PurchaseOrderD>? PurchaseOrdersD { get; set; }
    }
}
