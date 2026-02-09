namespace Web.Models
{
    public class DocumentStateEntity
    {
        public long id { get; set; }
        public string name { get; set; }
        public string color { get; set; }
        public bool canedit { get; set; }
        public string next { get; set; }
        public int order { get; set; }
    }
}
