using DA;
using System;
using System.Collections.Generic;
using System.Data;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemPlatformManager : BaseListManager
    {
        public SystemPlatformManager(FilterEntity filter):base(filter){
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
                    query.Parameters.Add("id", ValueManager.GetInt(Filter["id"]), "system_platform.system_id = @id");

                return (query);
            }
        }
        public static SystemPlatformEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    system.id as systemid, 
                    system.name as system, 
                    system_platform.type,
                    system_platform.name,
                    system_platform.value,
                    system_platform.description,
                    system_platform.state
                from 
                    system_platform 
                    inner join system on system_platform.system_id=system.id 
                where 
                    system_platform.id={0}
            ", id);
            SystemPlatformEntity result = new SystemPlatformEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                result = new SystemPlatformEntity() { 
                    id=id,
                    systemid = ValueManager.GetInt(data.Rows[0]["systemid"]),
                    system = ValueManager.GetString(data.Rows[0]["system"]),
                    type = ValueManager.GetString(data.Rows[0]["type"]),
                    typename = ValueManager.GetString(data.Rows[0]["name"]),
                    value = ValueManager.GetString(data.Rows[0]["value"]),
                    desc = ValueManager.GetString(data.Rows[0]["description"]),
                    state = ValueManager.GetString(data.Rows[0]["state"])
                };
            }
            return result;
        }
        public static List<SystemPlatformEntity> GetList(DictionaryRequest request)
        {
            string selectSQL = "";
            if (request.IsRecursion)
                selectSQL = string.Format(@"
                    select system_platform.*, system.name as system from system_platform left join system on system_platform.system_id=system.id from system_platform where system_platform.system_id = {0} or system_platform.system_id in (select id from system where parent_id={0}) 
                ", request.ID);
            else
                selectSQL = string.Format(@"
                    select system_platform.*, system.name as system from system_platform left join system on system_platform.system_id=system.id where system_platform.system_id = {0} 
                ", request.ID);
            List<SystemPlatformEntity> result = new List<SystemPlatformEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(GetEntity(row));
                }
            }
            return result;
        }
        private static SystemPlatformEntity GetEntity(DataRow row)
        {
            var result = new SystemPlatformEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                systemid = ValueManager.GetInt(row["system_id"]),
                typename = ValueManager.GetString(row["name"]),
                value = ValueManager.GetString(row["value"]),
                type= ValueManager.GetString(row["type"]),
                desc = ValueManager.GetString(row["description"]),
                state = ValueManager.GetString(row["state"])
            };
            if(row.Table.Columns.Contains("system")) result.system=ValueManager.GetString(row["system"]);
            return result;
        }
        public static SystemPlatformEntity Save(SystemPlatformEntity entity){

            string updateSQL = @"
                update system_platform set system_id=@sysid,name=@name, value=@value,type=@type, description=@description,state=@state where id=@id
            ";
            string insertSQL = @"
                insert into system_platform (system_id,name,state,value,description,type) values (@sysid,@name,@state,@value,@description,@type) returning id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("sysid", entity.systemid),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.typename)),
                    new DataParameter("value", ValueManager.GetValueOrDBNull(entity.value)),
                    new DataParameter("type", ValueManager.GetValueOrDBNull(entity.type)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.desc)),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state) ? "exist" : entity.state))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL,p));
                else
                    manager.ExecuteNonQuery(updateSQL,p);
            }
            return entity;

        }
        public static List<SystemPlatformEntity> Save(long sysid, List<SystemPlatformEntity> platformList)
        {
            string selectSQL = @"
                select * from system_platform where system_id=@id
            ";
            string deleteSQL = @"
                delete from system_platform where id=@id
            ";
            string updateSQL = @"
                update system_platform set value=@value,type=@type, description=@description,state=@state where id=@id
            ";
            string insertSQL = @"
                insert into system_platform (system_id,name,state,value,description,type) values (@sysid,@name,@state,@value,@description,@type) returning id
            ";
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("id", sysid));
                foreach (SystemPlatformEntity platform in platformList)
                {
                    DataRow[] rows = data.Select(string.Format("name ='{0}'", platform.typename));
                    if (rows.Length == 0)
                        platform.id = ValueManager.GetInt(manager.ExecuteScalar(insertSQL,
                            new DataParameter("sysid", sysid),
                            new DataParameter("name", ValueManager.GetValueOrDBNull(platform.typename)),
                            new DataParameter("value", ValueManager.GetValueOrDBNull(platform.value)),
                            new DataParameter("type", ValueManager.GetValueOrDBNull(platform.type)),
                            new DataParameter("description", ValueManager.GetValueOrDBNull(platform.desc)),
                            new DataParameter("state", (string.IsNullOrEmpty(platform.state) ? "exist" : platform.state))
                            ));
                    else
                    {
                        platform.id = ValueManager.GetInt(rows[0]["id"]);
                        manager.ExecuteNonQuery(updateSQL,
                            new DataParameter("id", platform.id),
                            new DataParameter("value", ValueManager.GetValueOrDBNull(platform.value)),
                            new DataParameter("type", ValueManager.GetValueOrDBNull(platform.type)),
                            new DataParameter("description", ValueManager.GetValueOrDBNull(platform.desc)),
                            new DataParameter("state", string.IsNullOrEmpty(platform.state) ? "exist" : platform.state)
                        );
                        data.Rows.Remove(rows[0]);
                    }
                }
                foreach (DataRow row in data.Rows)
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", ValueManager.GetInt(data.Rows[0]["id"])));
            }
            return platformList;
        }

        public static void Delete(long id)
        {
            string deleteSQL = @"
                DELETE FROM system_platform WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
    }
}
