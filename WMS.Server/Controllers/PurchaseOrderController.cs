using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.Interfaces;
using WMS.Infrastructure.Repositories;
using WMS.Application.DTOs;

namespace WMS.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderRepository _purchaseOrderRepository;
        private readonly IConfiguration _configuration;

        public PurchaseOrderController(IPurchaseOrderRepository purchaseOrderRepository, IConfiguration configuration)
        {
            _purchaseOrderRepository = purchaseOrderRepository;
            _configuration = configuration;
        }

        // Route: api/PurchaseOrder/GetAllVendors
        [HttpGet]
        [Authorize]
        [Route("GetAllVendors")]
        public async Task<IActionResult> GetAllUsers()
        {
            // This route is now protected by JWT authentication
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }

            var vendors = await _purchaseOrderRepository.GetAllVendorsAsync();
            return Ok(vendors);
        }

        // Route: api/PurchaseOrder/GetAllPurchaseOrders
        [HttpGet]
        [Authorize]
        [Route("GetAllPurchaseOrders")]
        public async Task<IActionResult> GetAllPurchaseOrders()
        {
            // This route is now protected by JWT authentication
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }

            var purchaseOrders = await _purchaseOrderRepository.GelAllPurchaseOrderAsync();

            return Ok(purchaseOrders);
        }

        // Route: api/PurchaseOrder/CreatePO
        [HttpPost]
        [Authorize]
        [Route("CreatePO")]
        public async Task<IActionResult> CreatePurchaseOrder(PurchaseOrderM purchaseOrderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // This route is now protected by JWT authentication
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized("You need to be authenticated to access this resource.");
            }

            try
            {
                var createdPurchaseOrder = await _purchaseOrderRepository.CreatePurchaseOrderAsync(purchaseOrderDto);
                return Ok();
                //return CreatedAtAction("GetPurchaseOrderById", new { id = createdPurchaseOrder.PurchaseOrderMId }, createdPurchaseOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the purchase order.");
            }
        }
    }
}
