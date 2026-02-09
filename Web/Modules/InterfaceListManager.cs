using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class InterfaceListManager : BaseListManager{

        public InterfaceListManager(FilterEntity filter):base(filter){
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
                        case "systemfunction":
                            return "<img src='../../images/s_system.png' title='Система' />";
                        case "consumer":
                            return "<img src='../../images/s_interface2.png' title='Функция&nbsp;потребителя&nbsp;интерфейса' />";
                        case "supply":
                            return "<img src='../../images/s_interface.png' title='Функция&nbsp;поставщика&nbsp;интерфейса' />";
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
                            StringBuilder sb1=new StringBuilder();
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
            foreach(var row in Filter.resultRows)
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
                    for(int i = 0; i < Filter.resultRows.Length; i++)
                    {
                        var row = Filter.resultRows[i];
                        if (row["id"] != null) {
                            List<InterfaceData> list = new List<InterfaceData>();
                            foreach(DataRow r in data.Select(string.Format("interface_id={0}", row["id"])))
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
            public int id{ get; set; }
            public string name { get; set; }
        }
        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["cid"]))
                    query.Parameters.Add("cid", ValueManager.GetInt(Filter["cid"]), "interface.consumer_id = @cid");
                if (!string.IsNullOrEmpty(Filter["sid"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["sid"]), "interface.supply_id = @sid");
                if (!string.IsNullOrEmpty(Filter["tbConsumerID"]))
                    query.Parameters.Add("cid", ValueManager.GetInt(Filter["tbConsumerID"]), "interface.consumer_id = @cid");
                if (!string.IsNullOrEmpty(Filter["tbSupplyID"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["tbSupplyID"]), "interface.supply_id = @sid");
                if (!string.IsNullOrEmpty(Filter["tbConsumer"]))
                    query.Parameters.Add("consumername", string.Concat("%", Filter["tbConsumer"], "%"), "c.Name ilike @consumername");
                if (!string.IsNullOrEmpty(Filter["tbConsumerFunction"]))
                    query.Parameters.Add("consumerfunction", string.Concat("%", Filter["tbConsumerFunction"], "%"), "cf.Name ilike @consumerfunction");
                if (!string.IsNullOrEmpty(Filter["tbSupply"]))
                    query.Parameters.Add("supplyname", string.Concat("%", Filter["tbSupply"], "%"), "s.Name ilike @supplyname");
                if (!string.IsNullOrEmpty(Filter["tbSupplyFunction"]))
                    query.Parameters.Add("supplyfunction", string.Concat("%", Filter["tbSupplyFunction"], "%"), "sf.Name ilike @supplyfunction");
                if (!string.IsNullOrEmpty(Filter["tbSupplyFunctionС"]))
                    query.Parameters.Add("supplyfunction", string.Concat("%", Filter["tbSupplyFunctionС"], "%"), "sf.Name ilike @supplyfunction");
                if (!string.IsNullOrEmpty(Filter["tbSupplyFunctionMethod"]))
                    query.Parameters.Add("supplymethod", string.Concat("%", Filter["tbSupplyFunctionMethod"], "%"), "interface.consumer_method ilike @supplymethod");
                if (!string.IsNullOrEmpty(Filter["tbSupplyFunctionMethodС"]))
                    query.Parameters.Add("supplymethod", string.Concat("%", Filter["tbSupplyFunctionMethodС"], "%"), "interface.consumer_method ilike @supplymethod");
                if (!string.IsNullOrEmpty(Filter["tbData"]))
                    query.Parameters.Add("data", string.Concat("%", Filter["tbData"], "%"), "interface.id in (select interface_data.interface_id from interface_data inner join data on interface_data.data_id=data.id where data.Name ilike @data)");
                if (!string.IsNullOrEmpty(Filter["tbDataС"]))
                    query.Parameters.Add("data", string.Concat("%", Filter["tbDataС"], "%"), "interface.id in (select interface_data.interface_id from interface_data inner join data on interface_data.data_id=data.id where data.Name ilike @data)");
                if (!string.IsNullOrEmpty(Filter["did"]))
                    query.Parameters.Add("did", ValueManager.GetInt(Filter["did"]), "interface.id in (select interface_id from interface_data where interface_data.data_id = @did)");
                if (!string.IsNullOrEmpty(Filter["fid"]))
                    query.Parameters.Add("fid", ValueManager.GetInt(Filter["fid"]), "(interface.consumer_function_id =@fid or interface.supply_function_id = @fid)");

                return (query);
            }
        }
    }
}
