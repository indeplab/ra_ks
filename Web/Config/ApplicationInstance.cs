using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Modules.Config;

public static class ApplicationInstance
{
        public static JsonSerializerOptions JSOptions = new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
        public static ILogger? Logger { get; set; } = null;
}