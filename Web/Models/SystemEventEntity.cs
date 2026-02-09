using System;

namespace Web.Models
{
    public class SystemEventEntity
    {
        public long id { get; set; }
        public long systemid { get; set; }
        public string system { get; set; }
        public string name { get; set; }
        public string state { get; set; }
        public string type { get; set; }
        public DateTime date { get; set; }
        public string description { get; set; }

    }
}
