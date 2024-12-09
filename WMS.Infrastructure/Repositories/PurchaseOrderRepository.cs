using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Infrastructure.Data;

namespace WMS.Infrastructure.Repositories
{
    public class PurchaseOrderRepository : IPurchaseOrderRepository
    {
        private readonly WMSDbContext _context;

        public PurchaseOrderRepository(WMSDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Vendor>> GetAllVendorsAsync()
        {
            return await _context.Vendors.ToListAsync();
        }
        public async Task<PurchaseOrderM> CreatePurchaseOrderAsync(PurchaseOrderM purchaseOrderDto)
        {
            var purchaseOrder = new PurchaseOrderM
            {
                RequisitionId = purchaseOrderDto.RequisitionId,
                VendorId = purchaseOrderDto.VendorId,
                CreatedDateTime = DateTime.Now,
                POSatus = purchaseOrderDto.POSatus,
                ApprovedBy = purchaseOrderDto.ApprovedBy,
            };

            _context.PurchaseOrdersM.Add(purchaseOrder);
            await _context.SaveChangesAsync();

            return MapToPurchaseOrderDTO(purchaseOrder);
        }
        private PurchaseOrderM MapToPurchaseOrderDTO(PurchaseOrderM purchaseOrder)
        {
            return new PurchaseOrderM
            {
                PurchaseOrderMId = purchaseOrder.PurchaseOrderMId,
            };
        }
        public async Task<IEnumerable<PurchaseOrderM>> GelAllPurchaseOrderAsync()
        {
            return await _context.PurchaseOrdersM
                        .Include(po => po.Vendor) // Include the Vendor entity
                        .ToListAsync();
        }
    }
}
