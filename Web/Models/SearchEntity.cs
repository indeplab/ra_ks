using System.Collections.Generic;

namespace Web.Models
{
    public class SearchEntity
    {
        public string type {get;set;}
        public string term {get;set;}
        public int length {get;set;}
        public int page {get;set;}
        public Dictionary<string, string> filter {get;set;}
        
        public string this[string name]
        {
            get
            {
                if (filter != null && filter.ContainsKey(name))
                    return filter[name];
                return string.Empty;
            }
            set
            {
                if (filter == null)
                    filter = new Dictionary<string, string>();
                filter[name] = value;
            }
        }
    }
}
