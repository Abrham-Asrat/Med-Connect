using dotenv.net;
using FluentValidation;
using BackendAPI.Source.Config;
using BackendAPI.Source.Data;
using BackendAPI.Source.Service;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using BackendAPI.Source.Validation;
using Microsoft.Extensions.Options;



// Load Environment Variables
var envFilePath = Path.Combine(Directory.GetCurrentDirectory(), ".env");

if (!File.Exists(envFilePath))
{
    throw new FileNotFoundException(".env file not found. Please create a .env file in the Backend directory with the required configuration.");
}

DotEnv.Load(options: new DotEnvOptions(ignoreExceptions: false, envFilePaths: new[] { envFilePath }));

// Debug Auth0 Configuration

var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN");
var auth0Audience = Environment.GetEnvironmentVariable("AUTH0_AUDIENCE");
var auth0ClientId = Environment.GetEnvironmentVariable("AUTH0_CLIENT_ID");
var auth0ClientSecret = Environment.GetEnvironmentVariable("AUTH0_CLIENT_SECRET");

if (string.IsNullOrEmpty(auth0Domain) || string.IsNullOrEmpty(auth0Audience) || string.IsNullOrEmpty(auth0ClientId) || string.IsNullOrEmpty(auth0ClientSecret))
{
    throw new Exception("Auth0 configuration is missing. Please ensure AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET are set in the .env file.");
}

var builder = WebApplication.CreateBuilder(args);
{
    Log.Logger = new LoggerConfiguration()
       .MinimumLevel.Debug() // Set the minimum log level to Debug
       .WriteTo.Console() // Write logs to the console
       .WriteTo.File("Logs/HealthHub.log", rollingInterval: RollingInterval.Day) // Write logs to a file
       .WriteTo.Seq("http://localhost:5341/") // Write logs to Seq
       .CreateLogger();

    Log.Information("Application Starting...");

    // Configure Serilog to capture logs from application host
    builder.Host.UseSerilog();




    // Database Configuration
    builder.Services.AddDbContext<ApplicationDbContext>((ServiceProvider, options) =>
        {
            var appConfig = ServiceProvider.GetRequiredService<AppConfig>();
            var connectionString = appConfig.DatabaseConnection;

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new Exception("Database connection string is missing. Please ensure DB_CONNECTION is set in the .env file.");
            }
            Log.Information($"Using Database Connection String: {connectionString}");

            options.UseSqlServer(connectionString, sqlOptions =>
               {
                   sqlOptions.EnableRetryOnFailure(
                       maxRetryCount: 3,
                       maxRetryDelay: TimeSpan.FromSeconds(30),
                       errorNumbersToAdd: null
                   );
               }
               );
        },
         ServiceLifetime.Scoped  // Explicitly set to Scoped
    );


    //Register validation Services 
    builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();


    // Register Application Services
    builder.Services.AddScoped<UserService>();
    builder.Services.AddScoped<Auth0Service>();


    // Register AppConfig

    // swagger Configuration

    builder.Services.AddSwaggerGen(options =>
    {
        var xmlFile = "HealthHub.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        options.IncludeXmlComments(xmlPath);
    });


}


var app = builder.Build();
{
    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseSerilogRequestLogging(); // Enable Serilog request logging

    app.UseHttpsRedirection();

    app.UseAuthorization();

    app.MapControllers();

    // Enable Swagger middleware
    app.UseSwagger();
    app.UseSwaggerUI(Options =>
    {
        Options.SwaggerEndpoint("/swagger/v1/swagger.json", "Med-Connect API V1");
        Options.RoutePrefix = string.Empty; // Set Swagger UI at the root
    });


    app.Run(new AppConfig(app.Configuration).ApiOrigin);
    Log.Information("Application Started Successfully.");
}