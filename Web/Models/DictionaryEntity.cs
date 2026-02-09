namespace Web.Models
{
    public class DictionaryEntity
    {
        public long id { get; set; }
        public string name { get; set; }
        public string value { get; set; }
        public string description { get; set; } = string.Empty;
        public int entityid { get; set; }
        public string alias { get; set; }
        public bool requared { get; set; }
        public string color { get; set; } = string.Empty;
        public int order { get; set; } = 0;
        public string img { get; set; } = string.Empty;
    }
}
