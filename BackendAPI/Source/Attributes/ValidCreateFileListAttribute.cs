using System.ComponentModel.DataAnnotations;
using BackendAPI.Source.Helpers;
using BackendAPI.Source.Models.Enums;

/// <summary>
///
/// </summary>
public class ValidCreateFileListAttribute : ValidationAttribute
{
  // Default max file size: 5MB — aligned with FileModel.FileData [MaxLength(5MB)]
  int maxFileSize;
  string[]? allowedExtensions;

  public ValidCreateFileListAttribute()
  {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB default
  }

  /// <param name="maxFileSize">if not provided limit will be 5,242,880 (5MB)</param>
  /// <param name="allowedExtensions">if not provided all files will be allowed</param>
  public ValidCreateFileListAttribute(
    int maxFileSize = 5 * 1024 * 1024,
    string[]? allowedExtensions = null
  )
  {
    this.maxFileSize = maxFileSize;
    this.allowedExtensions = allowedExtensions;
  }

  protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
  {
    var fileList = value as List<CreateFileDto>;

    if (fileList != null)
    {
      foreach (var file in fileList)
      {
        if (file == null)
          return new ValidationResult("File cannot be a type of null.");

        // Guard against invalid base64 before attempting conversion
        byte[] fileBytes;
        try
        {
          fileBytes = FileHelper.ToByteStream(file.FileDataBase64);
        }
        catch (FormatException)
        {
          return new ValidationResult("File data is not valid base64.");
        }

        if (fileBytes.Length > maxFileSize)
          return new ValidationResult($"File size must be at most {maxFileSize / (1024 * 1024)}MB.");

        bool isSupportedMime = Mime.IsSupportedMimeValue(file.MimeType);
        if (!isSupportedMime)
          return new ValidationResult("Mime type for the file is not supported.");
      }
    }

    return ValidationResult.Success;
  }
}
