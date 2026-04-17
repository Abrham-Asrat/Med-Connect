using BackendAPI.Source.Helpers;
using BackendAPI.Source.Service;
using MiniRazor;

namespace BackendAPI.Source.Services;

public class RenderingService(FileService fileService)
{
  public async Task<string> RenderRazorPage(string filePath, object viewModel)
  {
    var fileContents = await FileHelper.ReadFile(
      Path.Combine(Directory.GetCurrentDirectory(), filePath)
    );
    var template = Razor.Compile(fileContents);
    var output = await template.RenderAsync(viewModel);
    return output;
  }
}
