namespace Web.Models
{
    public class SystemDataEntity
    {
        public long id { get; set; }
        public long systemid { get; set; }
        public long dataid { get; set; }
        public string system { get; set; }
        public string data { get; set; }
        public string state { get; set; }
        public string flowtype { get; set; }
        public string datadescription { get; set; }
    }
}
