using System;
using System.Collections.Generic;
using System.Data;
using DA;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemServerManager : BaseListManager{

        public SystemServerManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("server", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["id"]))
                    query.Parameters.Add("id", ValueManager.GetInt(Filter["id"]), "system_netobject.system_id = @id");
                if (!string.IsNullOrEmpty(Filter["sid"]))
                    query.Parameters.Add("sid", ValueManager.GetInt(Filter["sid"]), "system_netobject.netobject_id = @sid");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("system", string.Concat("%", Filter["tbSystemName"], "%"), "system.Name ilike @system");
                if (!string.IsNullOrEmpty(Filter["tbServerName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbServerName"], "%"), "netobject.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbServerIP"]))
                    query.Parameters.Add("ip", string.Concat("%", Filter["tbServerIP"], "%"), "netobject.ip ilike @ip");

                return (query);
            }
        }
        public static SystemServerEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                SELECT 
                    System_netobject.ID,
                    System_netobject.system_id,
                    System_netobject.netobject_id,
                    system.name as system,
                    netobject.Name,
                    netobject.IP,
                    netobject.Description,
                    System_netobject.state
                FROM 
                    system_netobject
                    inner join netobject on system_netobject.netobject_id=netobject.id
                    inner join system on system_netobject.system_id=system.id
                where 
                    system_netobject.id={0}
            ", id);
            SystemServerEntity result = new SystemServerEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count>0)
            {
                result = new SystemServerEntity() { 
                    id=id,
                    systemid = ValueManager.GetInt(data.Rows[0]["system_id"]),
                    system = ValueManager.GetString(data.Rows[0]["system"]),
                    serverid = ValueManager.GetInt(data.Rows[0]["netobject_id"]),
                    server = ValueManager.GetString(data.Rows[0]["Name"]),
                    ip = ValueManager.GetString(data.Rows[0]["ip"]),
                    serverdescription = ValueManager.GetString(data.Rows[0]["description"]),
                    state = ValueManager.GetString(data.Rows[0]["state"])
                };
            }
            return result;
        }
        public static List<SystemServerEntity> GetA(long sysid, string term, int length){
            if (length == 0) length = 100;
            string selectSQL = string.Format(@"
                SELECT 
                    System_netobject.ID,
                    System_netobject.system_id,
                    System_netobject.netobject_id,
                    system.name as system,
                    netobject.Name,
                    netobject.IP,
                    netobject.Description,
                    system_netobject.state
                FROM 
                    system_netobject
                    inner join netobject on system_netobject.netobject_id=netobject.id
                    inner join system on system_netobject.system_id=system.id
                where 
                    system_netobject.system_id={0}
                    and netobject.name ilike '%{1}%'
                        limit {2}
                ",sysid, term, length);

            DataTable data = null;
            List<SystemServerEntity> result = new List<SystemServerEntity>();
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL);
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new SystemServerEntity()
                    {
                        id=ValueManager.GetInt(row["id"]),
                        systemid = ValueManager.GetInt(row["system_id"]),
                        system = ValueManager.GetString(row["system"]),
                        serverid = ValueManager.GetInt(row["netobject_id"]),
                        server = ValueManager.GetString(row["Name"]),
                        ip = ValueManager.GetString(row["ip"]),
                        serverdescription = ValueManager.GetString(row["description"]),
                        state = ValueManager.GetString(row["state"])
                    });
            }
            return result;

        }

        public static SystemServerEntity Save(SystemServerEntity entity){

            NetobjectEntity srv = NetobjectManager.Get(entity.serverid);
            srv.name=entity.server;
            srv.description=entity.serverdescription;
            srv.ip=entity.ip;
            srv.typeid=1;//server
            srv = NetobjectManager.Save(srv);

            string insertSQL = @"insert into system_netobject 
                    (system_id,netobject_id,state)
                    values (@system_id,@netobject_id,@state)
                    returning id
            ";
            string updateSQL = @"update system_netobject set 
                            system_id=@system_id,
                            netobject_id=@netobject_id,
                            state=@state
                where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("system_id", entity.systemid),
                    new DataParameter("netobject_id", srv.id),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state))
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
                DELETE FROM system_netobject WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
        
    }
}
