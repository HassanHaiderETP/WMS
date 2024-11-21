using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

public class IpWhitelistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly HashSet<string> _allowedIps;

    public IpWhitelistMiddleware(RequestDelegate next, IEnumerable<string> allowedIps)
    {
        _next = next;
        _allowedIps = new HashSet<string>(allowedIps);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var remoteIp = context.Connection.RemoteIpAddress?.ToString();

        if (string.IsNullOrEmpty(remoteIp) || !_allowedIps.Contains(remoteIp))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Access Forbidden: Invalid IP");
            return;
        }

        // If IP is allowed, pass control to the next middleware
        await _next(context);
    }
}
