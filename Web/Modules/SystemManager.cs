using DA;
using DocumentFormat.OpenXml.Math;
using DocumentFormat.OpenXml.Office.PowerPoint.Y2021.M06.Main;
using Microsoft.AspNetCore.Authentication.Cookies;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemManager : BaseKSManager
    {
        public static SystemEntity Get(long id)
        {
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
            if (data != null && data.Rows.Count>0)
            {
                var row = data.Rows[0];
                result = GetEntity(row);
            }
            return result;
        }
        public static List<DictionaryEntity> GetParentListtBy(int id = 0, string type = "", int length = 20){
            var list = new FilterParameterCollection();
            var and = new QueryAndCollection();

            if (id!=0){
                and.Parameters.Add("system.id = @id");
                list.Add("id",id);
            }
            string value = "_none";
            if(string.IsNullOrEmpty(type)) type=string.Empty;
            switch(type.Trim()){
                case "Функциональный модуль":
                case "Подсистема":
                    value = "Автоматизированная система";
                break;
                case "Автоматизированная система":
                    value = "Платформа";
                break;
            }
            and.Parameters.Add("system.id in (select system_id from system_metric where name='Тип АС' and value=@sys_type)");
            list.Add("sys_type", value);

            string selectSQL = string.Format(@"
                select * from system {0} limit {1}
            ", and.ToStringWhere(), length);

            List<DictionaryEntity> result = new List<DictionaryEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL, list.ToDataParameterArray());
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows){
                    result.Add(new DictionaryEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        value = ValueManager.GetString(row["name"]),
                        name = ValueManager.GetString(row["name"]),
                        description = ValueManager.GetString(row["description"])
                    });

                }
            }
            return result;
        }
        public static List<SystemEntity> GetByInterface(int id)
        {
            string selectSQL = string.Format(@"
                select system.* from interface inner join system on interface.supply_id=system.id where interface.id={0}
            ", id);
            List<SystemEntity> result = new List<SystemEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new SystemEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        state = ValueManager.GetString(row["state"])
                    });
            }
            return result;
        }

        public class valueEntity
        {
            public string title {get;set;}
        }
        public class valueEntityList
        {
            public valueEntity[] values {get;set;} =  Array.Empty<valueEntity>();
        }
        public static async Task<List<SystemEntity>> Get(DictionaryRequest request)
        {
            var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid","01f0bfa2-2571-f229-a4ba-00b15c0c4000"}
            };

            var req = new
            {
                indicator="01f0fcf8-550d-4f23-93fa-00b15c0c4000",
                sessionUuid="974fb4fc-5287-4c0b-a3b1-fa71549ae3a9",
                pagination = new
                    {
                        page = 1,
                        perPage = request.Length
                    },
                term = request.Term
            };                
            List<SystemEntity> result = new List<SystemEntity>();
            valueEntityList res = await Post<valueEntityList>("/api/built-data-tables/get-filter-values", req, headers);
            foreach(valueEntity val in res.values)
            {
                result.Add(new SystemEntity()
                {
                   name = val.title 
                });
            }
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
        public static List<DictionaryEntity> GetA(string type, string term, int length){
            if (length == 0) length = 100;

            string selectSQL = string.Empty;
            string valueName = "name";
            switch (ValueManager.GetString(type).ToLower().Trim())
            {
                case "id":
                    selectSQL = string.Format(@"
                            select 
                                *
                            from 
                                system
                            where
                                id = {0}
                        ", ValueManager.GetInt(term));
                    break;
                case "alias":
                    valueName = "alias";
                    selectSQL = string.Format(@"
                        select 
                            *
                        from 
                            system
                        where
                            alias ilike '%{0}%'
                        limit {1}
                    ", term, length);
                    break;
                case "":
                    selectSQL = string.Format(@"
                        select 
                            *
                        from 
                            system
                        where
                            Name ilike '%{0}%'
                        limit {1}
                    ", term, length);
                    break;
                default:
                    selectSQL = string.Format(@"
                        select 
                            *
                        from 
                            system
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
                        value = ValueManager.GetString(row[valueName]),
                        name = ValueManager.GetString(row[valueName]),
                        alias = ValueManager.GetString(row["alias"]),
                        description = ValueManager.GetString(row["description"])
                    });
            }
            return result;

        }
        private static SystemEntity GetEntity(DataRow row)
        {
            SystemEntity result = new SystemEntity()
            {
                id = ValueManager.GetInt(row["id"]),
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
            result.parent=data.Columns.Contains("parent")?ValueManager.GetString(row["parent"]):string.Empty;
            result.target=data.Columns.Contains("target")?ValueManager.GetString(row["target"]):string.Empty;
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
            using (DataManager manager=new DataManager())
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
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL,p));
                else
                    manager.ExecuteNonQuery(updateSQL,p);
                if(entity.functions!=null){
                    for (int i = 0; i < entity.functions.Count; i++)
                    {
                        entity.functions[i].refid = entity.id;
                        entity.functions[i] = FunctionManager.Save(entity.functions[i]);
                    }
                }
                if(entity.data!=null){
                    for (int i = 0; i < entity.data.Count; i++)
                    {
                        entity.data[i].refid = entity.id;
                        entity.data[i] = ADataManager.Save(entity.data[i]);
                    }
                }
                if (entity.components!=null && entity.components.Count>0)
                    entity.components = SystemPlatformManager.Save(entity.id, entity.components);
                if (entity.metrics!=null)
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
                else{
                    FileManager.DeleteDir("system",id.ToString());
                    manager.ExecuteNonQuery("DELETE FROM system_platform WHERE system_id = @id", new DataParameter("id", id));
                    manager.ExecuteNonQuery("DELETE FROM system_metric WHERE system_id = @id", new DataParameter("id", id));
                    manager.ExecuteNonQuery("DELETE FROM System WHERE ID = @id", new DataParameter("id", id));
                }
            }
        }

    }
}
