using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Helpers;
using MiniRazor;

namespace BackendAPI.Source.Service
{
    public class RenderingService
    {
        public async Task<string> RenderRazorPage(string filePath, object viewModel)
        {
          try
          {
            var fileContent = await FileHelper.ReadFile(Path.Combine(Directory.GetCurrentDirectory(), filePath));

            var template = Razor.Compile(fileContent);
            var outPut = await template.RenderAsync(viewModel);

            return outPut;
          }
          catch (System.Exception)
          {
            
            throw;
          }
        }
    }
}