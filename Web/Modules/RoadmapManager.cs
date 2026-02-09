using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class RoadmapManager : BaseListManager{

        public RoadmapManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override string FormattedCountSQL
        {
            get
            {
                return string.Format("select count(*) as cnt, max(date) as maxdate,min(date) as mindate from ({0}) a1"
                        , (Filter.selectSQL.IndexOf("{where}", 0, StringComparison.OrdinalIgnoreCase) > -1? Filter.selectSQL.Replace("{where}", Query.ToString()) : Filter.selectSQL + Query.ToString())
                        );
            }
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            if (column.Caption.Equals("img", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "";
            return base.OnFormatValue(column, row);
        }

        public static List<object> GetLegend(string metric){
            string selectSQL = string.Format(@"
                select distinct value,img,color,ord from dictionary where name='{0}' order by ord
            ", metric);
            List<object> result = new List<object>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(new {
                        name = ValueManager.GetString(row["value"]),
                        img = ValueManager.GetString(row["img"]),
                        color = ValueManager.GetString(row["color"])
                    });
                }
            }
            return result;
        }
        public override void DataBind()
        {
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                DataTable res = manager.GetDataTable(FormattedCountSQL, Query.ToDataParameterArray());
                if (res != null && res.Rows.Count > 0)
                {
                    var row = res.Rows[0];
                    Filter.minAggregate = ValueManager.GetDateTime(row["mindate"]);
                    Filter.maxAggregate = ValueManager.GetDateTime(row["maxdate"]);
                    Filter.rowCount = ValueManager.GetLong(row["cnt"]);
                    if (Filter.rowCount <= (Filter.currentPage - 1) * Filter.rows)
                        Filter.currentPage = 1;
                }
                data = manager.GetDataTable(FormattedSelectSQL, Query.ToDataParameterArray());
            }
            Filter.resultRows = null;
            //Save();
            if (data != null)
            {
                Filter.resultRows = new Dictionary<string, object>[data.Rows.Count];
                for (int i = 0; i < data.Rows.Count; i++)
                {
                    Dictionary<string, object> res = new Dictionary<string, object>(data.Columns.Count);
                    foreach (DataColumn column in data.Columns)
                        res.Add(column.ColumnName, OnFormatValue(column, data.Rows[i]));
                    Filter.resultRows[i] = res;
                }
            }
        }
        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["ddlType"]))
                    query.Parameters.Add("type", Filter["ddlType"], "system_event.type ilike @type");

                if (ValueManager.GetLong(Filter["tbID"]) != 0)
                    query.Parameters.Add("id", ValueManager.GetLong(Filter["tbID"]), "system.id = @id");
                if (!string.IsNullOrEmpty(Filter["tbAlias"]))
                    query.Parameters.Add("alias", string.Concat("%", Filter["tbAlias"], "%"), "system.alias ilike @alias");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbSystemName"], "%"), "system.Name ilike @name");
                if (ValueManager.GetLong(Filter["tbParentID"]) != 0)
                    query.Parameters.Add("parentid", ValueManager.GetLong(Filter["tbParentID"]), "system.parent_id = @parentid");
                if (!string.IsNullOrEmpty(Filter["tbParentName"]))
                    query.Parameters.Add("parentname", string.Concat("%", Filter["tbParentName"], "%"), "system.parent_id in (select id from system where name ilike @parentname)");
                if (!string.IsNullOrEmpty(Filter["tbParentAlias"]))
                    query.Parameters.Add("parentalias", string.Concat("%", Filter["tbParentAlias"], "%"), "system.parent_id in (select id from system where alias ilike @parentalias)");

                if(!string.IsNullOrEmpty(Filter["tbFilter"])){
                    QueryAndCollection queryFilter = new QueryAndCollection();
                    string[] conditions= new string[]{"=","<>"};
                    foreach(string condition in Filter["tbFilter"].Split(new string[]{";"},StringSplitOptions.RemoveEmptyEntries)){
                        foreach(string c in conditions){
                            if(condition.Split(c).Length==2){
                                string name = condition.Split(c)[0].Trim();
                                string value = condition.Split(c)[1].Trim();
                                if(name.Equals("Родительская АС", StringComparison.OrdinalIgnoreCase)){
                                    queryFilter.Parameters.Add(
                                        string.Format("COALESCE(system.parent_id){0}{1}"
                                            ,c, (value.Equals("Пусто", StringComparison.OrdinalIgnoreCase)?0:ValueManager.GetInt(value))
                                        )
                                    );
                                }
                                else
                                {
                                    queryFilter.Parameters.Add(
                                        string.Format("system.id in (select system_id from system_metric where trim(name)='{0}' and trim(value){2}'{1}')"
                                            ,name,value,c
                                        )
                                    );
                                }
                            }
                        }
                    }
                    query.Parameters.Add("conditions", "", queryFilter.ToString());
                }
                /*if (!string.IsNullOrEmpty(Filter["dtStartDate"]))
                    query.Parameters.Add("startdate", ValueManager.GetDateTime(Filter["dtStartDate"]), "system.purchase_date>=@startdate and system.prelive_date>=@startdate and system.live_date>=@startdate");
                if (!string.IsNullOrEmpty(Filter["dtEndDate"]))
                    query.Parameters.Add("enddate", ValueManager.GetDateTime(Filter["dtEndDate"]), "system.purchase_date<=@enddate and system.prelive_date<=@enddate and system.live_date<=@enddate");
*/
                //query.Parameters.Add("subsystem", "","not system.id in (select system_id from system_metric where value ilike 'Подсистема')");

                return (query);
            }
        }
    }
}
