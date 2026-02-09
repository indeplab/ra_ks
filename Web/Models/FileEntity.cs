namespace Web.Models
{
    public class FileEntity
    {
        public string type { get; set; }
        public string name { get; set; }
        public byte[] content { get; set; }
        public string contentType { get; set; }
        public string text { get; set; }
    }
}
