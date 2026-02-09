using DA;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;
using Web.Models;

namespace Web.Modules
{
    public class SystemFileManager
    {
        public static SystemFileEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select system_file.*, system.name as system from system_file left join system on system_file.system_id=system.id where system_file.id = {0}
            ", id);
            SystemFileEntity result = new SystemFileEntity();
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
        public static List<SystemFileEntity> GetList(DictionaryRequest request)
        {
            string selectSQL = string.Format(@"
                select system_file.*, system.name as system from system_file left join system on system_file.system_id=system.id where system_file.system_id = {0}
            ", request.ID);
            List<SystemFileEntity> result = new List<SystemFileEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                {
                    result.Add(GetEntity(row));
                }
            }
            return result;
        }

        public static SystemFileEntity GetEntity(DataRow row)
        {
            return new SystemFileEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                file = ValueManager.GetString(row["file"]),
                name = ValueManager.GetString(row["name"]),
                description = ValueManager.GetString(row["description"]),
                systemid = ValueManager.GetInt(row["system_id"]),
                system = ValueManager.GetString(row["system"])
            };
        }
        public static SystemFileEntity SaveForm(IFormFile file, string fileString)
        {
            SystemFileEntity fileentity = JsonSerializer.Deserialize<SystemFileEntity>(fileString);
            string subpath = fileentity.systemid.ToString();
            if (fileentity.id != 0)
            {
                SystemFileEntity entity = Get(fileentity.id);
                if (!string.IsNullOrEmpty(entity.file) &&
                    (string.IsNullOrEmpty(fileentity.file) && file == null || file != null)
                )
                    FileManager.Delete("system", subpath, entity.file);

            }
            if (file != null) FileManager.Save("system", subpath, file);
            Save(fileentity);
            return fileentity;
        }
        public static SystemFileEntity Save(SystemFileEntity entity)
        {
            string insertSQL = @"insert into system_file 
                    (name,file,system_id,description)
                    values (@name,@file,@system_id,@description)
                    returning id
            ";
            string updateSQL = @"update system_file set 
                            name=@name,
                            file=@file,
                            description=@description
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("system_id", entity.systemid),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name)),
                    new DataParameter("file", ValueManager.GetValueOrDBNull(entity.file)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description))
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
            string checkSQL = @"
                select id from council_issue where council_id = @id 
                limit 1
            ";
            var file = Get(id);
            if(file.id!=0){
                FileManager.Delete("system", file.systemid.ToString(), file.file);
            }
            using (DataManager manager = new DataManager())
            {
                /*if (manager.ExecuteScalar(checkSQL, new DataParameter("id", id)) != null)
                    throw new Exception("Невозможно удалить протокол - существует решения");
                else
                {
                    manager.ExecuteNonQuery("DELETE FROM council_issue WHERE council_id = @id", new DataParameter("id", id));*/

                manager.ExecuteNonQuery("DELETE FROM system_file WHERE id = @id", new DataParameter("id", id));
                //}
            }
        }

    }
}
