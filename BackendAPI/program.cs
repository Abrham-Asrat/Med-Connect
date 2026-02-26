using dotenv.net;
using FluentValidation;
using BackendAPI.Source.Config;
using BackendAPI.Source.Data;
using BackendAPI.Source.Service;
using BackendAPI.Source.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Newtonsoft.Json.Converters;
using Microsoft.AspNetCore.Authentication.JwtBearer;


// Load Environment Variables
DotEnv.Load(options: new DotEnvOptions(ignoreExceptions: false));

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

  // Configure Serilog to capture logs from application host
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

  // Configure Authorization


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

  // Register the signalr service for realtime comms
  builder.Services.AddSignalR();

  // Register Services
  builder.Services.AddTransient<UserService>();



  // builder.Services.AddTransient<Auth0Service>();



  // Add other providers in the future here!

  // This line registers the Lazy<T> type with the DI container to enable lazy loading for services.
  builder.Services.AddTransient(typeof(Lazy<>), typeof(Lazy<>));

  builder
    .Services.AddControllers()
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

  // Close and Flush Serilog when the application exits
  AppDomain.CurrentDomain.ProcessExit += (s, e) => Log.CloseAndFlush();

  //----------------------------------------
}

var app = builder.Build();
{
  // app.UseExceptionHandler("/error"); // Exception handling endpoint



  app.UseCors("AllowSpecificOrigin");
  app.UseAuthentication();
  app.UseAuthorization();
  app.UseSerilogRequestLogging(); // Enable Serilog Request Logging
  app.MapControllers();


  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

   app.Run(new AppConfig(app.Configuration).ApiOrigin);
}
