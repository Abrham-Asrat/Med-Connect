using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Entities;
using BackendAPI.Source.Service;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace BackendAPI.Tests.Unit.FileServiceTests;

public class FileServiceTests
{
  DbContextOptions<ApplicationDbContext> options;
  ApplicationDbContext mockAppContext;
  Mock<ILogger<FileService>> mockLogger;
  FileService fileService;

  public FileServiceTests()
  {
    options = new DbContextOptionsBuilder<ApplicationDbContext>()
      .UseInMemoryDatabase(databaseName: "TestDatabase")
      .Options;
    mockAppContext = new ApplicationDbContext(options);
    mockLogger = new Mock<ILogger<FileService>>();
    fileService = new FileService(mockAppContext, mockLogger.Object);
  }

  [Fact]
  public async Task CreateFileAsync_ShouldReturnNewlyCreatedFile()
  {
    // Arrange
    var createFileDto = new CreateFileDto("image/jpg", "AA==", "wallpaper.jpeg");

    // Act
    var result = await fileService.CreateFileAsync(createFileDto);

    // Assert
    Assert.NotNull(result);
    Assert.Equal("wallpaper.jpeg", result.FileName);
    Assert.Equal("image/jpg", result.MimeType);
    Assert.Equal("AA==", FileHelper.ToBase64(result.FileData));
  }

  [Fact]
  public async Task CreateFileAssociationAsync_ShouldCreateAssociationBetweenFileAndMessage()
  {
    // Arrange
    Guid fileId = Guid.NewGuid();
    Guid messageId = Guid.NewGuid();

    // Act
    var result = await fileService.CreateFileAssociationAsync(
      fileId,
      messageId,
      DiscriminatorTypes.Message
    );

    // Assert
    Assert.NotNull(result);
    Assert.Equal(fileId, result.FileId); // check their id is equal
    Assert.True(result is MessageFileAssociation); // check the created entity reflects the discriminator type
    var messageFileAssociation = result as MessageFileAssociation;
    Assert.Equal(messageId, messageFileAssociation?.MessageId); // check that the association is successful
  }

  [Fact]
  public async Task CreateFileAssociationAsync_ShouldThrowArgumentException_WhenDiscriminatorTypeIsInvalid()
  {
    // Arrange
    Guid fileId = Guid.NewGuid();
    Guid messageId = Guid.NewGuid();

    // Act
    var exception = await Assert.ThrowsAsync<ArgumentException>(
      () => fileService.CreateFileAssociationAsync(fileId, messageId, (DiscriminatorTypes)999)
    );

    // Assert
    Assert.Equal("Unsupported Discriminator Type: 999", exception.Message);
  }

  [Fact]
  public async Task CreateFileAsync_ShouldGenerateUniqueFileIds()
  {
    // Arrange
    var createFileDto1 = new CreateFileDto("image/png", "AA==", "file1.png");
    var createFileDto2 = new CreateFileDto("image/png", "AA==", "file2.png");

    // Act
    var result1 = await fileService.CreateFileAsync(createFileDto1);
    var result2 = await fileService.CreateFileAsync(createFileDto2);

    // Assert
    Assert.NotNull(result1);
    Assert.NotNull(result2);
    Assert.NotEqual(result1.FileId, result2.FileId);
  }

  [Fact]
  public async Task CreateMultipleFilesAsync_ShouldCreateAllFilesSuccessfully()
  {
    // Arrange
    var files = new List<CreateFileDto>
    {
      new CreateFileDto("image/png", "AA==", "file1.png"),
      new CreateFileDto("image/jpeg", "/9j/", "file2.jpg"),
      new CreateFileDto("application/pdf", "UEs=", "file3.pdf")
    };

    // Act
    var results = new List<Source.Models.Entities.FileModel>();
    foreach (var file in files)
    {
      var result = await fileService.CreateFileAsync(file);
      results.Add(result);
    }

    // Assert
    Assert.Equal(3, results.Count);
    Assert.Equal("file1.png", results[0].FileName);
    Assert.Equal("file2.jpg", results[1].FileName);
    Assert.Equal("file3.pdf", results[2].FileName);
  }
}
