using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Service.PaymentProviders;

namespace BackendAPI.Source.Service.PaymentProviders
{
    public interface IPaymentProviderFactory
    {
         IPaymentProvider GetProvider(PaymentProvider paymentProvider);
    }
}