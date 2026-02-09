namespace Web.Models
{
    public class SystemServerEntity
    {
        public long id { get; set; }
        public long systemid { get; set; }
        public long serverid { get; set; }
        public string system { get; set; }
        public string server { get; set; }
        public string ip { get; set; }
        public string state { get; set; }
        public string serverdescription { get; set; }

    }
}
