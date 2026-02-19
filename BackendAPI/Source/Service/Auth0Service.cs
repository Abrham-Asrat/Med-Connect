using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Config;
using BackendAPI.Source.Models.Dtos;
using RestSharp;
using System.Text.Json;

namespace BackendAPI.Source.Service
{
    public class Auth0Service(AppConfig appConfig, ILogger<Auth0Service> logger)
    {
        public async Task<Auth0UserDto?> CreateUserAsync(RegisterUserDto userDto, Guid userId)
        {
            try
            {
                var userPayload = new
                {
                    email = userDto.Email,
                    password = userDto.Password,
                    connection = "Username-Password-Authentication",
                    user_metadata = new
                    {
                        userId,
                        firstName = userDto.FirstName,
                        lastName = userDto.LastName,
                        role = userDto.Role.ToString(),
                        phone = userDto.Phone,
                        gender = userDto.Gender,
                        dateOfBirth = userDto.DateOfBirth,
                    }
                };

                var token = await GetManagementApiTokenAsync();

                Func<Task<RestResponse>> MakeRequest = async () =>
                {
                    var client = new RestClient($"{appConfig.Auth0Authority}/api/v2/users");
                    var request = new RestRequest() { Method = Method.Post };
                    request.AddHeader("content-type", "application/json");
                    request.AddHeader("Authorization", $"Bearer {token}");
                    request.AddJsonBody(userPayload);

                    return await client.ExecuteAsync(request);
                };

                var response = await MakeRequest();

                if (response.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    // Delete the user with the given email from auth0
                    // await DeleteUserByEmailAsync(userDto.Email);
                    // make the request again
                    response = await MakeRequest();
                }

                if (!response.IsSuccessStatusCode)
                {
                    logger.LogError(response.Content, $"Auth0 Create User Error\n\n");
                    throw new Exception(
                      $"Failed to create user in Auth0. Please check auth0 dashboard / user management"
                    );
                }

                var userData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
                logger.LogInformation($"\n\nAuth0 Create User Success:\n {response.Content}");

                return new Auth0UserDto(
                  userData.GetProperty("user_id").GetString()!,
                  userData.GetProperty("picture").GetString()!,
                  userData.GetProperty("email_verified").GetBoolean()
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create user in Auth0");
                throw;
            }
        }
    

    /// <summary>
  /// Responsible for getting the management access token for making management API calls.
  /// </summary>
  /// <returns></returns>
     public async Task<string> GetManagementApiTokenAsync()
        {
            var clientId = appConfig.Auth0ClientId;
            var clientSecret = appConfig.Auth0ClientSecret;
            var audience = appConfig.Auth0Audience;
            var url = $"{appConfig.Auth0Authority}/oauth/token";

            var client = new RestClient(url);
            // logger.LogInformation($"Auth0 Get Management API Token Request:\n {url}");

            var request = new RestRequest() { Method = Method.Post };

            request.AddHeader("content-type", "application/x-www-form-urlencoded");
            request.AddParameter("grant_type", "client_credentials");
            request.AddParameter("client_id", clientId);
            request.AddParameter("client_secret", clientSecret);
            request.AddParameter("audience", audience);

            RestResponse response = await client.ExecuteAsync(request);
            // logger.LogInformation($"\n\nThis is the Management Api Response: {response.Content}");
            if (!response.IsSuccessStatusCode)
            {
                logger.LogError(response.Content, $"Auth0 Get Management API Token Error");

                throw new Exception("Failed to get management API token");
            }

            var tokenData = JsonSerializer.Deserialize<JsonElement>(response.Content!);
            return tokenData.GetProperty("access_token").GetString()!;
        }
 
}
}
