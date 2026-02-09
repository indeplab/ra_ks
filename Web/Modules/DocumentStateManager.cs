using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class DocumentStateManager
    {
        public static List<DocumentStateEntity> Get()
        {
            string selectSQL = @"
                select * from doc_state order by ord
            ";
            List<DocumentStateEntity> result = new List<DocumentStateEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(new DocumentStateEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        color = ValueManager.GetString(row["color"]),
                        canedit = ValueManager.GetBoolean(row["canedit"]),
                        next = ValueManager.GetString(row["next"]),
                        order = ValueManager.GetInt(row["ord"])
                    });
                }
            }
            return result;
        }
    }
}
