namespace Web.Models
{
    public class DataEntity
    {
        public long id { get; set; }
        public long parentid { get; set; }
        public long refid { get; set; }
        public string name { get; set; }
        public string state { get; set; }
        public string flowtype { get; set; }
        public string description { get; set; }
        public string pod { get; set; }
        public string extid { get; set; }
    }
}
