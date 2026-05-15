using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Responses;
using System;
using Microsoft.Extensions.Logging;

namespace BackendAPI.Source.Controllers
{
    [ApiController]
    [Route("api/file")]
    public class FileController : ControllerBase
    {
        private readonly ILogger<FileController> _logger;

        public FileController(ILogger<FileController> logger)
        {
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string discriminator = "Document")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new ApiResponse<object>(false, "No file uploaded", null));

                // In a real application, you would use a FileService to save to Blob Storage, S3, or a local directory
                // and return the actual URL and save a FileModel. For this demo we'll use a mocked URL.
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", discriminator);
                
                Directory.CreateDirectory(uploadsFolder);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create a mock URL based on current request host
                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{discriminator}/{fileName}";

                return Ok(new ApiResponse<object>(true, "File uploaded successfully", new { fileUrl = fileUrl, discriminator = discriminator }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, new ApiResponse<object>(false, "Internal server error during upload", null));
            }
        }
    }
}
