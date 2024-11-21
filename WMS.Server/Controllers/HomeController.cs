using Microsoft.AspNetCore.Mvc;

namespace WMS.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("get-api-url")]
        public IActionResult GetApiUrl()
        {
            var baseUrl = _configuration.GetValue<string>("ApiSettings:BaseUrl");
            Console.WriteLine("API URL requested");  // Add a simple log
            return Ok(new { baseUrl });
        }

    }
}
