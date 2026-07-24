using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemManager : BaseKSManager
    {
        public static async Task<SystemEntity> Get(string id)
        {
            SystemEntity result = new SystemEntity();
            if(string.IsNullOrEmpty(id))
                return result;

            dataEntity res = await GetObjectsDataById(
                new objectRequest()
                {
                    ClassUUID = SystemClassUUID, 
                    ID = id
                }
            );
            if (res!=null)
                result = await GetEntity(res);

            /*var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            var req = new
            {
                ModelUUID, // Основная модель
                ClassUUID = SystemClassUUID, // класс АС
                UUIDs = new string[]{ id },
                withRelations = false
            };
            SystemEntity result = new SystemEntity();

            string resstr = await Post("api/objects/get", req, headers);
            var res = JsonSerializer.Deserialize<resultEntityList>(resstr);
            if (res.data.Length > 0)
            {
                result = await GetEntity(res.data[0]);
            }*/
        /*
            string selectSQL = string.Format(@"
                select system.*, parent.name as parent, target.name as target from 
                    system 
                    left join system parent on system.parent_id=parent.id
                    left join system target on system.target_id=target.id
                where system.id = {0}
            ", id);
            SystemEntity result = new SystemEntity();
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

        public static async Task<List<SystemEntity>> Get(DictionaryRequest request)
        {
            List<SystemEntity> result = new List<SystemEntity>();
            var res = await GetObjectsDataByName(
                new objectRequest()
                {
                    ClassUUID = SystemClassUUID, 
                    Name = request.Term
                }
            );
            if(res!=null){
                for (int i = 0; i < res.Length && i < (request.Length == 0?100:request.Length); i++)
                {
                    result.Add(await GetEntity(res[i]));
                }
            }
/*
            var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            var req = new
            {
                ModelUUID, // Основная модель
                ClassUUID = SystemClassUUID, // класс АС
                Name = request.Term,
                withRelations = false
            };
            List<SystemEntity> result = new List<SystemEntity>();

            string resstr = await Post("api/objects/get", req, headers);
            var res = JsonSerializer.Deserialize<resultEntityList>(resstr);


            for (int i = 0; i < res.data.Length && i < (request.Length == 0?100:request.Length); i++)
            {
                result.Add(await GetEntity(res.data[i]));
            }*/

            /*
            var req = new
            {
                datasetsUuids = new string[] {
                    "01f0fcf8-552f-e941-93fa-00b15c0c4000" 
                },
                indicatorsUuids = new string[] {
                    "01f0fcf8-550d-4f23-93fa-00b15c0c4000"
                },
                Filters = new object[]
                {
                    new {
                        IndicatorUuid = "01f0fcf8-550d-4f23-93fa-00b15c0c4000",
                        Indicatorvalue = new {
                            data = request.Term,
                            type = "string"
                        },
                        compareOperation = "==",
                    }
                },
                withEntityName = true,
                page = 0,
                perPage = 1
            };                
            List<SystemEntity> result = new List<SystemEntity>();

            string resstr = await Post("api/data/get-list-min", req, headers);
            resstr = resstr.Replace("01f0fcf8-550d-4f23-93fa-00b15c0c4000","indicatorsUuids");
            resultSystemList res = JsonSerializer.Deserialize<resultSystemList>(resstr);

            foreach(var data in res.data)
            {
                foreach(var d in data.d.indicatorsUuids){
                    result.Add(new SystemEntity()
                    {
                        name = d.v.data
                    });
                }
            }
            */
            /*public static JsonSerializerOptions CyrilicOptions = new JsonSerializerOptions
            {
                    Converters = { new CustomConverter() }
            };        */


            /*string selectSQL = "";
            if (!string.IsNullOrEmpty(request.Name))
            {
                selectSQL = string.Format(@"
                    select * from system where name ilike '{0}' limit {1}
                ", request.Name, request.Length);
            }
            else
            {
                selectSQL = string.Format(@"
                    select * from system where name ilike '%{0}%' limit {1}
                ", request.Term, request.Length);
            }
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                    result.Add(GetEntity(row));
            }*/
            return result;
        }
        private static async Task<SystemEntity> GetEntity(dataEntity entity)
        {
            SystemEntity result = new SystemEntity()
            {
                id = entity.uuid,
                name = entity.name,
                description = entity.description,
                alias = entity.shortName,
            };
            return result;
        }
        /*
        private static SystemEntity GetEntity(DataRow row)
        {
            SystemEntity result = new SystemEntity()
            {
                id = ValueManager.GetString(row["id"]),
                parentid = ValueManager.GetInt(row["parent_id"]),
                name = ValueManager.GetString(row["name"]),
                type = ValueManager.GetString(row["type"]),
                description = ValueManager.GetString(row["description"]),
                state = ValueManager.GetString(row["state"]),
                targetid = ValueManager.GetInt(row["target_id"]),
                startDate = ValueManager.GetDateTime(row["start_date"]),
                endDate = ValueManager.GetDateTime(row["end_date"]),
                vendor = ValueManager.GetString(row["vendor"]),
                comment = ValueManager.GetString(row["comment"]),
                techdebt = ValueManager.GetString(row["techdebt"]),
                alias = ValueManager.GetString(row["alias"])
            };
            DataTable data = row.Table;
            result.parent = data.Columns.Contains("parent") ? ValueManager.GetString(row["parent"]) : string.Empty;
            result.target = data.Columns.Contains("target") ? ValueManager.GetString(row["target"]) : string.Empty;
            return result;
        }
        public static SystemEntity Save(SystemEntity entity)
        {
            string insertSQL = @"insert into system 
                    (name,type,description,state,parent_id, target_id,start_date,end_date,vendor,alias,comment,techdebt)
                    values (@name,@type,@description,@state,@parentid,@targetid,@startdate,@enddate,@vendor,@alias,@comment,@techdebt)
                    returning id
            ";
            string updateSQL = @"update system set 
                            name=@name,
                            type=@type,
                            description=@description,
                            parent_id=@parentid,
                            target_id=@targetid,
                            start_date=@startdate,
                            end_date=@enddate,
                            state=@state,
                            vendor=@vendor,
                            alias=@alias,
                            comment=@comment,
                            techdebt=@techdebt
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("parentid", entity.parentid),
                    new DataParameter("targetid", entity.targetid),
                    new DataParameter("startdate", entity.startDate),
                    new DataParameter("enddate", entity.endDate),
                    new DataParameter("name", entity.name),
                    new DataParameter("type", ValueManager.GetValueOrDBNull(entity.type)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state)),
                    new DataParameter("comment", ValueManager.GetValueOrDBNull(entity.comment)),
                    new DataParameter("alias", ValueManager.GetValueOrDBNull(entity.alias)),
                    new DataParameter("techdebt", ValueManager.GetValueOrDBNull(entity.techdebt)),
                    new DataParameter("vendor", ValueManager.GetValueOrDBNull(entity.vendor))
                };
                if (entity.id == "")
                    entity.id = ValueManager.GetString(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
                if (entity.functions != null)
                {
                    for (int i = 0; i < entity.functions.Count; i++)
                    {
                        entity.functions[i].refid = entity.id;
                        entity.functions[i] = FunctionManager.Save(entity.functions[i]);
                    }
                }
                if (entity.data != null)
                {
                    for (int i = 0; i < entity.data.Count; i++)
                    {
                        entity.data[i].refid = entity.id;
                        entity.data[i] = ADataManager.Save(entity.data[i]);
                    }
                }
                if (entity.components != null && entity.components.Count > 0)
                    entity.components = SystemPlatformManager.Save(entity.id, entity.components);
                if (entity.metrics != null)
                    SystemMetricManager.Save(entity.id, entity.metrics);
            }
            return entity;
        }

        public static void Delete(long id)
        {
            string checkSQL = @"
                select system_data.id from system_data inner join data on system_data.data_id=data.id WHERE system_data.system_id = @id
                union
                select id from interface WHERE consumer_id = @id or supply_id=@id
                union
                select system_function.id from system_function inner join function on system_function.function_id=function.id WHERE system_function.system_id = @id
                union
                select system_netobject.id from system_netobject inner join netobject on system_netobject.netobject_id=netobject.id WHERE system_netobject.system_id = @id
                union
                select system_file.id from system_file WHERE system_file.system_id = @id
                limit 1
            ";
            using (DataManager manager = new DataManager())
            {
                if (manager.ExecuteScalar(checkSQL, new DataParameter("id", id)) != null)
                    throw new Exception("Невозможно удалить систему - существует данные/ функции/ интерфейсы/ сервера/ файлы");
                else
                {
                    FileManager.DeleteDir("system", id.ToString());
                    manager.ExecuteNonQuery("DELETE FROM system_platform WHERE system_id = @id", new DataParameter("id", id));
                    manager.ExecuteNonQuery("DELETE FROM system_metric WHERE system_id = @id", new DataParameter("id", id));
                    manager.ExecuteNonQuery("DELETE FROM System WHERE ID = @id", new DataParameter("id", id));
                }
            }
        }
*/
    }
}
