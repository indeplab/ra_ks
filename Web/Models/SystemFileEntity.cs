namespace Web.Models
{
    public class SystemFileEntity
    {
        public long id { get; set; } = 0;
        public long systemid { get; set; }
        public string system { get; set; }
        public string file { get; set; }
        public string name { get; set; }
        public string description { get; set; }

    }
}
