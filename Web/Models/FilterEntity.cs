using DA;
using System;
using System.Collections.Generic;

namespace Web.UI
{
    public class FilterEntity 
    {
        public FilterEntity(){
            currentPage = 1;
            rowCount = 0;
            rows = 30;
            currentSort=string.Empty;
            selectSQL=string.Empty;
            param=null;
        }
        public Dictionary<string, string> search {get;set;}
        public Dictionary<string, object>[] resultRows {get;set;}
        public int currentPage {get;set;} 
        public long rowCount {get;set;}
        public long rows {get;set;}
        public string currentSort {get;set;}
        public string selectSQL {get;set;}
        
        public object minAggregate { get; set; }
        public object maxAggregate { get; set; }

        public Dictionary<string, string> param { get; set; }

        public string this[string name]
        {
            get
            {
                if (search != null && search.ContainsKey(name))
                    return search[name];
                return string.Empty;
            }
            set
            {
                if (search == null)
                    search = new Dictionary<string, string>();
                search[name] = value;
            }
        }

    }
}
