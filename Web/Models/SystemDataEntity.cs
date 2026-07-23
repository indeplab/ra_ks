namespace Web.Models
{
    public class SystemDataEntity
    {
        public string id { get; set; }
        public string systemid { get; set; }
        public string dataid { get; set; }
        public string system { get; set; }
        public string data { get; set; }
        public string state { get; set; } = "exist";
        public string flowtype { get; set; } = "master";
        public string datadescription { get; set; }
    }
}
