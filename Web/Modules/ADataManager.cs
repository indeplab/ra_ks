using DA;
using System;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class ADataManager
    {
        public static DataEntity Get(long id)
        {
            string selectSQL = string.Format(@"
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
            }
            return result;
        }
        public static List<DictionaryEntity> GetA(string type, string term, int length){
            if (length == 0) length = 100;

            string selectSQL = string.Empty;
            switch (ValueManager.GetString(type).ToLower())
            {
                case "id":
                    selectSQL = string.Format(@"
                            select 
                                *
                            from 
                                data
                            where
                                id = {0}
                        ", ValueManager.GetInt(term));
                    break;
                default:
                    selectSQL = string.Format(@"
                        select 
                            *
                        from 
                            data
                        where
                            Name ilike '%{0}%'
                        limit {1}
                    ", term, length);
                    break;
            }

            DataTable data = null;
            List<DictionaryEntity> result = new List<DictionaryEntity>();
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL);
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

        public static List<DataEntity> Get(DictionaryRequest request)
        {
            string selectSQL = string.Empty;
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
            }
            return result;
        }
        private static DataEntity GetEntity(DataRow row)
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

   }
}
