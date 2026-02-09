using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using Web.Models;

namespace Web.Modules
{
    public class FunctionManager
    {
        public static FunctionEntity Get(long id)
        {
            string selectSQL = string.Format(@"
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
            }
            return result;
        }
        public static List<object> GetA(string type, string term, int length)
        {
            if (length == 0) length = 100;

            string selectSQL = string.Empty;
            switch (ValueManager.GetString(type).ToLower())
            {
                case "id":
                    selectSQL = string.Format(@"
                            select 
                                function.*,parent.name as parent  
                            from 
                                function
                                left join function parent on function.parent_id=parent.id
                            where
                                function.id = {0}
                        ", ValueManager.GetInt(term));
                    break;
                default:
                    selectSQL = string.Format(@"
                        select 
                            function.*,parent.name as parent 
                        from 
                            function
                            left join function parent on function.parent_id=parent.id
                        where
                            function.Name ilike '%{0}%'
                        limit {1}
                    ", term, length);
                    break;
            }

            DataTable data = null;
            List<object> result = new();
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL);
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new
                    {
                        id = ValueManager.GetInt(row["id"]),
                        value = ValueManager.GetString(row["name"]),
                        name = ValueManager.GetString(row["name"]),
                        parent = ValueManager.GetString(row["parent"]),
                        parentid = ValueManager.GetString(row["parent_id"]),
                        description = ValueManager.GetString(row["description"])
                    });
            }
            return result;

        }

        public static List<FunctionEntity> Get(DictionaryRequest request)
        {
            string selectSQL = string.Empty;
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
            }
            return result;
        }
        private static FunctionEntity GetEntity(DataRow row)
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
        }
        public static void ChangeParent(FunctionEntity[] children)
        {
            using (DataManager manager = new DataManager())
            {
                if (children != null && children.Length > 0)
                {
                    /*StringBuilder updateDataSQL = new StringBuilder();
                    foreach (var d in children)
                    {
                        updateDataSQL.AppendFormat("update function set parent_id={1} where id={0}", id, d.id);
                    }
                    manager.ExecuteNonQuery(updateDataSQL.ToString());*/
                    foreach (var d in children)
                        manager.ExecuteNonQuery(string.Format("update function set parent_id={0} where id={1}", d.parentid, d.id));
                }
            }
        }
        public static FunctionEntity Save(FunctionEntity entity)
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
    }
}
