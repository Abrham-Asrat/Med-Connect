using dotenv.net;
using FluentValidation;
using BackendAPI.Source.Config;
using BackendAPI.Source.Data;
using BackendAPI.Source.Service;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Newtonsoft.Json.Converters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.AspNetCore.Authentication.Cookies;
using BackendAPI.Source.Services;
using BackendAPI.Source.Service.PaymentService;
using BackendAPI.Source.Service.PaymentProviders;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Service.ReviewService;
using BackendAPI.Source.Service.BlogService;
using BackendAPI.Source.Service.ChatService;
using BackendAPI.Source.Hubs;
using BackendAPI.Source.Filters.Error;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;
using System.Threading.RateLimiting;


var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");

if(!File.Exists(envPath))
{
   throw new FileNotFoundException("The .env file was not found at the expected path: " + envPath);

}
// Load Environment Variables
DotEnv.Load(options: new DotEnvOptions(ignoreExceptions: false, envFilePaths: new[] { envPath }));

// Debug Auth0 Configuration
var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN");
var auth0Audience = Environment.GetEnvironmentVariable("AUTH0_AUDIENCE");
var auth0ClientId = Environment.GetEnvironmentVariable("AUTH0_CLIENT_ID");
var auth0ClientSecret = Environment.GetEnvironmentVariable("AUTH0_CLIENT_SECRET");

if (string.IsNullOrEmpty(auth0Domain) || string.IsNullOrEmpty(auth0Audience) || string.IsNullOrEmpty(auth0ClientId) || string.IsNullOrEmpty(auth0ClientSecret))
{
    throw new InvalidOperationException("One or more Auth0 configuration environment variables are missing. Please check your .env file.");
}


var builder = WebApplication.CreateBuilder(args);

{
  // Configure Serilog with appropriate sinks
  Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug() // Set the minimum log level to Debug
    .WriteTo.Console() // Write logs to the console
    .WriteTo.File("Logs/MedConnecy.log", rollingInterval: RollingInterval.Day) // Write logs to a file
    .WriteTo.Seq("http://localhost:5000/") // Write logs to Seq
    .CreateLogger();

  Log.Information("Application Starting...");

  // Configure  to capture logs from application host  

  
  builder.Host.UseSerilog();

  // Database Service
  builder.Services.AddDbContext<ApplicationDbContext>(
    (serviceProvider, options) =>
    {
      var appConfig = serviceProvider.GetRequiredService<AppConfig>();
      var connectionString = appConfig.DatabaseConnection;
      if (string.IsNullOrEmpty(connectionString))
      {
        throw new InvalidOperationException("DB_CONNECTION environment variable is not set.");
      }
      Log.Information($"This is the conn str: {connectionString}");
      options.UseSqlServer(connectionString);
    }
  );

  // Health Checks
  builder.Services.AddHealthChecks()
    .AddCheck("API", () => HealthCheckResult.Healthy("API is running"));
    // Note: Database health check removed to avoid BuildServiceProvider anti-pattern warning
    // In production, use external monitoring tools (Application Insights, Prometheus, etc.)



  builder.Services.AddCors(
    (options) =>
    {
      options.AddPolicy(
        "AllowSpecificOrigin",
        b =>
        {
          var config = new AppConfig(builder.Configuration);
          Log.Logger.Information($"\n\nALlowedOrigins: {config.AllowedOrigins}");

          b.WithOrigins(config.AllowedOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
        }
      );
    }
  );

  /*
      Add Services to the Container
  */
  // Configure authentication with JWT and Auth0
  // 1. Set JwtBearer as the default authentication and challenge schemes
  // 2. Configure JwtBearer options with Auth0 settings
  builder.Services.AddAuthentication(options =>
    {
      // options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      // options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      // options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
      options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
      var appConfig = new AppConfig(builder.Configuration);
      options.Authority = $"https://{appConfig.Auth0Domain}/";
      options.Audience = appConfig.Auth0Audience;
      options.RequireHttpsMetadata = appConfig.IsProduction ?? false;

      // Log.Logger.Information($"\nOrigins: {string.Join(",", appConfig.AllowedOrigins)}");
      Log.Logger.Information($"\nAudience: {options.Audience}");
      Log.Logger.Information($"\nAuthority: {options.Authority}");
      Log.Logger.Information($"\nClientId: {appConfig.Auth0ClientId}");
      Log.Logger.Information($"\nClientSecret: {appConfig.Auth0ClientSecret}");

      // Configure Token Validation Parameters
      options.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // ValidIssuer = appConfig.Auth0Authority,
        // ValidIssuer SHOULD have a trailing slash
        ValidIssuer = $"https://{appConfig.Auth0Domain}/",
        ValidAudience = appConfig.Auth0Audience
      };

       // Optional: Add logging for auth failures
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Log.Error($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Log.Information($"Token validated for user: {context.Principal?.Identity?.Name}");
            return Task.CompletedTask;
        }
    };
    });

  // Configure Authorization Policies
  builder.Services.AddAuthorization(options =>
  {
    // Admin-only policy
    options.AddPolicy("AdminOnly", policy =>
      policy.RequireRole("Admin"));

    // Doctor-only policy
    options.AddPolicy("DoctorOnly", policy =>
      policy.RequireRole("Doctor"));

    // Patient-only policy
    options.AddPolicy("PatientOnly", policy =>
      policy.RequireRole("Patient"));

    // Admin or Doctor policy
    options.AddPolicy("AdminOrDoctor", policy =>
      policy.RequireRole("Admin", "Doctor"));

    // Any authenticated user policy
    options.AddPolicy("AuthenticatedUser", policy =>
      policy.RequireAuthenticatedUser());
  });


  // Register Validation Services
  builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();


  // Register the App Configuration Service
  builder.Services.AddSingleton<AppConfig>(provider =>
  {
    var config = provider.GetRequiredService<IConfiguration>();
    return new AppConfig(config);
  });

  // This service allows you to access the HttpContext in classes that
  // are not directly part of the HTTP request pipeline
  builder.Services.AddHttpContextAccessor();

  // Configure Rate Limiting for security
  builder.Services.AddRateLimiter(rateLimiterOptions =>
  {
    // Return custom response when rate limit is exceeded
    rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    rateLimiterOptions.OnRejected = async (context, cancellationToken) =>
    {
      var response = new
      {
        success = false,
        title = "Too Many Requests",
        message = "Rate limit exceeded. Please try again later.",
      };
      
      context.HttpContext.Response.ContentType = "application/json";
      await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken);
    };

    // Login endpoint: 5 attempts per 15 minutes (per IP)
    rateLimiterOptions.AddPolicy("LoginLimit", httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = 5,
          Window = TimeSpan.FromMinutes(15)
        }));

    // Registration endpoint: 3 attempts per hour (per IP)
    rateLimiterOptions.AddPolicy("RegistrationLimit", httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = 3,
          Window = TimeSpan.FromHours(1)
        }));

    // OTP Send endpoint: 3 attempts per 15 minutes (per IP)
    rateLimiterOptions.AddPolicy("OtpSendLimit", httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = 3,
          Window = TimeSpan.FromMinutes(15)
        }));

    // OTP Verify endpoint: 5 attempts per 15 minutes (per IP)
    rateLimiterOptions.AddPolicy("OtpVerifyLimit", httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = 5,
          Window = TimeSpan.FromMinutes(15)
        }));

    // Password Change endpoint: 3 attempts per hour (per user)
    rateLimiterOptions.AddPolicy("PasswordChangeLimit", httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          PermitLimit = 3,
          Window = TimeSpan.FromHours(1)
        }));
  });

  // Register the SignalR for realtime comms
  builder.Services.AddSignalR();

  // Register Services
  builder.Services.AddScoped<UserService>();
  builder.Services.AddScoped<AuthService>();
  builder.Services.AddScoped<Auth0Service>();
  builder.Services.AddScoped<EmailService>();
  builder.Services.AddScoped<RenderingService>();
  builder.Services.AddScoped<DoctorService>();
  builder.Services.AddScoped<DoctorSpecialtyService>();
  builder.Services.AddScoped<SpecialtyService>();
  builder.Services.AddScoped<FileService>();
  builder.Services.AddScoped<PatientService>();
  builder.Services.AddScoped<AdminService>();
  builder.Services.AddScoped<IContactService, ContactService>();
  builder.Services.AddScoped<IPaymentService, PaymentService>();
  builder.Services.AddScoped<IPaymentProviderFactory, PaymentProviderFactory>();  
  builder.Services.AddScoped<IPaymentProvider, ChapaPaymentProvider>(); // Register Chapa as a payment provider implementation
  builder.Services.AddScoped<AppointmentService>();
  builder.Services.AddScoped<IReviewService, ReviewService>();
  builder.Services.AddScoped<IBlogService, BlogService>();
  builder.Services.AddScoped<IChatService, ChatService>();

  // Register Global Exception Filter
  builder.Services.AddScoped<GlobalExceptionFilter>();

  builder.Services.AddSingleton<UserConnection>(); // Register UserConnection as a singleton since it manages state across connections




  // Add other providers in the future here!

  // This line registers the Lazy<T> type with the DI container to enable lazy loading for services.
  builder.Services.AddScoped(typeof(Lazy<>), typeof(Lazy<>));

  builder
    .Services.AddControllers(options =>
    {
      // Register Global Exception Filter
      options.Filters.Add<GlobalExceptionFilter>();
    })
    .AddNewtonsoftJson(options =>
    {
      options.SerializerSettings.ReferenceLoopHandling = Newtonsoft
        .Json
        .ReferenceLoopHandling
        .Ignore;
      options.SerializerSettings.Converters.Add(
        new Newtonsoft.Json.Converters.StringEnumConverter()
      );
      options.SerializerSettings.Converters.Add(new IsoDateTimeConverter());
    });

  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen(options =>
  {
    // Use the actual assembly name to find the XML file
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);

    // Safety check: only include if the file exists
    if (File.Exists(xmlPath))
    {
      options.IncludeXmlComments(xmlPath);
    }

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
      Name = "Authorization",
      Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
      Scheme = "Bearer",
      BearerFormat = "JWT",
      In = Microsoft.OpenApi.Models.ParameterLocation.Header,
      Description = "Please enter your Auth0 token in the format: Bearer <token>"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
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
        new string[] {}
      }
    });
  });

  builder
    .Services.AddRazorPages()
    .AddRazorOptions(options =>
    {
      options.ViewLocationFormats.Add("/Source/Views/{0}.cshtml");
    });

  builder.Logging.AddFilter("Microsoft.AspNetCore.SignalR", LogLevel.Debug);
  builder.Logging.AddFilter("Microsoft.AspNetCore.Http.Connections", LogLevel.Debug);

  
  AppDomain.CurrentDomain.ProcessExit += (s, e) => Log.CloseAndFlush();

}

var app = builder.Build();
{
  // app.UseExceptionHandler("/error"); // Exception handling endpoint



  app.UseCors("AllowSpecificOrigin");

  // app.UseRateLimiter(); // Enable rate limiting for security
  app.UseCustomValidationMiddleware(); // Custom middleware to handle FluentValidation errors
  app.UseCookieMiddleware(); // Enable cookie handling (if needed for future features)
  app.UseAuthentication();
  app.UseAuthorization();
  app.UseSerilogRequestLogging(); // Enable Serilog Request Logging
  
  // Map SignalR Hubs for real-time communication
  app.MapHub<ChatHub>("/chatHub");
  app.MapHub<NotificationHub>("/notificationHub");
  
  app.MapControllers();

  // Health Check Endpoints
  app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
  {
    ResponseWriter = async (context, report) =>
    {
      var result = new
      {
        status = report.Status.ToString(),
        uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime,
        checks = report.Entries.Select(e => new
        {
          component = e.Key,
          status = e.Value.Status.ToString(),
          description = e.Value.Description,
          duration = e.Value.Duration.ToString()
        })
      };

      context.Response.ContentType = "application/json";
      var json = System.Text.Json.JsonSerializer.Serialize(result, new System.Text.Json.JsonSerializerOptions 
      { 
        WriteIndented = true 
      });
      await context.Response.WriteAsync(json);
    }
  });

  // Simple health check (just returns status code)
  app.MapHealthChecks("/health/simple");

  // Ready check (for load balancers)
  app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
  {
    Predicate = _ => true
  });


  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

   app.Run(new AppConfig(app.Configuration).ApiOrigin);
}
