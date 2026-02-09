namespace Web.Models
{
    public class DashboardEntity
    {
        public long id { get; set; }
        public long entity_id { get; set; }
        public string name { get; set; }
        public string[] hmetric { get; set; }
        public string[] vmetric { get; set; }
        public string metric { get; set; }
        public string description {get;set;}
        public bool grouped { get; set; }
        public string filter { get; set; }
        public string[] label { get; set; }
        public string orientation { get; set; }
    }
}
