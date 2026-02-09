using DA;
using System.Collections.Generic;
using System.Data;
using System.Text;
using Web.Models;

namespace Web.Modules
{
    public class DictionaryManager
    {
        public static DictionaryEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select * from dictionary where id = {0}
            ", id);
            DictionaryEntity result = new DictionaryEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count>0)
            {
                var row = data.Rows[0];
                result=new DictionaryEntity(){
                    id= ValueManager.GetInt(row["id"]),
                    name = ValueManager.GetString(row["name"]),
                    value = ValueManager.GetString(row["value"]),
                    description = ValueManager.GetString(row["description"]),
                    entityid = ValueManager.GetInt(row["entity_id"]),
                    alias = ValueManager.GetString(row["alias"]),
                    requared = ValueManager.GetBoolean(row["requared"]),
                    color = ValueManager.GetString(row["color"]),
                    order = ValueManager.GetInt(row["ord"]),
                    img = ValueManager.GetString(row["img"])
                };
            }
            return result;
        }
        public static List<object> GetEntityList(){
            string selectSQL = @"
                select * from entity order by id
            ";
            List<object> result = new List<object>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(new {
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        description = ValueManager.GetString(row["description"])
                    });
                }
            }
            return result;
        }
        public static List<DictionaryEntity> Get(string name, string term, int length)
        {
            string selectSQL = string.Format(@"
                select * from dictionary where name='{0}' and value ilike '%{1}%' order by ord, name limit {2}
            ", name, term, length);
            List<DictionaryEntity> result = new List<DictionaryEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(new DictionaryEntity() { 
                        id= ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["value"]),
                        description = ValueManager.GetString(row["description"]),
                        requared = ValueManager.GetBoolean(row["requared"]),
                        color = ValueManager.GetString(row["color"]),
                        order = ValueManager.GetInt(row["ord"]),
                        alias = ValueManager.GetString(row["alias"]),
                        img = ValueManager.GetString(row["img"])
                    });
                }
            }
            return result;
        }
        public static List<DictionaryEntity> GetA(string type, string term, int length, string metric, string entityid){

            if (length == 0) length = 100;
            if (!string.IsNullOrEmpty(metric)) metric = string.Format("name='{0}' and ", metric.Trim());

            string selectSQL = string.Empty;
            switch (type.ToLower().Trim())
            {
                case "value":
                    selectSQL = string.Format(@"
                            select 
                                value,description, ord, color
                            from 
                                dictionary
                            where
                                {2} value ilike '%{0}%' {3}
                            order by ord, name
                            limit {1}
                            ", term, length, metric, (!string.IsNullOrEmpty(entityid)?string.Format(" and entity_id in ({0})", entityid):""));
                    break;
                case "dict":
                    selectSQL = string.Format(@"
                            select 
                                value,description, ord, color,name
                            from 
                                dictionary
                            where
                                {2} value ilike '%{0}%' {3}
                            order by ord, name
                            limit {1}
                            ", term, length, metric, (!string.IsNullOrEmpty(entityid)?string.Format(" and entity_id in ({0})", entityid):""));
                    break;
                default:
                    selectSQL = string.Format(@"
                        select distinct
                            name,'' as description, 0 as ord, '' as color
                        from 
                            dictionary
                        where
                            {2} name ilike '%{0}%' {3}
                        order by name
                        limit {1}
                            ", term, length, metric, (!string.IsNullOrEmpty(entityid)?string.Format(" and entity_id in ({0})", entityid):""));
                    break;
            }

            List<DictionaryEntity> result = new List<DictionaryEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
                data = manager.GetDataTable(selectSQL);
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                    result.Add(new DictionaryEntity()
                    {
                        value = ValueManager.GetString(row[0]),
                        name = ValueManager.GetString(row[(type.ToLower()=="dict"?4:0)]),
                        description = ValueManager.GetString(row[1]),
                        order = ValueManager.GetInt(row[2]),
                        color = ValueManager.GetString(row[3])
                    });
            }

            return result;
        }
        public static DictionaryEntity Save(DictionaryEntity entity)
        {
            string insertSQL = @"insert into dictionary 
                    (name,value,description,entity_id,alias,requared,color,ord,img)
                    values (@name,@value,@description,@entity_id,@alias,@requared,@color,@ord,@img)
                    returning id
            ";
            string updateSQL = @"update dictionary set 
                            name=@name,
                            value=@value,
                            description=@description,
                            entity_id=@entity_id,
                            alias=@alias,
                            color=@color,
                            requared=@requared,
                            ord=@ord,
                            img=@img
                where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("name", entity.name),
                    new DataParameter("value", ValueManager.GetValueOrDBNull(entity.value)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("entity_id", entity.entityid),
                    new DataParameter("alias", ValueManager.GetValueOrDBNull(entity.alias)),
                    new DataParameter("color", ValueManager.GetValueOrDBNull(entity.color)),
                    new DataParameter("requared", entity.requared),
                    new DataParameter("ord", entity.order),
                    new DataParameter("img", ValueManager.GetValueOrDBNull(entity.img))
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
            string checkSQL = @"
                select distinct * from (
                    select 
                        system.id, system.name 
                    from 
                        system_metric 
                        inner join system on system.id=system_metric.system_id 
                        inner join dictionary on system_metric.name=dictionary.name and system_metric.value=dictionary.value
                    WHERE 
                        dictionary.id = @id
                    union
                    select 
                        system.id, system.name 
                    from 
                        system_platform
                        inner join system on system.id=system_platform.system_id 
                        inner join dictionary on system_platform.value=dictionary.value
                    WHERE 
                        dictionary.entity_id=3 and dictionary.id = @id
                ) a1
                limit 11
            ";
            string deleteSQL = @"
                DELETE FROM dictionary WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                DataTable res = manager.GetDataTable(checkSQL, new DataParameter("id", id));
                if (res != null && res.Rows.Count > 0)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.Append("Невозможно удалить метрику - существует значение в системах:\n");
                    for (int i = 0; i < res.Rows.Count && i < 10; i++)
                        sb.AppendFormat("{0}. {1}\n", ValueManager.GetInt(res.Rows[i]["id"]), ValueManager.GetString(res.Rows[i]["name"]));
                    if (res.Rows.Count > 10)
                        sb.AppendFormat("...\nИтого {0} систем", res.Rows.Count);
                    throw new System.Exception(sb.ToString());
                }
                else
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }

    }
}
