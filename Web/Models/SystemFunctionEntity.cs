namespace Web.Models
{
    public class SystemFunctionEntity
    {
        public long id { get; set; }
        public long systemid { get; set; }
        public long functionid { get; set; }
        public string system { get; set; }
        public string function { get; set; }
        public string method { get; set; }
        public string state { get; set; }
        public string functiondescription { get; set; }

    }
}
