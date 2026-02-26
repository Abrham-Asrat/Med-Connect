using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Helpers
{
    public class FileHelper
    {
        public static async Task<string> ReadFile(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("The file was not found", filePath);
            }
          return await File.ReadAllTextAsync(filePath);
        }

        public static byte[] ToBeStream(string base64) =>Convert.FromBase64String(base64);
        public static string ToBase64(byte[] byteStream) => Convert.ToBase64String(byteStream);
    }
}