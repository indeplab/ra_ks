using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class MapDataManager
    {
        public static MapDataEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select * from map_data where id = {0}
            ", id);
            MapDataEntity result = new MapDataEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count>0)
            {
                var row = data.Rows[0];
                result=new MapDataEntity(){
                    id= ValueManager.GetInt(row["id"]),
                    type = ValueManager.GetString(row["type"]),
                    name = ValueManager.GetString(row["name"]),
                    description = ValueManager.GetString(row["description"]),
                    data = ValueManager.GetString(row["data"])
                };
            }
            return result;
        }
        public static List<object> GetList()
        {
            string selectSQL = string.Format(@"
                select * from map_data
            ");
            List<object> result = new List<object>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                foreach(DataRow row in data.Rows)
                    result.Add(new
                    {
                        id= ValueManager.GetInt(row["id"]),
                        type = ValueManager.GetString(row["type"]),
                        name = ValueManager.GetString(row["name"]),
                        description = ValueManager.GetString(row["description"])
                    });
            }
            return result;
        }
        public static MapDataEntity Save(MapDataEntity entity)
        {
            string insertSQL = @"insert into map_Data 
                    (type,name,description,data)
                    values (@type,@name,@description,@data)
                    returning id
            ";
            string updateSQL = @"update map_data set 
                            type=@type,
                            name=@name,
                            description=@description,
                            data=@data
                where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("type", entity.type),
                    new DataParameter("name", entity.name),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("data", ValueManager.GetValueOrDBNull(entity.data))
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
                DELETE FROM map_data WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }

    }
}
