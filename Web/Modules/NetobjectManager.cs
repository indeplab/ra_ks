using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class NetobjectManager
    {
        public static NetobjectEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    netobject.*,
                    z.name as zone,
                    dc.name as datacenter
                from 
                    netobject 
                    left join netzone z on netobject.netzone_id = z.id
                    left join netzone dc on netobject.netdc_id = dc.id
                where 
                    netobject.id = {0}
            ", id);
            NetobjectEntity result = new NetobjectEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                var row = data.Rows[0];
                result = GetEntity(row);
            }
            return result;
        }
        private static T getIfExist<T>(DataRow row, string columnName)
        {
            if (row.Table.Columns.Contains(columnName))
                return ValueManager.ChangeType<T>(row[columnName]);
            else
                return default(T);
        }
        public static List<object> GetTypeList()
        {
            string selectSQL = string.Format(@"
                select * from netobject_type order by id
            ");
            List<object> result = new List<object>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new {
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        has_app = ValueManager.GetBoolean(row["has_app"]),
                        image_src = ValueManager.GetString(row["image"])
                    });
            }
            return result;
        }

        public static List<DictionaryEntity> GetA(int typeid, string term, int length)
        {
            string selectSQL = string.Format(@"
                    select * from netobject where name ilike '%{0}%' and netobject_type_id={2} limit {1}
                ", term, length, typeid);
            List<DictionaryEntity> result = new List<DictionaryEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new DictionaryEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        value = ValueManager.GetString(row["name"]),
                        name = ValueManager.GetString(row["name"]),
                        description = ValueManager.GetString(row["description"]),
                        alias = ValueManager.GetString(row["ip"])
                    });
            }
            return result;
        }
        public static List<NetobjectEntity> Get(DictionaryRequest request)
        {
            string selectSQL = "";
            if (!string.IsNullOrEmpty(request.Name))
            {
                selectSQL = string.Format(@"
                    select * from netobject where name ilike '{0}' and netobject_type_id={2} limit {1}
                ", request.Name, request.Length, request.ID2);
            }
            else
            {
                selectSQL = string.Format(@"
                    select * from netobject where name ilike '%{0}%' and netobject_type_id={2} limit {1}
                ", request.Term, request.Length, request.ID2);
            }
            List<NetobjectEntity> result = new List<NetobjectEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(GetEntity(row));
            }
            return result;
        }
        private static NetobjectEntity GetEntity(DataRow row)
        {

            var net = new NetobjectEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                name = ValueManager.GetString(row["name"]),
                ip = ValueManager.GetString(row["ip"]),
                netdcid=ValueManager.GetInt(row["netdc_id"]),
                netzoneid=ValueManager.GetInt(row["netzone_id"]),
                typeid = ValueManager.GetInt(row["netobject_type_id"]),
                description = ValueManager.GetString(row["description"])
            };
            net.zone = getIfExist<string>(row, "zone");
            net.datacenter = getIfExist<string>(row, "datacenter");
            return net;
        }
        public static NetobjectEntity Save(NetobjectEntity entity)
        {
            string insertSQL = @"insert into netobject 
                    (name,ip,description,netobject_type_id,netzone_id,netdc_id)
                    values (@name,@ip,@description,@netobject_type_id,@netzone_id,@netdc_id)
                    returning id
            ";
            string updateSQL = @"update netobject set 
                            name=@name,
                            ip=@ip,
                            netzone_id=@netzone_id,
                            netdc_id=@netdc_id,
                            description=@description,
                            netobject_type_id=@netobject_type_id
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {

                DataParameter[] p = new DataParameter[] {
                            new DataParameter("id", entity.id),
                            new DataParameter("name", entity.name),
                            new DataParameter("ip", ValueManager.GetValueOrDBNull(entity.ip)),
                            new DataParameter("netobject_type_id", entity.typeid),
                            new DataParameter("netzone_id", entity.netzoneid),
                            new DataParameter("netdc_id", entity.netdcid),
                            new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
            }
            return entity;
        }
    
        public static void Delete(long id)
        {
            string deleteSQL = @"
                DELETE FROM netobject WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
    }
}
