using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using System.Collections.Generic;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure OpenAPI/Swagger
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.SuppressMapClientErrors = true;
});

var app = builder.Build();




if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Med-Connect Healthcare API v1.0.0");
        c.RoutePrefix = string.Empty; // Set Swagger UI at root URL
        c.DocumentTitle = "Med-Connect Healthcare API Documentation";
        c.DefaultModelExpandDepth(2);
        c.DefaultModelsExpandDepth(-1); // Hide schemas section by default
        c.DisplayRequestDuration();
    });
}


app.UseHttpsRedirection();

//Authenticate and Authorize
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();