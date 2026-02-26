using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;



namespace BackendAPI.Source.Models.Entities
{
    public class FileModel : BaseEntity
    {
        public Guid FileId { get; set; } = new Guid();
        public string? FileName { get; set; }
        public required string MimeType { get; set; }
        public string? Url { get; set; }

        [MaxLength(5 * 1024 * 1024)] // Max file size of 10MB
        public required byte[] FileData { get; set; } = [];
        public int FileSize => FileData.Length;
    }
}