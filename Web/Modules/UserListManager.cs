using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using DA;
using Web.UI;

namespace Web.Modules
{
    public class UserListManager : BaseListManager{

        public UserListManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
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
                if (!string.IsNullOrEmpty(Filter["tbLogin"]))
                    query.Parameters.Add("user_login", string.Concat("%", Filter["tbLogin"],"%"), "LOWER(staff.login) = LOWER(@user_login)");
                if (!string.IsNullOrEmpty(Filter["tbName"]))
                    query.Parameters.Add("name", string.Concat(Filter["tbName"], "%"), "staff.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["ddlRole"]) && Filter["ddlRole"] != "0")
                    query.Parameters.Add("Role", ValueManager.GetInt(Filter["ddlRole"]), "staffRole.Role_ID = @Role");
                if (!string.IsNullOrEmpty(Filter["ddlState"]))
                    query.Parameters.Add("State", ValueManager.GetInt(Filter["ddlState"]), "COALESCE(staff.State_ID,0) = @State");

                return (query);
            }
        }
    }
}
