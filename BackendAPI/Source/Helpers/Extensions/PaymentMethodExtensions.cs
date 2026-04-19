using BackendAPI.Source.Models.Interface.Payments.Chapa;


public static class PaymentMethodExtensions
{
  public static Dictionary<ChapaPaymentMethod, string> ChapaPaymentMethods =
    new()
    {
      { ChapaPaymentMethod.TeleBirr, "telebirr" },
      { ChapaPaymentMethod.CbeBirr, "cbebirr" },
      // { ChapaPaymentMethod.Mpesa, "mpesa" },
      // { ChapaPaymentMethod.AwashBirr, "awash_birr" },
      // { ChapaPaymentMethod.Ebirr, "ebirr" },
      // { ChapaPaymentMethod.Amole, "amole" }
    };

  public static Dictionary<string, ChapaPaymentMethod> ChapaPaymentMethodsReverse =
    ChapaPaymentMethods.ToDictionary(x => x.Value, x => x.Key);

  public static string GetDisplayName(this ChapaPaymentMethod chapaPaymentMethod)
  {
    ChapaPaymentMethods.TryGetValue(chapaPaymentMethod, out var paymentMethod);
    return paymentMethod
      ?? throw new ArgumentException(
        $"Invalid payment method. Valid payment methods are {string.Join(", ", ChapaPaymentMethods.Values)}"
      );
  }

  public static bool IsValidChapaPaymentMethod(this string paymentMethod)
  {
    return ChapaPaymentMethods.ContainsValue(paymentMethod);
  }

  public static ChapaPaymentMethod ConvertToChapaPaymentMethod(this string value)
  {
    var normalizedValue = value.ToLowerInvariant();
    if (ChapaPaymentMethodsReverse.ContainsKey(normalizedValue) == false)
      throw new ArgumentException(
        $"Invalid payment method. Valid payment methods are {string.Join(", ", ChapaPaymentMethods.Values)}"
      );
    return ChapaPaymentMethodsReverse[normalizedValue];
  }
}
