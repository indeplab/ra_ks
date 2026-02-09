namespace Web.Models
{
    public class FunctionEntity
    {
        public long id { get; set; }
        public long parentid { get; set; }
        public string parent { get; set; }       
        public long refid { get; set; }
        public string name { get; set; }
        public string method { get; set; }
        public string state { get; set; }
        public string extid { get; set; }
        public string description {get;set;}
    }
}
