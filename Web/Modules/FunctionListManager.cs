using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class FunctionListManager : BaseListManager{

        public FunctionListManager(FilterEntity filter):base(filter){
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
        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbName"], "%"), " function.name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbSystemID"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["tbSystemID"]), " a1.type='system_function' and a1.type_id2 = @sid");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("sysname", string.Concat("%", Filter["tbSystemName"], "%"), " a1.type='system_function' and a1.type_name ilike @sysname");
                if (!string.IsNullOrEmpty(Filter["tbInterfaceName"]))
                    query.Parameters.Add("intname", string.Concat("%", Filter["tbInterfaceName"], "%"), " (a1.type='interface_supply' or a1.type='interface_consumer') and a1.type_name ilike @intname");

                return (query);
            }
        }
    }
}
