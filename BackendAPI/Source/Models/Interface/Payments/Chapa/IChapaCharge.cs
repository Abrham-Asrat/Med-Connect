using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendAPI.Source.Models.Enums;
using BackendAPI.Source.Models.Interface.Payments;
using BackendAPI.Source.Models.Interface.Payments.Chapa;

namespace BackendAPI.Source.Models.Interface.Payments.Chapa
{
    public class ChapaCharge : Charge
    {
         public override required PaymentProvider PaymentProvider { get; init; } = PaymentProvider.Chapa;
         
         public required ChapaPaymentMethod PaymentMethod { get; set; } 
    }
}