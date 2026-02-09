using DA;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;
using Web.Models;

namespace Web.Modules
{
    public class ContentManager
    {
        private static string basedir = "content";
        public static List<object> GetTypeList()
        {
            string selectSQL = string.Format(@"
                select 
                    content_type.*
                from 
                    content_type 
                order by name
            ");
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            List<object> list = new List<object>();
            foreach (DataRow row in data.Rows)
            {
                list.Add(new
                {
                    id = ValueManager.GetInt(row["id"]),
                    name = ValueManager.GetString(row["name"]),
                    image = ValueManager.GetString(row["image"])
                });
            }
            return list;
        }
        public static List<ContentEntity> GetList(int partid)
        {
            string selectSQL = string.Format(@"
                select 
                    content.*,
                    content_type.image as image,
                    content_type.name as type
                from 
                    content 
                    left join content_type on content.type_id = content_type.id
                where content.part_id = {0}
                order by ord
            ", partid);
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            List<ContentEntity> list = new List<ContentEntity>();
            foreach (DataRow row in data.Rows)
            {
                list.Add(GetContentEntity(row));
            }
            return list;
        }
        public static ContentEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    content.*,
                    content_type.image as image,
                    content_type.name as type
                from 
                    content 
                    left join content_type on content.type_id = content_type.id
                where content.id = {0}
            ", id);
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            ContentEntity entity = new ContentEntity();
            if (data.Rows.Count > 0)
            {
                entity = GetContentEntity(data.Rows[0]);
            }
            return entity;
        }
        private static ContentEntity GetContentEntity(DataRow row)
        {
            ContentEntity result = new()
            {
                id = ValueManager.GetInt(row["id"]),
                name = ValueManager.GetString(row["name"]),
                description = ValueManager.GetString(row["description"]),
                image = ValueManager.GetString(row["image"]),
                src = ValueManager.GetString(row["src"]),
                typeid = ValueManager.GetInt(row["type_id"]),
                partid = ValueManager.GetInt(row["part_id"]),
                type = ValueManager.GetString(row["type"]),
                ord = ValueManager.GetInt(row["ord"]),
                islink = ValueManager.GetBoolean(row["islink"])
            };
            return result;
        }

        public static ContentEntity SaveForm(IFormFile content, string contentString)
        {
            ContentEntity entity = JsonSerializer.Deserialize<ContentEntity>(contentString);
            string subpath = string.Empty;
            if (entity.id != 0)
            {
                ContentEntity entity2 = Get(entity.id);
                if (!string.IsNullOrEmpty(entity2.src) && !entity2.islink)
                    FileManager.Delete(basedir, subpath, entity2.src);

            }
            if (content != null) FileManager.Save(basedir, subpath, content);
            Save(entity);
            return entity;
        }
        public static ContentEntity Save(ContentEntity entity)
        {
            string insertSQL = @"insert into content 
                    (name,description,src,type_id,part_id,islink,ord)
                    values (@name,@description,@src,@type_id,@part_id,@islink,@ord)
                    returning id
            ";
            string updateSQL = @"update content set 
                            name=@name,
                            description=@description,
                            src=@src,
                            type_id=@type_id,
                            part_id=@part_id,
                            islink=@islink,
                            ord=@ord
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name)),
                    new DataParameter("src", ValueManager.GetValueOrDBNull(entity.src)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("type_id", entity.typeid),
                    new DataParameter("islink", entity.islink),
                    new DataParameter("part_id", entity.partid),
                    new DataParameter("ord", entity.ord)
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
            ContentEntity content = Get(id);
            FileManager.Delete(basedir, string.Empty, content.src);

            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery("DELETE FROM content WHERE id = @id", new DataParameter("id", id));
                //}
            }
        }
    }
}
