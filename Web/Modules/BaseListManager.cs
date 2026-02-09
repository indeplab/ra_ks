using DA;
using System;
using System.Collections.Generic;
using System.Data;
using Web.UI;

namespace Web.Modules
{
    public class BaseListManager
    {
        public static DataTable MapColumn(DataTable data, Dictionary<string, string> tomap, string[] todelete)
        {
            foreach(string col in todelete)
            {
                if (data.Columns.Contains(col))
                    data.Columns.Remove(col);
            }
            foreach (var col in tomap)
            {
                if (data.Columns.Contains(col.Key))
                    data.Columns[col.Key].ColumnName = col.Value;
            }
            return data;
        }
        public FilterEntity Filter{get;set;}
        public BaseListManager(FilterEntity filter){
            Filter=filter;
        }
        protected virtual GridQuery Query
        {
            get
            {
                return (new GridQuery());
            }
        }
        protected string FormattedExportSQL
        {
            get
            {
                return string.Format("select * from ({0}) a1 {1}"
                    , (Filter.selectSQL.IndexOf("{where}", 0, StringComparison.OrdinalIgnoreCase) > -1 ? Filter.selectSQL.Replace("{where}", Query.ToString()) : Filter.selectSQL + Query.ToString())
                    , !string.IsNullOrEmpty(Filter.currentSort) ? string.Format("order by {0}", Filter.currentSort) : string.Empty
                );
            }
        }
        protected virtual string FormattedSelectSQL
        {
            get
            {
                return string.Format("select * from({0}) a1 {1} limit {2} offset {3}"
                        , (Filter.selectSQL.IndexOf("{where}", 0, StringComparison.OrdinalIgnoreCase) > -1? Filter.selectSQL.Replace("{where}", Query.ToString()) : Filter.selectSQL + Query.ToString())
                        , !string.IsNullOrEmpty(Filter.currentSort) ? string.Format("order by {0}", Filter.currentSort) : string.Empty
                        , Filter.rows
                        , ((Filter.currentPage - 1) * Filter.rows)
                    );
            }
        }
        protected virtual string FormattedCountSQL
        {
            get
            {
                return string.Format("select count(*) from ({0}) a1"
                        , (Filter.selectSQL.IndexOf("{where}", 0, StringComparison.OrdinalIgnoreCase) > -1? Filter.selectSQL.Replace("{where}", Query.ToString()) : Filter.selectSQL + Query.ToString())
                        );
            }
        }
        protected virtual object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.DataType == typeof(DateTime))
                return string.Format("{0:d}", row[column]);
            return row[column];
        }
        public virtual DataTable GetDataTable()
        {
            DataTable data = null;
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(FormattedExportSQL, Query.ToDataParameterArray());
            return data;
        }
        public virtual void DataBind()
        {
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                Filter.rowCount = ValueManager.GetLong(manager.ExecuteScalar(FormattedCountSQL, Query.ToDataParameterArray()));
                if (Filter.rowCount <= (Filter.currentPage - 1) * Filter.rows)
                    Filter.currentPage = 1;
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
        public void ApplyFilter(FilterEntity filter, Dictionary<string, string> search, long rows, Dictionary<string, string> param, string selectsql){

            if (param!=null && param.ContainsKey("page"))
            {
                Filter.currentPage = ValueManager.GetInt(param["page"]);
                if (Filter.currentPage == 0)
                    Filter.currentPage = 1;
                param.Remove("page");
            }

            if (param!=null && param.ContainsKey("sort"))
            {
                string sort = ValueManager.GetString(param["sort"]);
                if (!string.IsNullOrWhiteSpace(sort))
                {
                    if (Filter.currentSort.IndexOf(sort, StringComparison.OrdinalIgnoreCase) != -1)
                    {
                        if (Filter.currentSort.IndexOf("desc", StringComparison.OrdinalIgnoreCase) == -1)
                            Filter.currentSort = sort + " desc";
                        else
                            Filter.currentSort = sort;
                    }
                    else
                        Filter.currentSort = sort;
                }
                param.Remove("sort");
            }
            Filter.search = search;
            Filter.rows = rows;
            Filter.param = param;
            Filter.selectSQL=selectsql;

        }

    }
}
