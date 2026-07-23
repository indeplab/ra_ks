using System.Collections.Generic;

namespace Web.Models
{
    public class InterfaceEntity
    {
        public string id { get; set; }
        public string name { get; set; }
        public string state { get; set; } = "exist";
        public string consumerid { get; set; }
        public string supplyid { get; set; }
        public string consumername { get; set; }
        public string supplyname { get; set; }
        public string consumerdescription { get; set; }
        public string supplydescription { get; set; }
        public string interaction { get; set; }
        public string supplyint { get; set; }
        public string consumerint { get; set; }
        public string interactionplatform { get; set; }
        public string consumerfunctionid { get; set; }
        public string supplyfunctionname { get; set; }
        public string consumerfunctionname { get; set; }
        public long supplyfunctionid { get; set; }
        public string consumermethod { get; set; }
        public string docref { get; set; }
        public string description { get; set; }
        public List<DataEntity> data { get; set; }
        public string extid { get; set; }
        public bool issupplyreсeive {get;set;}

    }
}
