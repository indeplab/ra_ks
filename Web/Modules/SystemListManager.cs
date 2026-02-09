using System;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class SystemListManager : BaseListManager{

        public SystemListManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        public static DataTable GetIdDataTable(){
            DataTable dt = new DataTable();
            using (DataManager manager = new DataManager()){
                dt = manager.GetDataTable("select id from system");
            }
            return dt;
        }
        public DataTable GetSystemDataTable()
        {
            DataTable dt = new DataTable();
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(string.Format("select distinct id from ({0}) as a1", FormattedExportSQL));
                if(data!=null && data.Rows.Count > 0)
                {
                    StringBuilder sb = new StringBuilder();
                    foreach (DataRow row in data.Rows)
                        sb.AppendFormat("{0},", row["id"]);
                    string criteria = (sb.Length > 0 ? sb.ToString(0, sb.Length - 1) : "0");

                    data = manager.GetDataTable(string.Format(@"
                        select distinct name from (
                        select distinct name from dictionary where entity_id=1
                        union
                        select distinct name from system_metric where system_id in ({0})) a1
                        order by name"
                    , criteria));
                    if (data != null)
                    {
                        sb = new StringBuilder();
                        foreach (DataRow row in data.Rows)
                            sb.AppendFormat(", max(case when system_metric.name='{0}' then system_metric.value end) as \"{0}\"", row["name"]);
                        string selectSQL = string.Format(@"
                            select a0.*,a1.* 
                                from 
                                ({2}) as a0
                                inner join (select system.id as system_id {0} from system left join system_metric on system.id=system_metric.system_id where system.id in ({1}) group by system.id) as a1 on a0.id=a1.system_id
                        ", sb.ToString(), criteria, Filter.selectSQL);
                        dt = manager.GetDataTable(selectSQL);
                    }
                }

            }
            return dt;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (ValueManager.GetLong(Filter["tbID"])!=0)
                    query.Parameters.Add("id", ValueManager.GetLong(Filter["tbID"]), "system.id = @id");
                if (!string.IsNullOrEmpty(Filter["tbAlias"]))
                    query.Parameters.Add("alias", string.Concat("%", Filter["tbAlias"], "%"), "system.alias ilike @alias");
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbName"], "%"), "system.Name ilike @name");
                if (ValueManager.GetLong(Filter["tbParentID"]) != 0)
                    query.Parameters.Add("parentid", ValueManager.GetLong(Filter["tbParentID"]), "system.parent_id = @parentid");
                if (!string.IsNullOrEmpty(Filter["tbParentName"]))
                    query.Parameters.Add("parentname", string.Concat("%", Filter["tbParentName"], "%"), "system.parent_id in (select id from system where name ilike @parentname)");
                if (!string.IsNullOrEmpty(Filter["tbParentAlias"]))
                    query.Parameters.Add("parentalias", string.Concat("%", Filter["tbParentAlias"], "%"), "system.parent_id in (select id from system where alias ilike @parentalias)");
                if (!string.IsNullOrEmpty(Filter["tbDictionary"]))
                    query.Parameters.Add("dict", string.Concat("%", Filter["tbDictionary"], "%"), "system.id in (select system_id from system_metric where name ilike @dict)");
                if (!string.IsNullOrEmpty(Filter["tbMetric"]))
                    query.Parameters.Add("metric", string.Concat("", Filter["tbMetric"], ""), "system.id in (select system_id from system_metric where value ilike @metric)");
                query.Parameters.Add("subsystem", "","not system.id in (select system_id from system_metric where value ilike 'Подсистема')");

                return (query);
            }
        }
    }
}
