using System;
using System.Data;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class NetzoneListManager : BaseListManager{

        public NetzoneListManager(FilterEntity filter):base(filter){
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
                if (ValueManager.GetLong(Filter["typeid"])!=0)
                    query.Parameters.Add("typeid", ValueManager.GetLong(Filter["typeid"]), "netzone.netzone_type_id = @typeid");
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbName"], "%"), "netzone.Name ilike @name");

                return (query);
            }
        }
    }
}
