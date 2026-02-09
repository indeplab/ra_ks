using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class DocumentTypeManager
    {
        public static List<DocumentTypeEntity> Get()
        {
            string selectSQL = @"
                select * from doc_type order by id
            ";
            List<DocumentTypeEntity> result = new List<DocumentTypeEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    result.Add(new DocumentTypeEntity()
                    {
                        id = ValueManager.GetInt(row["id"]),
                        name = ValueManager.GetString(row["name"]),
                        shortname = ValueManager.GetString(row["shortname"]),
                        code = ValueManager.GetString(row["code"]),
                        description = ValueManager.GetString(row["description"])
                    });
                }
            }
            return result;
        }
    }
}
