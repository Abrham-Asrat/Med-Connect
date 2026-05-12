namespace BackendAPI.Source.Controllers;

using Microsoft.AspNetCore.Mvc;
using BackendAPI.Source.Service;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AiController(AiService aiService) : ControllerBase
{
    private readonly AiService _aiService = aiService;

    [HttpPost("ask")]
    [AllowAnonymous] // Allow anyone to ask the AI bot
    public async Task<IActionResult> Ask([FromBody] AiRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            return BadRequest(new { success = false, message = "Question cannot be empty." });
        }

        var answer = await _aiService.AskQuestionAsync(request.Question);
        return Ok(new { success = true, answer });
    }
}

public class AiRequestDto
{
    public string Question { get; set; } = string.Empty;
}
