using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class InterfaceDataManager
    {
        public static List<DataEntity> Get(int id, string term, int length)
        {
            string selectSQL = string.Empty;
            if (id!=0)
                selectSQL = string.Format(@"
                    select data.*,interface_data.state from interface_data inner join data on interface_data.data_id=data.id where interface_data.interface_id = {0} 
                ", id);
            else
                selectSQL = string.Format(@"
                    select *, 'new' as state from data where name ilike '%{0}%' limit {1}
                ", term, length);

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
                    result.Add(new DataEntity() { 
                        id= ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        refid = id,
                        state = ValueManager.GetString(row["state"])
                    });
                }
            }
            return result;
        }
        public static DataEntity Save(DataEntity entity)
        {
            string selectSQL = @"select id from interface_data where data_id=@did and interface_id=@sid";
            string selectNameSQL = @"select id from data where name=@name";
            string insertSQL = @"insert into interface_data (interface_id,data_id,state) values (@sid,@did,@state)";
            string insertDataSQL = @"insert into data (name) values(@name) returning id";
            string updateSQL = @"update interface_data set state=@state where data_id=@did and interface_id=@sid";

            using (DataManager manager = new DataManager())
            {
                if (entity.id == 0)
                {
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(selectNameSQL, new DataParameter("name", entity.name)));
                    if (entity.id == 0)
                        entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertDataSQL, new DataParameter("name", entity.name)));
                }
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("sid", entity.refid),
                    new DataParameter("did", entity.id),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state))
                };
                long id = ValueManager.GetLong(manager.ExecuteScalar(selectSQL, p));
                if (id == 0)
                    ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
            }
            return entity;
        }
        public static List<DataEntity> Save(long interid, List<DataEntity> dataList = null)
        {
            string selectSQL = @"
                select * from interface_data where interface_id=@id
            ";
            string deleteSQL = @"
                delete from interface_data where id=@id
            ";
            string updateSQL = @"
                update interface_data set state=@state where id=@id
            ";
            string insertSQL = @"
                insert into interface_data (data_id,interface_id,state) values (@dataid,@interfaceid,@state) returning id
            ";
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("id", interid));
                foreach (DataEntity dt in dataList)
                {
                    DataRow[] rows = data.Select(string.Format("data_id ='{0}'", dt.id));
                    if (rows.Length == 0)
                        dt.id = ValueManager.GetInt(manager.ExecuteScalar(insertSQL,
                            new DataParameter("interfaceid", interid),
                            new DataParameter("dataid", dt.id),
                            new DataParameter("state", (string.IsNullOrEmpty(dt.state) ? "exist" : dt.state))
                            ));
                    else
                    {
                        int id = ValueManager.GetInt(rows[0]["id"]);
                        manager.ExecuteNonQuery(updateSQL,
                            new DataParameter("id", id),
                            new DataParameter("state", string.IsNullOrEmpty(dt.state) ? "exist" : dt.state)
                        );
                        data.Rows.Remove(rows[0]);
                    }
                }
                foreach (DataRow row in data.Rows)
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", ValueManager.GetInt(data.Rows[0]["id"])));
            }
            return dataList;
        }
        public static void Delete(long id)
        {
            string deleteSQL = @"
                DELETE FROM interface_data WHERE id = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
    }
}
