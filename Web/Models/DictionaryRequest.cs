namespace Web.Models
{
    public class DictionaryRequest
    {
        public int ID { get; set; }
        public int ID2 { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string Term { get; set; }
        public int Length { get; set; }
        public bool IsRecursion { get; set; }
    }
}
