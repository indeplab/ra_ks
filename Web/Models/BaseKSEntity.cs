using System;

namespace Web.Models
{
    public class dataEntity
    {
        public string uuid { get; set; }
        public string name { get; set; }
        public string shortName { get; set; }
        public string description { get; set; }
        public string classUuid { get; set; }
        public dataEntity[] relations { get; set; } = Array.Empty<dataEntity>();
    }
    public class resultEntityList
    {
        public dataEntity[] data { get; set; } = Array.Empty<dataEntity>();
    }
}
