using System.Text.Json;
using System.Text.Json.Nodes;
using ChapaNET;
using BackendAPI.Source.Config;
using BackendAPI.Source.Helpers.Extensions;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Interface.Payments;
using BackendAPI.Source.Models.Interface.Payments.Chapa;
using BackendAPI.Source.Service.PaymentProviders;
using Newtonsoft.Json.Linq;
using RestSharp;
using Xunit.Sdk;

public class ChapaPaymentProvider(AppConfig appConfig, ILogger<ChapaPaymentProvider> logger)
  : IPaymentProvider
{
  public PaymentProvider PaymentProvider => PaymentProvider.Chapa;

  public Task<decimal> CheckBalanceAsync(string email)
  {
    return Task.FromResult(decimal.MaxValue);
  }

  public async Task<TransferResponseInner> TransferAsync(TransferRequestDto transferRequestDto)
  {
    try
    {
      if (appConfig.ChapaSecretKey is null)
      {
        throw new Exception("Chapa Secret Key is not set");
      }

      var tx_rf = PaymentHelper.GetTransactionReference();

      var restClient = new RestClient();
      var request = new RestRequest(
        $"{appConfig.ChapaApiOrigin}/v1/transaction/initialize",
        Method.Post
      );
      request.AddHeader("Content-Type", "application/json");
      request.AddHeader("Authorization", $"Bearer {appConfig.ChapaSecretKey}");

      request.AddJsonBody(
        new
        {
          email = transferRequestDto.SenderEmail,
          amount = transferRequestDto.Amount,
          first_name = transferRequestDto.SenderName,
          tx_ref = tx_rf,
          currency = "ETB",
          callback_url = appConfig.ApiOrigin,
          phone_number = transferRequestDto.PhoneNumber
        }
      );

      var response = await restClient.ExecuteAsync(request);
      
      logger.LogInformation("Chapa API Response: Status={StatusCode}, Content={Content}", 
        response.StatusCode, response.Content);

      if (!response.IsSuccessStatusCode)
      {
        logger.LogWarning("Chapa API error during transfer: Status={StatusCode}, Content={Content}", 
          response.StatusCode, response.Content);
        
        string errorMessage = "Unknown error occurred";
        try
        {
          var errorData = JsonSerializer.Deserialize<JsonElement>(
            response.Content ?? "{}",
            new JsonSerializerOptions { WriteIndented = true }
          );
          errorMessage = errorData.TryGetProperty("message", out var msgProp) 
            ? msgProp.GetString() ?? errorMessage 
            : response.Content ?? errorMessage;
        }
        catch
        {
          errorMessage = response.Content ?? response.ErrorMessage ?? "Failed to initialize payment";
        }

        return new TransferResponseInner
        {
          IsSuccessful = false,
          Message = errorMessage,
          TransactionReference = "null"
        };
      }

      if (string.IsNullOrEmpty(response.Content))
      {
        logger.LogError("Chapa API returned empty content");
        throw new Exception("Chapa API returned empty response");
      }

      var data = JsonSerializer.Deserialize<JsonElement>(
        response.Content,
        new JsonSerializerOptions { WriteIndented = true }
      );

      var status = data.GetProperty("status").GetString();

      return new TransferResponseInner
      {
        IsSuccessful = status == "success",
        Message = JToken.Parse(data.ToString() ?? "No content"),
        TransactionReference = tx_rf
      };
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "Error transferring funds");
      throw;
    }
  }

  public async Task<IChargeResponse> ChargeAsync(ICharge charge)
  {
    try
    {
      if (charge is not ChapaCharge chapaCharge)
        throw new InvalidOperationException("Charge type must be of type ChapaCharge");

      if (string.IsNullOrEmpty(appConfig.ChapaSecretKey))
      {
        logger.LogError("Chapa Secret Key is not configured");
        throw new Exception("Chapa payment provider is not properly configured. Missing secret key.");
      }

      logger.LogInformation("Initializing Chapa charge for amount: {Amount} {Currency}, Method: {Method}", 
        chapaCharge.Amount, chapaCharge.Currency, chapaCharge.PaymentMethod);

      var restClient = new RestClient();
      restClient.AddDefaultHeader("Authorization", $"Bearer {appConfig.ChapaSecretKey}");

      string txRf = PaymentHelper.GetTransactionReference();

      var restRequest = new RestRequest(
        $"{appConfig.ChapaApiOrigin}/v1/charges?type={chapaCharge.PaymentMethod.GetDisplayName()}"
      )
      {
        Method = Method.Post
      };
      restRequest.AddHeader("Content-Type", "application/json");
      restRequest.AddBody(
        new
        {
          amount = chapaCharge.Amount,
          currency = chapaCharge.Currency.ToString(),
          mobile = chapaCharge.PhoneNumber,
          tx_rf = txRf
        }
      );

      var response = await restClient.ExecuteAsync(restRequest);

      if (!response.IsSuccessStatusCode)
      {
        var errorMessage = response.ErrorMessage ?? response.Content ?? $"HTTP {response.StatusCode} - Unknown error";
        logger.LogError("Chapa API error: Status={StatusCode}, ErrorMessage={ErrorMessage}, Content={Content}", 
          response.StatusCode, response.ErrorMessage, response.Content);
        throw new Exception($"Chapa API error: {errorMessage}");
      }
      var content = JsonSerializer.Deserialize<JsonElement>(response.Content ?? "");
      if (
        content.TryGetProperty("data", out var dataElement)
        && dataElement.TryGetProperty("meta", out var meta)
      )
      {
        return new ChargeResponse
        {
          Message = meta.TryGetProperty("message", out var messageProp)
            ? messageProp.GetString() ?? ""
            : "Message not available",
          RefId = meta.TryGetProperty("ref_id", out var refId)
            ? refId.GetString() ?? ""
            : "RefId not available",
          Status = meta.TryGetProperty("status", out var statusProp)
            ? statusProp.GetString() == "success"
            : false
        };
      }
      else
      {
        throw new InvalidOperationException("Data or Meta object is missing in the response");
      }
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occurred trying to charge in chapa");
      throw;
    }
  }

  public async Task<IVerifyResponse> VerifyAsync(IVerifyRequest verifyRequest)
  {
    try
    {
      // https://api.chapa.co/v1/transaction/verify/chewatatest-6669
      var restClient = new RestClient();
      restClient.AddDefaultHeader("Authorization", $"Bearer {appConfig.ChapaSecretKey}");

      var restRequest = new RestRequest(
        $"{appConfig.ChapaApiOrigin}/v1/transaction/verify/{verifyRequest.TransactionReference}"
      )
      {
        Method = Method.Get
      };

      var response = await restClient.ExecuteAsync(restRequest);

      if (!response.IsSuccessStatusCode)
      {
        throw new Exception(response.ErrorMessage);
      }

      var content = JsonSerializer.Deserialize<JsonElement>(response.Content ?? "");

      return new VerifyResponse
      {
        Success = true,
        FirstName =
          content.TryGetProperty("data", out var data)
          && data.TryGetProperty("first_name", out var firstName)
            ? firstName.ToString()
            : "",
       LastName =
  data.ValueKind == JsonValueKind.Object
  && data.TryGetProperty("last_name", out var lastName)
    ? lastName.GetString() ?? ""
    : "",

Email =
  data.ValueKind == JsonValueKind.Object
  && data.TryGetProperty("email", out var email)
    ? email.GetString() ?? ""
    : "",
      };
    }
    catch (System.Exception ex)
    {
      logger.LogError(ex, "An error occured trying to verify in chapa");
      throw;
    }
  }
}
