namespace Web.Models
{
    public class DataEntity
    {
        public string id { get; set; }
        public string parentid { get; set; }
        public string refid { get; set; }
        public string name { get; set; }
        public string state { get; set; } = "exist";
        public string flowtype { get; set; } = "master";
        public string description { get; set; }
        public string pod { get; set; }
        public string extid { get; set; }
    }
}
