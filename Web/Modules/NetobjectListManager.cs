using System;
using System.Data;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class NetobjectListManager : BaseListManager{

        public NetobjectListManager(FilterEntity filter):base(filter){
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
                    query.Parameters.Add("typeid", ValueManager.GetLong(Filter["typeid"]), "netobject.netobject_type_id = @typeid");
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbName"], "%"), "netobject.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbIP"]))
                    query.Parameters.Add("ip", string.Concat("%", Filter["tbIP"], "%"), "netobject.ip ilike @ip");
                if (!string.IsNullOrEmpty(Filter["tbDCName"]))
                    query.Parameters.Add("dcname", string.Concat("%", Filter["tbDCName"], "%"), "dc.name ilike @dcname");
                if (!string.IsNullOrEmpty(Filter["tbZoneName"]))
                    query.Parameters.Add("zname", string.Concat("%", Filter["tbZoneName"], "%"), "z.name ilike @zname");

                return (query);
            }
        }
    }
}
