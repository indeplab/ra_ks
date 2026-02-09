using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class DataListManager : BaseListManager{

        public DataListManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            if (column.Caption.Equals("img_value", StringComparison.OrdinalIgnoreCase))
            {
                if (row.Table.Columns.Contains("type_code"))
                {
                    switch (row["type_code"].ToString().ToLower())
                    {
                        case "systemdata":
                            return "<img src='../../images/s_system.png' title='Система' />";
                        case "interface":
                            return "<img src='../../images/s_interface.png' title='Интерфейс' />";
                    }
                }
            }
            return base.OnFormatValue(column, row);
        }
        public override DataTable GetDataTable()
        {
            DataTable res = base.GetDataTable();
            StringBuilder sb = new StringBuilder();
            foreach (DataRow row in res.Rows)
            {
                if (row["id"] != null)
                    sb.AppendFormat("{0},", row["id"]);
            }
            if (sb.Length > 0)
            {
                DataTable data = null;
                using (DataManager manager = new DataManager())
                    data = manager.GetDataTable(string.Format("select data.*,interface_data.interface_id from data inner join interface_data on interface_data.data_id=data.id where interface_data.interface_id in ({0})", sb.ToString(0, sb.Length - 1)));
                res.Columns.Add(new DataColumn("interfacedata"));
                if (data != null)
                {
                    for (int i = 0; i < res.Rows.Count; i++)
                    {
                        var row = res.Rows[i];
                        if (row["id"] != null)
                        {
                            StringBuilder sb1 = new StringBuilder();
                            foreach (DataRow r in data.Select(string.Format("interface_id={0}", row["id"])))
                            {
                                sb1.AppendFormat("{0}, ", ValueManager.GetString(r["name"]));
                            }
                            row["interfacedata"] = (sb1.Length > 0 ? sb1.ToString(0, sb1.Length - 2) : "");
                        }
                    }
                }
            }

            return res;
        }
        public override void DataBind()
        {
            base.DataBind();
            StringBuilder sb = new StringBuilder();
            foreach (var row in Filter.resultRows)
            {
                if (row["id"] != null)
                    sb.AppendFormat("{0},", row["id"]);
            }
            if (sb.Length > 0)
            {
                DataTable data = null;
                using (DataManager manager = new DataManager())
                    data = manager.GetDataTable(string.Format("select data.*,interface_data.interface_id from data inner join interface_data on interface_data.data_id=data.id where interface_data.interface_id in ({0})", sb.ToString(0, sb.Length - 1)));
                if (data != null)
                {
                    for (int i = 0; i < Filter.resultRows.Length; i++)
                    {
                        var row = Filter.resultRows[i];
                        if (row["id"] != null)
                        {
                            List<InterfaceData> list = new List<InterfaceData>();
                            foreach (DataRow r in data.Select(string.Format("interface_id={0}", row["id"])))
                            {
                                list.Add(new InterfaceData()
                                {
                                    id = ValueManager.GetInt(r["id"]),
                                    name = ValueManager.GetString(r["name"])
                                });
                            }
                            row.Add("interfacedata", list);
                        }
                    }
                }
            }
        }
        private class InterfaceData
        {
            public int id { get; set; }
            public string name { get; set; }
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbName"], "%"), " data.name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbSystemID"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["tbSystemID"]), " a1.type='system_data' and a1.type_id3 = @sid");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("sysname", string.Concat("%", Filter["tbSystemName"], "%"), " a1.type='system_data' and a1.type_name ilike @sysname");
                if (!string.IsNullOrEmpty(Filter["tbInterfaceName"]))
                    query.Parameters.Add("intname", string.Concat("%", Filter["tbInterfaceName"], "%"), " a1.type='interface_data' and a1.type_name ilike @intname");

                return (query);
            }
        }
    }
}
