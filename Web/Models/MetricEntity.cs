
namespace Web.Models
{
    public class MetricEntity
    {
        public string name { get; set; }
        public string value { get; set; }
        public string alias { get; set; }
        public bool requared { get; set; }
        public int order { get; set; }
    }
}
