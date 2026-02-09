using System;
using System.Collections.Generic;

namespace Web.Models
{
    public class SystemEntity
    {
        public long id { get; set; }
        public long parentid { get; set; }
        public string parent { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public string description { get; set; }
        public string state { get; set; }
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public long targetid { get; set; }
        public string target { get; set; }
        public List<FunctionEntity> functions { get; set; }
        public List<DataEntity> data { get; set; }
        public List<SystemPlatformEntity> components { get; set; }
        public List<SystemMetricEntity> metrics { get; set; }
        public int metricEntityid { get; set; } = 1;
        public string extid { get; set; }
        public string alias { get; set; }
        public string comment { get; set; }
        public string techdebt { get; set; }
        public string vendor { get; set; }
        public string managerBusiness { get; set; }
        public string managerIT { get; set; }
    }
    public class SystemMetricEntity
    {
        public string name { get; set; }
        public string value { get; set; }
    }

}
