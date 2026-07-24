using DA;
using System.Collections.Generic;
using System.Data;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Web.Models;

namespace Web.Modules
{
    public class DictionaryManager : BaseKSManager
    {
        public static async Task<List<DictionaryEntity>> Get(string name, string term, int length)
        {
            List<DictionaryEntity> result = new List<DictionaryEntity>();
            var headers = new Dictionary<string, string>()
            {
                {"X-Project-Uuid", ProjectUUID}
            };
            object req = new
            {
                term = name,
                limit = 0
            };
            string resstr = await Post("api/dictionaries/get-list", req, headers);
            var d = JsonSerializer.Deserialize<dictionaryEntityList>(resstr);
            if (d != null && d.data != null && d.data.Length>0)
            {
                req = new
                {
                    dictionaryUUID = d.data[0].uuid,
                    perPage = 50,
                    page = 1
                };
                resstr = await Post("api/dictionary-elements/get-list", req, headers);
                d = JsonSerializer.Deserialize<dictionaryEntityList>(resstr);
                if (d != null && d.data != null)
                {
                    for (int i = 0; i < d.data.Length && i < (length == 0?50:length); i++)
                    {
                        if(string.IsNullOrEmpty(term) || d.data[i].name.IndexOf(term)!=-1){
                            result.Add(new DictionaryEntity() { 
                                id= d.data[i].uuid,
                                name = d.data[i].name
                            });
                        }
                    }
                }

            };
/*
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
            }*/
            return result;
        }
    }
}
