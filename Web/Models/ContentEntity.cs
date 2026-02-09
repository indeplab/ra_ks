namespace Web.Models
{
    public class ContentEntity
    {
        public long id { get; set; }
        public long typeid { get; set; }
        public string type { get; set; }
        public string name { get; set; }
        public string image { get; set; }
        public string src { get; set; }
        public string file { get; set; }
        public int partid { get; set; } = 0;
        public int ord { get; set; } = 0;
        public bool islink { get; set; } = false;
        public string description { get; set; }
    }
}
