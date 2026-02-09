using System;
using System.Data;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class DictionaryListManager : BaseListManager{

        public DictionaryListManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            if (column.Caption.Equals("ord", StringComparison.OrdinalIgnoreCase) && ValueManager.GetInt(row[column])==0)
                return "";
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (ValueManager.GetLong(Filter["ddlEntity"])!=0)
                    query.Parameters.Add("entityid", ValueManager.GetLong(Filter["ddlEntity"]), "dictionary.entity_id = @entityid");
                if (!string.IsNullOrEmpty(Filter["tbDictionary"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbDictionary"], "%"), "dictionary.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbMetric"]))
                    query.Parameters.Add("value", string.Concat("%", Filter["tbMetric"], "%"), "dictionary.value ilike @value");

                return (query);
            }
        }
    }
}
