using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Source.Models.Responses
{
    public interface IServiceResponse
    {
        public bool Success { get; init; }

        public int StatusCode { get; init; }

        public string? Message { get; init; }

    }

    public interface IServiceResponse<T> : IServiceResponse
    {
        public T? Data { get; init; }
    }


    public class ServiceResponse(bool success, int statusCode, string? message = null) : IServiceResponse
    {
        public bool Success { get; init; } = success;
        public int StatusCode { get; init; } = statusCode;
        public string? Message { get; init; } = message;
    }

    public class ServiceResponse<T> : ServiceResponse, IServiceResponse<T>
    {
        public T? Data { get; init; }

        public ServiceResponse(bool success, int statusCode, T? data , string? message = null) : base(success, statusCode, message)
        {
            this.Data = data;
        }
    }
}