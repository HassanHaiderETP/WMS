using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;

namespace WMS.Application.Interfaces
{
    public interface IPurchaseOrderRepository
    {
        Task<IEnumerable<Vendor>> GetAllVendorsAsync();
        Task<PurchaseOrderM> CreatePurchaseOrderAsync(PurchaseOrderM purchaseOrder);
        Task<IEnumerable<PurchaseOrderM>> GelAllPurchaseOrderAsync();
    }
}
