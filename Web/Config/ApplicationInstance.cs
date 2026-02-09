using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using Microsoft.Extensions.Logging;

namespace Modules.Config;

public static class ApplicationInstance
{
        public static JsonSerializerOptions JSOptions = new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };
        public static JsonSerializerOptions CyrilicOptions = new JsonSerializerOptions
        {
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.BasicLatin, UnicodeRanges.Cyrillic),
                WriteIndented = true
        };        
        public static ILogger? Logger { get; set; } = null;
}