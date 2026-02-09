using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace Web.Models
{
    public class NetobjectEntity
    {
        public long id { get; set; }
        public string name { get; set; }
        public string ip { get; set; }
        public string description { get; set; }
        public string extid { get; set; }
        public int typeid { get; set; }
        public int netzoneid { get; set; }
        public int netdcid { get; set; }
        public string zone { get; set; }
        public string datacenter { get; set; }

    }
}
