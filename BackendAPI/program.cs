using BackendAPI.Source.Config;
using BackendAPI.Source.Data;
using BackendAPI.Source.Service;
using BackendAPI.Source.Validation;
using dotenv.net;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
DotEnv.Load(options: new DotEnvOptions(envFilePaths: [".env"]));

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger/OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Med-Connect API", 
        Version = "v1",
        Description = "Medical Connection Platform API"
    });
});

// Configure Entity Framework with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration["DB_CONNECTION"]));

// Register application services
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<Auth0Service>();

// Register configuration
builder.Services.AddSingleton<AppConfig>();

// Register FluentValidation validators
builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Med-Connect API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.EnsureCreated();
        Console.WriteLine("Database ensured/created successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error ensuring database: {ex.Message}");
    }
}

app.Run();