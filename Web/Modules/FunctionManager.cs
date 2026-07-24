using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Web.Models;

namespace Web.Modules
{
    public class FunctionManager: BaseKSManager
    {
        public static async Task<FunctionEntity> Get(string id)
        {
            FunctionEntity result = new FunctionEntity();
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

            /*
            var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            var req = new
            {
                ModelUUID = ModelUUID, // Основная модель
                ClassUUID = FunctionClassUUID, // класс АС
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
                select function.*,parent.name as parent  
                from 
                    function 
                    left join function parent on function.parent_id=parent.id
                where function.id = {0}
            ", id);
            FunctionEntity result = new FunctionEntity();
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
        public static async Task<List<FunctionEntity>> Get(DictionaryRequest2 request)
        {
            List<FunctionEntity> result = new List<FunctionEntity>();
            dataEntity[] res = null;

            if (!string.IsNullOrEmpty(request.Name))
                res = await GetObjectsDataByName(
                    new objectRequest()
                    {
                        ClassUUID = FunctionClassUUID, 
                        Name = request.Name
                    }
                );
            else if (!string.IsNullOrEmpty(request.Term))
                res = await GetObjectsDataByName(
                    new objectRequest()
                    {
                        ClassUUID = FunctionClassUUID, 
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
                            ClassUUID = SystemFunctionClassUUID, 
                            ID = request.ID,
                            StartClassUUID = SystemClassUUID,
                            EndClassUUID = FunctionClassUUID
                        }
                    );
                }
            }
            /*var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            object req = null;
            string resstr = null;
            dataEntity[] res = null;
            List<FunctionEntity> result = new List<FunctionEntity>();

            if(!string.IsNullOrEmpty(request.Name) || !string.IsNullOrEmpty(request.Term))
            {                
                if (!string.IsNullOrEmpty(request.Name))
                        req = new
                        {
                            ModelUUID, // Основная модель
                            ClassUUID = FunctionClassUUID, // класс АС
                            Name = request.Name,
                            withRelations = false
                        };                
                else if (!string.IsNullOrEmpty(request.Term))
                        req = new
                        {
                            ModelUUID, // Основная модель
                            ClassUUID = FunctionClassUUID, // класс АС
                            Name = request.Term,
                            withRelations = false
                        };
                resstr = await Post("api/objects/get", req, headers);
                var d = JsonSerializer.Deserialize<resultEntityList>(resstr);
                if(d!=null)
                    res = d.data;
            }
            else
            {
                if(!string.IsNullOrEmpty(request.ID)){
                    req = new
                    {
                        ModelUUID, // Основная модель
                        SelfRelationReverseDirection = true,
                        ClassUUID = SystemFunctionClassUUID, 
                        StartObjectsUUIDs = new string[]{ request.ID },
                        withRelations = false,
                        FullChain = false,
                        ClassPairs = new object[]{
                            new {
                                StartClassUUID = SystemClassUUID, 
                                EndClassUUID = FunctionClassUUID 
                            }
                        }
                    };
                    resstr = await Post("api/objects/get-chain", req, headers);
                    resstr = resstr.Replace(request.ID, "StartObjectsUUIDs");
                    var chain = JsonSerializer.Deserialize<resultChainList>(resstr);
                    res = chain.data.StartObjectsUUIDs;
                }
            }*/
            if(res!=null){
                for (int i = 0; i < res.Length && i < (request.Length == 0?100:request.Length); i++)
                {
                    result.Add(GetEntity(res[i]));
                }
            }


            /*if(req!=null){
                string resstr = await Post("api/objects/get", req, headers);
                var res = JsonSerializer.Deserialize<resultEntityList>(resstr);


                if(withRelations && res.data.Length > 0)
                {
                    if (res.data[0].relations != null)
                    {
                        for (int i = 0; i < res.data[0].relations.Length && i < (request.Length == 0?100:request.Length); i++)
                        {
                            if(res.data[0].relations[i].classUuid==SystemFunctionClassUUID)
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
                    select *, 'new' as state from function where name ilike '{0}' limit {1}
                    ", request.Name, request.Length);
            else if (!string.IsNullOrEmpty(request.Term))
                selectSQL = string.Format(@"
                    select *, 'new' as state from function where name ilike '%{0}%' limit {1}
                ", request.Term, request.Length);
            else
                selectSQL = string.Format(@"
                    select function.*,system_function.state, system_function.method from system_function inner join function on system_function.function_id=function.id where system_function.system_id = {0} 
                ", request.ID);

            List<FunctionEntity> result = new List<FunctionEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                {
                    var fn = GetEntity(row);
                    fn.refid = request.ID;
                    result.Add(fn);
                }
            }*/
            return result;
        }
        private static FunctionEntity GetEntity(dataEntity entity)
        {
            FunctionEntity result = new FunctionEntity()
            {
                id = entity.uuid,
                name = entity.name,
                description = entity.description
            };
            return result;
        }
        /*private static FunctionEntity GetEntity(DataRow row)
        {
            FunctionEntity result = new FunctionEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                parentid = ValueManager.GetInt(row["parent_id"]),
                name = ValueManager.GetString(row["name"]),
                description = ValueManager.GetString(row["description"])
            };
            DataTable data = row.Table;
            result.parent = data.Columns.Contains("parent") ? ValueManager.GetString(row["parent"]) : string.Empty;
            result.method = data.Columns.Contains("method") ? ValueManager.GetString(row["method"]) : string.Empty;
            result.state = data.Columns.Contains("state") ? ValueManager.GetString(row["state"]) : string.Empty;
            return result;
        }*/
        /*public static FunctionEntity Save(FunctionEntity entity)
        {
            string selectNameSQL = @"select id from function where name=@name";
            string insertFunctionSQL = @"insert into function (name, parent_id, description) values(@name, @parentid, @description) returning id";
            string updateFunctionSQL = @"update function set name=@name, description=@description, parent_id=@parentid where id=@id";

            string selectSQL = @"select id from system_function where function_id=@fid and system_id=@sid";
            string insertSQL = @"insert into system_function (system_id,function_id,state,method) values (@sid,@fid,@state,@method)";
            string updateSQL = @"update system_function set state=@state, method=@method where function_id=@fid and system_id=@sid";

            using (DataManager manager = new DataManager())
            {
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(selectNameSQL, new DataParameter("name", entity.name)));

                DataParameter[] f = new DataParameter[]{
                    new DataParameter("id", entity.id),
                    new DataParameter("name", entity.name),
                    new DataParameter("parentid", entity.parentid),
                    new DataParameter("description", entity.description)
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertFunctionSQL, f));
                else
                    manager.ExecuteNonQuery(updateFunctionSQL, f);

                if (entity.refid != 0)
                {
                    DataParameter[] p = new DataParameter[]
                    {
                        new DataParameter("sid", entity.refid),
                        new DataParameter("fid", entity.id),
                        new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state)),
                        new DataParameter("method", ValueManager.GetValueOrDBNull(entity.method))
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
                select system_function.id from system_function inner join system on system_function.system_id=system.id WHERE function_id = @id
                union
                select id from interface WHERE consumer_function_id = @id or supply_function_id = @id 
                union
                select id from function WHERE parent_id = @id
                limit 1
            ";
            string deleteSQL = @"
                DELETE FROM function WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                if (manager.ExecuteScalar(checkSQL, new DataParameter("id", id)) != null)
                    throw new Exception("Невозможно удалить функцию - она существует в системах, интерфейсах или является разделом");
                else
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
        */
    }
}
