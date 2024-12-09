using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WMS.Application.DTOs
{
    public class PurchaseOrderD
    {
        [Key]
        public int PurchaseOrderDId { get; set; }
        public int PurchaseOrderMId { get; set; }
        public int ItemId { get; set; }
        public int ItemSkuId { get; set; }
        public int PoQuantity { get; set; }
        public DateTime CreatedDateTime { get; set; }

        // Navigation property to the PurchaseOrderM
        public PurchaseOrderM PurchaseOrderM { get; set; }
    }
}
