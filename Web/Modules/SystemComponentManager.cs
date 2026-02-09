using DA;
using System;
using System.Data;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemComponentManager : BaseListManager
    {
        public SystemComponentManager(FilterEntity filter):base(filter){
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
                if (!string.IsNullOrEmpty(Filter["id"]))
                    query.Parameters.Add("parent_id", ValueManager.GetInt(Filter["id"]), "system.parent_id = @parent_id");

                return (query);
            }
        }
        public static SystemEntity Link(SystemEntity entity){

            string updateSQL = @"
                update system set parent_id=@parentid where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("parentid", entity.parentid),
                };
                manager.ExecuteNonQuery(updateSQL,p);
            }
            return entity;

        }

        public static void Unlink(long id)
        {
            string unlinkSQL = @"
                update system set parent_id=null WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(unlinkSQL, new DataParameter("id", id));
            }
        }
    }
}
