using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace Web.Models
{
    public class NetzoneEntity
    {
        public long id { get; set; }
        public string name { get; set; }
        public string color { get; set; }
        public string description { get; set; }
        public string extid { get; set; }
        public int typeid { get; set; }

    }
}
