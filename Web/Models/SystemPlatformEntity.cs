namespace Web.Models
{
    public class SystemPlatformEntity
    {
        public string id { get; set; }
        public string typename { get; set; }
        public string systemid { get; set; }
        public string system { get; set; }
        public string state { get; set; } = "exist";
        public string type { get; set; }
        public string desc{ get; set; }
        public string value { get; set; }

    }
}
