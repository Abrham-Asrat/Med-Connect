using System.Collections.ObjectModel;
using BackendAPI.Source.Data;
using BackendAPI.Source.Helpers.Default;
using BackendAPI.Source.Hubs;
using BackendAPI.Source.Service;
using BackendAPI.Source.Service.ChatService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Primitives;
using Moq;
using Xunit;
using Xunit.Abstractions;

public class ChatHubTests
{
  private readonly DbContextOptions<ApplicationDbContext> _options;
  private readonly ApplicationDbContext _appContext;
  private readonly Mock<IHubContext<ChatHub>> _mockHubContext;
  private readonly Mock<FileService> _mockFileService;
  private readonly Mock<ILogger<IChatService>> _mockLoggerChatService;
  private readonly Mock<ILogger<FileService>> _mockLoggerFileService;
  private readonly Mock<IHubCallerClients> _mockClients;
  private readonly Mock<IClientProxy> _mockClientProxy;
  private readonly ChatHub _chatHub;
  private readonly Mock<IChatService> _mockChatService;
  private readonly Mock<HubCallerContext> _mockCallerContext;
  private readonly Mock<HttpContext> _mockHttpContext;
  private readonly Mock<UserConnection> _mockUserConnection;
  private readonly Mock<ILogger<ChatHub>> _mockLoggerChatHub;

  public ChatHubTests()
  {
    // Setup mocks
    _mockHubContext = new Mock<IHubContext<ChatHub>>();
    _mockClients = new Mock<IHubCallerClients>();
    _mockClientProxy = new Mock<IClientProxy>();

    _mockLoggerChatService = new Mock<ILogger<IChatService>>();
    _mockLoggerFileService = new Mock<ILogger<FileService>>();
    _mockLoggerChatHub = new Mock<ILogger<ChatHub>>();

    _options = new DbContextOptionsBuilder<ApplicationDbContext>()
      .UseInMemoryDatabase(databaseName: "TestDatabase")
      .Options;
    _appContext = new ApplicationDbContext(_options);

    _mockCallerContext = new Mock<HubCallerContext>();
    _mockHttpContext = new Mock<HttpContext>();
    _mockUserConnection = new Mock<UserConnection>();

    _mockChatService = new Mock<IChatService>();

    // Create a mock of IHttpContextAccessor
    var httpContextAccessorMock = new Mock<IHttpContextAccessor>();

    // Setup the FormCollection as before
    var formCollection = new FormCollection(
      new Dictionary<string, StringValues>()
      {
        { CookieDefaults.Profile.UserId, "DB1CA3D9-8F05-444E-9CF8-E8E3F20DD38E" }
      }
    );

    // Create a mock HttpContext and set the request Form property
    HttpContext httpContext = new DefaultHttpContext();
    httpContext.Request.Form = formCollection;

    // Setup the mock to return the created HttpContext
    httpContextAccessorMock.Setup(_ => _.HttpContext).Returns(httpContext);

    _mockHttpContext
      .Setup(context => context.Request.Cookies[CookieDefaults.Profile.UserId])
      .Returns("DB1CA3D9-8F05-444E-9CF8-E8E3F20DD38E");

    // Assign HttpContext to the HubCallerContext (mocking access to HttpContext from HubCallerContext)
    _mockCallerContext.Setup(context => context.ConnectionId).Returns("TestConnectionId");
    _mockCallerContext.Setup(context => context.UserIdentifier).Returns("DB1CA3D9-8F05-444E-9CF8-E8E3F20DD38E");

    // Setup the mock clients
    _mockClients
      .Setup(clients => clients.User(It.IsAny<string>()))
      .Returns(_mockClientProxy.Object);

    // Create the ChatHub instance with the mocked services
    _chatHub = new ChatHub(_mockChatService.Object, _mockUserConnection.Object, _mockLoggerChatHub.Object)
    {
      Clients = _mockClients.Object,
      Context = _mockCallerContext.Object
    };
  }

  [Fact]
  public async Task SendMessage_ShouldSendMessageToClients()
  {
    // Arrange
    Guid receiverId = Guid.Parse("DB1CA3D9-8F05-444E-9CF8-E8E3F20DD38E");
    string messageText = "Hello, how are you doing";
    List<CreateFileDto> files = new List<CreateFileDto>();

    // Set the private _senderId field using reflection
    var senderIdField = typeof(ChatHub).GetField("_senderId", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
    senderIdField?.SetValue(_chatHub, "DB1CA3D9-8F05-444E-9CF8-E8E3F20DD38E");

    // Act
    await _chatHub.SendMessage(receiverId, messageText, files);

    // Assert
    _mockClientProxy.Verify(
      client =>
        client.SendCoreAsync(
          ChatEvents.ReceiveMessage.ToString(),
          It.Is<object[]>(o => o[0] is MessageDto),
          default
        ),
      Times.Once
    );
  }
}
