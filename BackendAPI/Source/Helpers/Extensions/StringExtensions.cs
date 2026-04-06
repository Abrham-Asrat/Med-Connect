using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BackendAPI.Source.Helpers.Extensions
{
    public static class StringExtensions
    {
        public static Guid ConvertToGuid(this string str)
        {
            if (Guid.TryParse(str, out Guid result))
            {
                return result;
            }
            else
            {
                throw new FormatException($"The string '{str}' is not a valid GUID.");
            }
        }

        public static T ConvertToEnum<T>(this string str , bool ignoreCase = false) where T : struct, Enum
        {
            if (Enum.TryParse<T>(str, ignoreCase, out T result))
            {
                return result;
            }
            else
            {
                throw new ArgumentException($"The string '{str}' is not a valid value for enum type {typeof(T).Name}.");
            }
        }
        
        public static T ConvertTo<T>(this string str)
        {
            try
            {
                var targetType = typeof(T);
                if(targetType == typeof(DateOnly))
                {
                    return (T)(object)DateOnly.Parse(str);
                }

                if(targetType == typeof(DateTime))
                {
                    return (T)(object)DateTime.Parse(str);
                }
               return (T)Convert.ChangeType(str, typeof(T));
            }
            catch (Exception ex)
            {
                throw new ArgumentException($"The string '{str}' cannot be converted to type {typeof(T).Name}.", ex);
            }
        }

        public static string RemoveWhitespace(this string str)
        {
            return new string(str.Where(c => !char.IsWhiteSpace(c)).ToArray());
        }

        public static string RemoveNonNumeric(this string Phone)
        {
            return Regex.Replace(Phone, @"[^0-9 ]", "");
        }
  
    }
}