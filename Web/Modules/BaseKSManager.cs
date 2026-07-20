using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Modules.Config;

namespace Web.Modules
{
    public class BaseKSManager
    {
        private static string ApiKey
        {
            get
            {
                return Startup.Configuration["KS:APIKEY"] ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA2Mzc2MjQsImp0aSI6IjAxZjBmNWM4LTA4NTUtNjFkYi1hNGQ5LTAwYjE1YzBjNDAwMCIsImxvZ2luIjoicy5rcnVjaGlua2luIiwic3NuIjoiMDFmMTA1YWQtMGRmMi01MjU3LTg0MDYtMDBiMTVjMGM0MDAwIn0.dpB-KY33FYElKjjzxcvFwt2CC32YkocWac8gwIGRIxY.BXRCR4JUXTOCwdsnGd1F6pnvbI7MJNJs5rzPZFILyEI";
            }
            set
            {
                Startup.Configuration["KS:APIKEY"] = value;
            }
        }
        private static Uri BaseURL
        {
            get
            {
                return new Uri(Startup.Configuration["KS:Url"]);
            }
        }
        protected static string ProjectUUID
        {
            get
            {
                return Startup.Configuration["KS:ProjectUUID"];
            }
        }
        protected static string ModelUUID
        {
            get
            {
                return Startup.Configuration["KS:ModelUUID"];
            }
        }
        protected static string SystemClassUUID
        {
            get
            {
                return Startup.Configuration["KS:SystemClassUUID"];
            }
        }
        protected static string SystemFunctionClassUUID
        {
            get
            {
                return Startup.Configuration["KS:SystemFunctionClassUUID"];
            }
        }
        protected static string SystemEntityClassUUID
        {
            get
            {
                return Startup.Configuration["KS:SystemEntityClassUUID"];
            }
        }
        protected static string FunctionClassUUID
        {
            get
            {
                return Startup.Configuration["KS:FunctionClassUUID"];
            }
        }
        protected static string EntityClassUUID
        {
            get
            {
                return Startup.Configuration["KS:EntityClassUUID"];
            }
        }
        protected static string InterfaceClassUUID
        {
            get
            {
                return Startup.Configuration["KS:InterfaceClassUUID"];
            }
        }
        class authContent
        {
            public string token { get; set; }
        }
        private static async Task<HttpStatusCode> Login()
        {
            var request = new
            {
                login = Startup.Configuration["KS:Auth:login"],
                password = Startup.Configuration["KS:Auth:password"]
            };
            var content = JsonContent.Create(request);
            string url = "api/auth/login";
            HttpClient httpClient = new();
            var responce = await httpClient.PostAsync(new Uri(BaseURL, url), content);
            if (responce.StatusCode == HttpStatusCode.OK)
            {
                try
                {
                    authContent res = await responce.Content.ReadFromJsonAsync<authContent>();
                    ApiKey = res.token;
                }
                catch
                {
                    ApplicationInstance.Logger.LogError("Ошибка сервиса аутентификации");
                    return HttpStatusCode.BadRequest;
                }
            }
            return responce.StatusCode;
        }

        public static async Task<string> Post(string url, object request, Dictionary<string, string> headers = null, bool isSecond = false)
        {
            string result = string.Empty;
            var content = JsonContent.Create(request);
            var json = JsonSerializer.Serialize(request).ToString();
            var responce = await postData(new Uri(BaseURL, url), content, headers);
            switch (responce.StatusCode)
            {
                case HttpStatusCode.Unauthorized:
                    if (!isSecond)
                    {
                        var loginResultCode = await Login();
                        if (loginResultCode == HttpStatusCode.OK)
                            result = await Post(url, request, headers, true);
                        else
                        {
                            ApplicationInstance.Logger.LogError(string.Format("Ошибка сервиса аутентификации {0}", responce.StatusCode));
                        }
                    }
                    break;
                case HttpStatusCode.OK:
                    result = await responce.Content.ReadAsStringAsync();
                    break;
                default:
                    ApplicationInstance.Logger.LogError(string.Format("Ошибка вызоыв сервиса '{0}'. IN:{1}, OUT:{2})", url, JsonSerializer.Serialize(request, ApplicationInstance.CyrilicOptions), JsonSerializer.Serialize(responce, ApplicationInstance.CyrilicOptions)));
                    break;
            }
            return result;
        }
        private static async Task<HttpResponseMessage> postData(Uri url, HttpContent request, Dictionary<string, string> headers)
        {
            HttpClient httpClient = new();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", ApiKey);
            if (headers != null)
            {
                foreach (var h in headers)
                {
                    httpClient.DefaultRequestHeaders.Add(h.Key, h.Value);
                }
            }
            HttpResponseMessage result = await httpClient.PostAsync(url, request);
            return result;
        }

    }

}