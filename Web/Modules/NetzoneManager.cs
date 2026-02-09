using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class NetzoneManager
    {
        public static NetzoneEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select * from netzone where id = {0}
            ", id);
            NetzoneEntity result = new NetzoneEntity();
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
        public static List<DictionaryEntity> GetTypeList(long id)
        {
            string selectSQL = string.Format(@"
                select * from netzone_type
            ");
            List<DictionaryEntity> result = new List<DictionaryEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new DictionaryEntity(){
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                    });
            }
            return result;
        }

        public static List<DictionaryEntity> GetA(int typeid, string term, int length)
        {
            string selectSQL = string.Format(@"
                    select * from netzone where name ilike '%{0}%' and netzone_type_id={2} limit {1}
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
                        description = ValueManager.GetString(row["description"])
                    });
            }
            return result;
        }
        public static List<NetzoneEntity> Get(DictionaryRequest request)
        {
            string selectSQL = "";
            if (!string.IsNullOrEmpty(request.Name))
            {
                selectSQL = string.Format(@"
                    select * from netzone where name ilike '{0}' and netzone_type_id={2} limit {1}
                ", request.Name, request.Length, request.ID2);
            }
            else
            {
                selectSQL = string.Format(@"
                    select * from netzone where name ilike '%{0}%' and netzone_type_id={2} limit {1}
                ", request.Term, request.Length, request.ID2);
            }
            List<NetzoneEntity> result = new List<NetzoneEntity>();
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
        private static NetzoneEntity GetEntity(DataRow row)
        {
            return new NetzoneEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                name = ValueManager.GetString(row["name"]),
                color = ValueManager.GetString(row["color"]),
                typeid = ValueManager.GetInt(row["netzone_type_id"]),
                description = ValueManager.GetString(row["description"])
            };
        }
        public static NetzoneEntity Save(NetzoneEntity entity)
        {
            string insertSQL = @"insert into netzone 
                    (name,color,description,netzone_type_id)
                    values (@name,@color,@description,@netzone_type_id)
                    returning id
            ";
            string updateSQL = @"update netzone set 
                            name=@name,
                            color=@color,
                            description=@description,
                            netzone_type_id=@netzone_type_id
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {

                DataParameter[] p = new DataParameter[] {
                            new DataParameter("id", entity.id),
                            new DataParameter("name", entity.name),
                            new DataParameter("color", ValueManager.GetValueOrDBNull(entity.color)),
                            new DataParameter("netzone_type_id", entity.typeid),
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
                DELETE FROM netzone WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
    }
}
