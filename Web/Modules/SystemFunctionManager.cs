using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Text.Json;
using System.Threading.Tasks;
using DA;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemFunctionManager : BaseListManager
    {

        public SystemFunctionManager(FilterEntity filter) : base(filter)
        {
            filter.currentSort = string.IsNullOrEmpty(filter.currentSort) ? "Name" : filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("function", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["id"]))
                    query.Parameters.Add("id", ValueManager.GetInt(Filter["id"]), "system_function.system_id = @id");
                if (!string.IsNullOrEmpty(Filter["fid"]))
                    query.Parameters.Add("fid", ValueManager.GetInt(Filter["fid"]), "system_function.function_id = @fid");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("system", string.Concat("%", Filter["tbSystemName"], "%"), "system.Name ilike @system");
                if (!string.IsNullOrEmpty(Filter["tbFunctionName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbFunctionName"], "%"), "function.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbFunctionMethod"]))
                    query.Parameters.Add("method", string.Concat("%", Filter["tbFunctionMethod"], "%"), "system_function.method ilike @method");

                return (query);
            }
        }
        public static SystemFunctionEntity Get(string id)
        {
            string selectSQL = string.Format(@"
                select 
                    system.id as systemid, 
                    system.name as system, 
                    function.id as functionid, 
                    function.name as function, 
                    function.description, 
                    system_function.method,
                    system_function.state
                from 
                    system_function 
                    inner join system on system_function.system_id=system.id 
                    inner join function on system_function.function_id=function.id 
                where 
                    system_function.id={0}
            ", id);
            SystemFunctionEntity result = new SystemFunctionEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                result = new SystemFunctionEntity()
                {
                    id = id,
                    systemid = ValueManager.GetString(data.Rows[0]["systemid"]),
                    system = ValueManager.GetString(data.Rows[0]["system"]),
                    functionid = ValueManager.GetString(data.Rows[0]["functionid"]),
                    function = ValueManager.GetString(data.Rows[0]["function"]),
                    method = ValueManager.GetString(data.Rows[0]["method"]),
                    functiondescription = ValueManager.GetString(data.Rows[0]["description"]),
                    state = ValueManager.GetString(data.Rows[0]["state"])
                };
            }
            return result;
        }
        public static async Task<List<SystemFunctionEntity>> GetA(string sysid, string term, int length)
        {
            var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };

            var req = new
            {
                ClassPairs = new object[]
                {
                    new
                    {
                        StartClassUUID = SystemClassUUID, // класс АС
                        EndClassUUID = FunctionClassUUID
                    }
                },
                FullChain = false,
                ModelUUID = ModelUUID, // Основная модель
                SelfRelationReverseDirection = true,
                StartObjectsUUIDs = new string[]{ sysid },
                withRelations = false
            };
            List<SystemFunctionEntity> result = new List<SystemFunctionEntity>();

            string resstr = await Post("api/objects/get-chain", req, headers);
            var res = JsonSerializer.Deserialize<resultEntityList>(resstr);

            for (int i = 0; i < res.data.Length && result.Count <= (length == 0?100:length); i++)
            {
                if(string.IsNullOrEmpty(term) || res.data[i].name.IndexOf(term)>-1){
                    result.Add(new SystemFunctionEntity()
                    {
                        functionid = res.data[i].uuid,
                        function = res.data[i].name,
                        functiondescription = res.data[i].description
                    });
                }
            }
            /*
            string selectSQL = string.Format(@"
                select 
                    system_function.id,
                    system.id as systemid, 
                    system.name as system, 
                    function.id as functionid, 
                    function.name as function, 
                    function.description, 
                    system_function.method,
                    system_function.state
                from 
                    system_function 
                    inner join system on system_function.system_id=system.id 
                    inner join function on system_function.function_id=function.id 
                where 
                    system_function.system_id={0}
                    and function.name ilike '%{1}%'
                        limit {2}
                ", sysid, term, length);

            DataTable data = null;
            List<SystemFunctionEntity> result = new List<SystemFunctionEntity>();
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL);
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new SystemFunctionEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        systemid = ValueManager.GetInt(row["systemid"]),
                        system = ValueManager.GetString(row["system"]),
                        functionid = ValueManager.GetInt(row["functionid"]),
                        function = ValueManager.GetString(row["function"]),
                        method = ValueManager.GetString(row["method"]),
                        functiondescription = ValueManager.GetString(row["description"]),
                        state = ValueManager.GetString(row["state"])
                    });
            }*/
            return result;

        }
        /*
        public static SystemFunctionEntity Save(SystemFunctionEntity entity)
        {

            FunctionEntity fn = FunctionManager.Get(entity.functionid);
            fn.name = entity.function;
            fn.description = entity.functiondescription;
            fn = FunctionManager.Save(fn);

            string insertSQL = @"insert into system_function 
                    (system_id,function_id,method,state)
                    values (@system_id,@function_id,@method,@state)
                    returning id
            ";
            string updateSQL = @"update system_function set 
                            system_id=@system_id,
                            function_id=@function_id,
                            method=@method,
                            state=@state
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("system_id", entity.systemid),
                    new DataParameter("function_id", fn.id),
                    new DataParameter("method", ValueManager.GetValueOrDBNull(entity.method)),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state))
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
                DELETE FROM system_function WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
*/
    }
}
