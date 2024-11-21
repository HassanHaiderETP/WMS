using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WMS.Application.DTOs;
using WMS.Application.Interfaces;
using WMS.Infrastructure.Data;
using WMS.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Define the list of allowed IP addresses
var allowedIps = new List<string>
{
    "::1", // Example IP address
    "192.168.18.78"  // Example IP address (your laptop IP)
};

// Add services to the container
builder.Services.AddControllers();
//builder.Services.AddControllers()
//            .AddJsonOptions(options =>
//            {
//                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
//            });

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // Get Issuer from appsettings.json
            ValidAudience = builder.Configuration["Jwt:Audience"], // Get Audience from appsettings.json
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"])) // Get SecretKey from appsettings.json
        };
    });

// Register DbContext with connection string
builder.Services.AddDbContext<WMSDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("WMSDatabase");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Database connection string 'WMSDatabase' is not configured.");
    }
    options.UseSqlServer(connectionString);
});

// Register repository and service classes
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IUserRolesRepository, UserRolesRepository>();
builder.Services.AddScoped<IUserRolesPermission, UserRolesPermissionRepository>();


//Configure Swagger/OpenAPI for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "WMS API", Version = "v1" });

    // Add JWT Bearer Token authorization to Swagger UI
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by a space and your JWT token"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Add IP Whitelist Middleware
//app.UseMiddleware<IpWhitelistMiddleware>(allowedIps);  // Register the middleware to check IPs before proceeding with the request

// Use CORS policy
app.UseCors("AllowAllOrigins");

// Serve static files and default files
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction()) // Adjusted for production too
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "WMS API V1");
        c.RoutePrefix = "swagger"; // This will be the path to access the Swagger UI
    });
}

// Additional middleware
app.UseHttpsRedirection();
// Configure the HTTP request pipeline.
app.UseAuthentication(); // Use authentication middleware
app.UseAuthorization();  // Use authorization middleware
app.MapControllers();

// Ensure the fallback to serve the React app is below the Swagger setup
//app.MapFallbackToFile("/index.html");

app.Run();
