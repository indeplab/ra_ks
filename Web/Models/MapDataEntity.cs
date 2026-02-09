namespace Web.Models
{
    public class MapDataEntity
    {
        public long id { get; set; }
        public string type { get; set; }
        public string name { get; set; }
        public string description { get; set; } = string.Empty;
        public string data { get; set; }
    }
}
