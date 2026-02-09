using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using System.IO;
using Web.Models;

namespace Web.Modules
{
    public class FileManager
    {
        public static bool DeleteDir(string type, string name){
            string basePath = Startup.Configuration[string.Format("FileStore:{0}Path", type)];
            string dir = Path.Combine(basePath, name);
            if(Directory.Exists(dir)){
                try{
                    Directory.Delete(dir, true);
                }
                catch{
                    return false;
                }
            }
            return true;
        }
        public static bool Delete(string type, string subpath, string name)
        {
            string basePath = Startup.Configuration[string.Format("FileStore:{0}Path", type)];
            string file = Path.Combine(basePath, subpath, name);
            string dir = Path.GetDirectoryName(file);
            if (File.Exists(file))
            {
                try
                {
                    File.Delete(file);
                    if (Directory.GetFiles(dir).Length == 0 && Directory.GetDirectories(dir).Length == 0)
                        Directory.Delete(dir);
                    return true;
                }
                catch { }
            }
            return false;
        }
        public static bool Save(string type, string subpath, IFormFile file)
        {
            using var fileStream = file.OpenReadStream();
            byte[] content = new byte[file.Length];
            fileStream.Read(content, 0, (int)file.Length);

            string basePath = Startup.Configuration[string.Format("FileStore:{0}Path", type)];
            string filename = Path.Combine(basePath, subpath, file.FileName);
            string dir = Path.GetDirectoryName(filename);
            try
            {
                if (!Directory.Exists(dir))
                    Directory.CreateDirectory(dir);
                File.WriteAllBytes(filename, content);
                return true;
            }
            catch { }
            return false;
        }
        public static FileEntity GetFile(string type, string name)
        {
            string basePath = Startup.Configuration[string.Format("FileStore:{0}Path", type)];
            string file = Path.Combine(basePath, name);
            var provider = new FileExtensionContentTypeProvider();
            if (!File.Exists(file)) return null;
            string contentType;
            if (!provider.TryGetContentType(file, out contentType))
                contentType = "application/octet-stream";

            return new()
            {
                name = Path.GetFileName(file),
                contentType = contentType,
                content = File.ReadAllBytes(file)
            };
        }
        public static string ReadText(string filename){
            return File.ReadAllText(filename);
        }
        public static void WriteText(string filename, string data){
            File.WriteAllText(filename,data);
        }
    }
}
