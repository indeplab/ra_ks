using System;
using System.Collections.Generic;

namespace Web.Models
{
    public class DocumentEntity
    {
        public long id { get; set; }
        public string name { get; set; }
        public DateTime date { get; set; }
        public string type { get; set; }
        public int typeid { get; set; }
        public string typecode { get; set; }
        public string project { get; set; }
        public string author { get; set; }
        public string login { get; set; }
        public string version { get; set; }
        public string business_schema_name { get; set; }
        public string function_schema_name { get; set; }
        public string description { get; set; }
        public List<string> data { get; set; }
        public int stateid { get; set; }
        public string state { get; set; }
        public string statecolor { get; set; }
        public string statenext { get; set; }
        public int ord { get; set; }
        public int statecanedit { get; set; }
        public bool isdeleted {get;set;}
        public string docdata {get;set;}
    }
}
