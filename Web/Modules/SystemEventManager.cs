using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using DA;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemEventManager : BaseListManager{

        public SystemEventManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Date":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("Name", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            if (column.Caption.Equals("Date", StringComparison.OrdinalIgnoreCase) && !String.IsNullOrEmpty(row[column].ToString()))
                return ValueManager.GetDateTime(row[column]).ToString("dd.MM.yyyy");
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["id"]))
                    query.Parameters.Add("id", ValueManager.GetInt(Filter["id"]), "system_event.system_id = @id");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("system", string.Concat("%", Filter["tbSystemName"], "%"), "system.Name ilike @system");

                return (query);
            }
        }
        public static SystemEventEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    system.id as systemid, 
                    system.name as system, 
                    system_event.type,
                    system_event.name,
                    system_event.state,
                    system_event.date,
                    system_event.description
                from 
                    system_event
                    inner join system on system_event.system_id=system.id 
                where 
                    system_event.id={0}
            ", id);
            SystemEventEntity result = new SystemEventEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count>0)
            {
                result = new SystemEventEntity() { 
                    id=id,
                    systemid = ValueManager.GetInt(data.Rows[0]["systemid"]),
                    system = ValueManager.GetString(data.Rows[0]["system"]),
                    name = ValueManager.GetString(data.Rows[0]["name"]),
                    state = ValueManager.GetString(data.Rows[0]["state"]),
                    type = ValueManager.GetString(data.Rows[0]["type"]),
                    date = ValueManager.GetDateTime(data.Rows[0]["date"]),
                    description = ValueManager.GetString(data.Rows[0]["description"])
                };
            }
            return result;
        }

        public static SystemEventEntity Save(SystemEventEntity entity){

            string insertSQL = @"insert into system_event 
                    (system_id,date,name,state,type,description)
                    values (@system_id,@date,@name,@state,@type,@description)
                    returning id
            ";
            string updateSQL = @"update system_event set 
                            system_id=@system_id,
                            date=@date,
                            name=@name,
                            state=@state,
                            type=@type,
                            description=@description
                where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("system_id", entity.systemid),
                    new DataParameter("date", entity.date),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name)),
                    new DataParameter("state", ValueManager.GetValueOrDBNull(entity.state)),
                    new DataParameter("type", ValueManager.GetValueOrDBNull(entity.type)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL,p));
                else
                    manager.ExecuteNonQuery(updateSQL,p);
            }
            return entity;

        }
        public static void Delete(long id)
        {
            string deleteSQL = @"
                DELETE FROM system_event WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
        
    }
}
