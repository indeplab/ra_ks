using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;
using System.Threading.Tasks;
using Web.Models;

namespace Web.Modules
{
    public class ADataManager: BaseKSManager
    {
        public static async Task<DataEntity> Get(string id)
        {
            DataEntity result = new DataEntity();
            if(string.IsNullOrEmpty(id))
                return result;

            dataEntity res = await GetObjectsDataById(
                new objectRequest()
                {
                    ClassUUID = EntityClassUUID, 
                    ID = id
                }
            );
            if (res!=null)
                result = GetEntity(res);
                
            /*var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            var req = new
            {
                ModelUUID = ModelUUID, // Основная модель
                ClassUUID = EntityClassUUID, // класс АС
                UUIDs = new string[]{ id },
                withRelations = false
            };

            string resstr = await Post("api/objects/get", req, headers);
            var res = JsonSerializer.Deserialize<resultEntityList>(resstr);
            if (res.data.Length > 0)
            {
                result = GetEntity(res.data[0]);
            }*/
            /*string selectSQL = string.Format(@"
                select data.*,'' as flowtype from data where id = {0}
            ", id);
            DataEntity result = new DataEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                var row = data.Rows[0];
                result = GetEntity(row);
            }*/
            return result;
        }
        public static async Task<List<DataEntity>> Get(DictionaryRequest2 request)
        {
            List<DataEntity> result = new List<DataEntity>();
            dataEntity[] res = null;

            if (!string.IsNullOrEmpty(request.Name))
                res = await GetObjectsDataByName(
                    new objectRequest()
                    {
                        ClassUUID = EntityClassUUID, 
                        Name = request.Name
                    }
                );
            else if (!string.IsNullOrEmpty(request.Term))
                res = await GetObjectsDataByName(
                    new objectRequest()
                    {
                        ClassUUID = EntityClassUUID, 
                        Name = request.Term
                    }
                );
            else
            {
                if (!string.IsNullOrEmpty(request.ID))
                {
                    res = await GetObjectsChainData(
                        new chainRequest()
                        {
                            ClassUUID = SystemEntityClassUUID, 
                            ID = request.ID,
                            StartClassUUID = SystemClassUUID,
                            EndClassUUID = EntityClassUUID
                        }
                    );
                }
            }

            if(res!=null){
                for (int i = 0; i < res.Length && i < (request.Length == 0?100:request.Length); i++)
                {
                    result.Add(GetEntity(res[i]));
                }
            }

            /*var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            object req = null;
            var withRelations = false;

            if (!string.IsNullOrEmpty(request.Name))
                    req = new
                    {
                        ModelUUID, // Основная модель
                        ClassUUID = EntityClassUUID, // класс АС
                        Name = request.Name,
                        withRelations
                    };                
            else if (!string.IsNullOrEmpty(request.Term))
                    req = new
                    {
                        ModelUUID, // Основная модель
                        ClassUUID = EntityClassUUID, // класс АС
                        Name = request.Term,
                        withRelations
                    };
            else
            {
                if(!string.IsNullOrEmpty(request.ID)){
                    withRelations = true;
                    req = new
                    {
                        ModelUUID, // Основная модель
                        ClassUUID = SystemClassUUID, // класс АС
                        UUIDs = new string[]{ request.ID },
                        withRelations
                    };
                }
            }

            List<DataEntity> result = new List<DataEntity>();

            if(req!=null){

                string resstr = await Post("api/objects/get", req, headers);
                var res = JsonSerializer.Deserialize<resultEntityList>(resstr);


                if(withRelations && res.data.Length > 0)
                {
                    if (res.data[0].relations != null)
                    {
                        for (int i = 0; i < res.data[0].relations.Length && i < (request.Length == 0?100:request.Length); i++)
                        {
                            if(res.data[0].relations[i].classUuid==SystemEntityClassUUID)
                                result.Add(GetEntity(res.data[0].relations[i]));
                        }
                    }
                }
                else{
                    for (int i = 0; i < res.data.Length && i < (request.Length == 0?100:request.Length); i++)
                    {
                        result.Add(GetEntity(res.data[i]));
                    }
                }
            }*/
            /*string selectSQL = string.Empty;
            if (!string.IsNullOrEmpty(request.Name))
                selectSQL = string.Format(@"
                    select *, 'new' as state,'' as flowtype from data where name ilike '{0}' limit {1}
                    ", request.Name, request.Length);
            else if (!string.IsNullOrEmpty(request.Term))
                selectSQL = string.Format(@"
                    select *, 'new' as state,'' as flowtype from data where name ilike '%{0}%' limit {1}
                ", request.Term, request.Length);
            else 
                selectSQL = string.Format(@"
                    select data.*,system_data.state, system_data.flowtype from system_data inner join data on system_data.data_id=data.id where system_data.system_id = {0} 
                ", request.ID);

            List<DataEntity> result = new List<DataEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    var fn = GetEntity(row);
                    fn.state = ValueManager.GetString(row["state"]);
                    fn.refid = request.ID;
                    result.Add(fn);
                }
            }*/
            return result;
        }
        private static DataEntity GetEntity(dataEntity entity)
        {
            DataEntity result = new DataEntity()
            {
                id = entity.uuid,
                name = entity.name,
                description = entity.description
            };
            return result;
        }
        /*private static DataEntity GetEntity(DataRow row)
        {
            return new DataEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                parentid = ValueManager.GetInt(row["parent_id"]),
                name = ValueManager.GetString(row["name"]),
                flowtype = ValueManager.GetString(row["flowtype"]),
                description = ValueManager.GetString(row["description"])
            };
        }
        public static DataEntity Save(DataEntity entity)
        {
            string selectNameSQL = @"select id from data where name=@name";
            string insertDataSQL = @"insert into data (name,description) values(@name,@description) returning id";
            string updateDataSQL = @"update data set name=@name, description=@description where id=@id";

            string selectSQL = @"select id from system_data where data_id=@fid and system_id=@sid";
            string insertSQL = @"insert into system_data (system_id,data_id,state,flowtype) values (@sid,@fid,@state,@flowtype)";
            string updateSQL = @"update system_data set state=@state, flowtype=@flowtype where data_id=@fid and system_id=@sid";

            using (DataManager manager = new DataManager())
            {
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(selectNameSQL, new DataParameter("name", entity.name)));

                DataParameter[] f= new DataParameter[]{
                    new DataParameter("id", entity.id),
                    new DataParameter("name", entity.name),
                    new DataParameter("description", entity.description)
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertDataSQL, f));
                else
                    manager.ExecuteNonQuery(updateDataSQL, f);

                if(entity.refid!=0){
                    DataParameter[] p = new DataParameter[]
                    {
                        new DataParameter("sid", entity.refid),
                        new DataParameter("fid", entity.id),
                        new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state)),
                        new DataParameter("flowtype", ValueManager.GetValueOrDBNull(entity.flowtype))
                    };
                    long id = ValueManager.GetLong(manager.ExecuteScalar(selectSQL, p));
                    if (id == 0)
                        ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                    else
                        manager.ExecuteNonQuery(updateSQL, p);
                }
            }
            return entity;
        }
        public static void Delete(long id)
        {
            string checkSQL = @"
                select system_data.id from system_data inner join system on system_data.system_id=system.id WHERE data_id = @id
                union
                select id from interface_data WHERE data_id = @id
                limit 1
            ";
            string deleteSQL = @"
                DELETE FROM data WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                if (manager.ExecuteScalar(checkSQL, new DataParameter("id", id)) != null)
                    throw new Exception("Невозможно удалить сущность - существует в системах/ интерфейсах");
                else
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
*/
   }
}
