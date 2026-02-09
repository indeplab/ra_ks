using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Text.Json;
using Web.Controllers;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class DocumentManager
    {
        public static List<DocumentEntity> GetList(string search, string type, string state, int length)
        {
            FilterParameterCollection filterlist = new FilterParameterCollection();
            QueryAndCollection and = new QueryAndCollection();

            if (!string.IsNullOrEmpty(search))
            {
                and.Parameters.Add(@"                   
                    doc.name ilike @doc_term
                    or doc_type.name ilike @doc_term
                    or doc.author ilike @doc_term 
                    or doc.project ilike @doc_term
                    or doc_state.name ilike @doc_term
                ");
                filterlist.Add("doc_term", string.Concat("%", search, "%"));
            }
            state = string.IsNullOrEmpty(state) ? "" : state;
            switch (state.ToLower().Trim())
            {
                case "work":
                    and.Parameters.Add("COALESCE(doc.state_id,1)=1 and COALESCE(doc.isdeleted,false)=false");
                    break;
                case "publish":
                    and.Parameters.Add("COALESCE(doc.state_id,1)<>1 and COALESCE(doc.isdeleted,false)=false");
                    break;
                case "template":
                    and.Parameters.Add("COALESCE(doc.type_id,0)=4 and COALESCE(doc.state_id,1)=3 and COALESCE(doc.isdeleted,false)=false");
                    break;
                case "deleted":
                    and.Parameters.Add("COALESCE(doc.isdeleted,false)=true");
                    break;
                default:
                    and.Parameters.Add("COALESCE(doc.isdeleted,false)=false");
                    break;
            }
            if (!string.IsNullOrEmpty(type))
            {
                filterlist.Add("doc_type", type);
                and.Parameters.Add("doc_type.name = @doc_type");
            }
            string selectSQL = string.Format(@"
                select 
                    doc.*,
                    doc_type.name as type,
                    doc_type.code as typecode,
                    doc_state.name as state,
                    doc_state.color as statecolor,
                    doc_state.ord as stateord,
                    doc_state.canedit,
                    doc_state.next, 
                    " + (state == "template" ? @"doc_data.data" : "''") + @" as docdata
                from 
                    doc 
                    left join doc_state on coalesce(doc.state_id, 1)=doc_state.id 
                    left join doc_type on coalesce(doc.type_id, 2)=doc_type.id
                    " + (state == "template" ? @"left join doc_data on doc.id = doc_data.doc_id and data like '%document%'" : "") + @"
                {0} 
                order by 
                    doc.date desc 
                limit {1}
            ", and.ToStringWhere(), length);

            List<DocumentEntity> list = new List<DocumentEntity>();
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, filterlist.ToDataParameterArray());
                if (data != null)
                {
                    foreach (DataRow row in data.Rows)
                    {
                        var d = new DocumentEntity()
                        {
                            id = ValueManager.GetLong(row["id"]),
                            name = ValueManager.GetString(row["name"]),
                            type = ValueManager.GetString(row["type"]),
                            typeid = ValueManager.GetInt(row["type_id"]),
                            typecode = ValueManager.GetString(row["typecode"]),
                            date = ValueManager.GetDateTime(row["date"]),
                            author = ValueManager.GetString(row["author"]),
                            login = ValueManager.GetString(row["login"]),
                            version = ValueManager.GetString(row["version"]),
                            project = ValueManager.GetString(row["project"]),
                            stateid = ValueManager.GetInt(row["state_id"]),
                            ord = ValueManager.GetInt(row["stateord"]),
                            state = ValueManager.GetString(row["state"]),
                            statecolor = ValueManager.GetString(row["statecolor"]),
                            statecanedit = (ValueManager.GetBoolean(row["canedit"]) ? 1 : 0),
                            statenext = ValueManager.GetString(row["next"]),
                            isdeleted = ValueManager.GetBoolean(row["isdeleted"]),
                            description = ValueManager.GetString(row["description"]),
                            docdata = ValueManager.GetString(row["docdata"])
                        };
                        list.Add(d);
                    }
                }
            }
            return list;
        }
        public static DocumentEntity Get(long id)
        {
            string selectSQL = "select doc.*,doc_type.name as type,doc_type.code as typecode,doc_state.name as state,doc_state.color as statecolor,doc_state.ord as stateord,doc_state.canedit,doc_state.next from doc left join doc_state on coalesce(doc.state_id, 1)=doc_state.id left join doc_type on coalesce(doc.type_id, 2)=doc_type.id where doc.id=@id";
            DocumentEntity doc = new DocumentEntity() ;
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("id", id));
                if (data != null && data.Rows.Count>0)
                {
                    DataRow row = data.Rows[0];
                    doc =new DocumentEntity()
                        {
                            id = id,
                            name = ValueManager.GetString(row["name"]),
                            type = ValueManager.GetString(row["type"]),
                            typeid = ValueManager.GetInt(row["type_id"]),
                            typecode = ValueManager.GetString(row["typecode"]),
                            date = ValueManager.GetDateTime(row["date"]),
                            author = ValueManager.GetString(row["author"]),
                            login = ValueManager.GetString(row["login"]),
                            version = ValueManager.GetString(row["version"]),
                            project = ValueManager.GetString(row["project"]),
                            stateid = ValueManager.GetInt(row["state_id"]),
                            ord = ValueManager.GetInt(row["stateord"]),
                            state = ValueManager.GetString(row["state"]),
                            statecolor = ValueManager.GetString(row["statecolor"]),
                            statecanedit = (ValueManager.GetBoolean(row["canedit"]) ? 1 : 0),
                            statenext = ValueManager.GetString(row["next"]),
                            isdeleted = ValueManager.GetBoolean(row["isdeleted"]),
                            description = ValueManager.GetString(row["description"]),
                            data = GetData(id)
                        };
                }
            }
            return doc;
        }
        private static List<string> GetData(long id)
        {
            string selectDataSQL = "select data from doc_data where doc_id=@doc_id";
            List<string> list = new List<string>();
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectDataSQL, new DataParameter("doc_id", id));
                if (data != null)
                {
                    foreach (DataRow row in data.Rows)
                        list.Add(ValueManager.GetString(row["data"]));
                }
            }
            return list;
        }
        /*public static List<DocumentEntity> GetByTag(string tag)
        {
            string selectSQL = string.Format("select doc.*,doc_type.name as type,doc_type.code as typecode,doc_state.name as state,doc_state.color as statecolor,doc_state.ord as stateord,doc_state.canedit,doc_state.next from doc left join doc_state on coalesce(doc.state_id, 1)=doc_state.id left join doc_type on coalesce(doc.type_id, 2)=doc_type.id where doc.tags ilike '%{0}%' order by id", tag);
            List<DocumentEntity> list = new List<DocumentEntity>();
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL);
                if (data != null)
                {
                    foreach (DataRow row in data.Rows)
                        list.Add(
                            new DocumentEntity()
                            {
                                id = ValueManager.GetLong(row["id"]),
                                name = ValueManager.GetString(row["name"]),
                                type = ValueManager.GetString(row["type"]),
                                typeid = ValueManager.GetInt(row["type_id"]),
                                typecode = ValueManager.GetString(row["typecode"]),
                                date = ValueManager.GetDateTime(row["date"]),
                                author = ValueManager.GetString(row["author"]),
                                version = ValueManager.GetString(row["version"]),
                                description = ValueManager.GetString(row["description"]),
                                project = ValueManager.GetString(row["project"]),
                                stateid = ValueManager.GetInt(row["state_id"]),
                                ord = ValueManager.GetInt(row["stateord"]),
                                state = ValueManager.GetString(row["state"]),
                                statecolor = ValueManager.GetString(row["statecolor"]),
                                statecanedit = (ValueManager.GetBoolean(row["canedit"]) ? 1 : 0),
                                statenext = ValueManager.GetString(row["next"]),
                                isdeleted = ValueManager.GetBoolean(row["isdeleted"])
                            });
                }
            }
            return list;
        }*/
        public static long Save(DocumentEntity doc, List<DocumentTag> tags, List<string> data)
        {
            string selectSQL = "SELECT id from doc where id=@id";
            string insertSQL = "INSERT INTO doc (name,type_id,project,author,version,date,description,login,state_id) VALUES (@name,@type_id,@project,@author,@version,CURRENT_TIMESTAMP,@description,@login,@stateid) RETURNING id";
            string updateSQL = "UPDATE doc SET name=@name,type_id=@type_id,project=@project,author=@author,version=@version,date=CURRENT_TIMESTAMP,description=@description,state_id=@stateid WHERE id=@id";
            string deleteDataSQL = "delete from doc_data where doc_id=@id";
            string deleteLinkSQL = "delete from doc_link where doc_id=@id";
            using (DataManager manager = new DataManager())
            {
                doc.id = ValueManager.GetLong(manager.ExecuteScalar(selectSQL, new DataParameter("id", doc.id)));
                if (doc.id == 0)
                {
                    doc.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL
                        , new DataParameter("name", doc.name)
                        , new DataParameter("type_id", doc.typeid)
                        , new DataParameter("project", doc.project)
                        , new DataParameter("author", doc.author)
                        , new DataParameter("version", doc.version)
                        , new DataParameter("description", doc.description)
                        , new DataParameter("login", doc.login)
                        , new DataParameter("stateid", doc.stateid)
                    ));
                }
                else
                {
                    manager.ExecuteNonQuery(updateSQL
                        , new DataParameter("id", doc.id)
                        , new DataParameter("name", doc.name)
                        , new DataParameter("type_id", doc.typeid)
                        , new DataParameter("project", doc.project)
                        , new DataParameter("author", doc.author)
                        , new DataParameter("description", doc.description)
                        , new DataParameter("version", doc.version)
                        , new DataParameter("stateid", doc.stateid)
                    );
                }
                manager.ExecuteNonQuery(deleteDataSQL
                        , new DataParameter("id", doc.id)
                    );
                if(data!=null && data.Count > 0)
                {
                    StringBuilder insertDataSQL = new StringBuilder();
                    insertDataSQL.Append("insert into doc_data (doc_id,data) values");
                    foreach (string d in data)
                    {
                        insertDataSQL.AppendFormat(" ({0},'{1}'),", doc.id, d);
                    }
                    manager.ExecuteNonQuery(insertDataSQL.ToString(0, insertDataSQL.Length - 1));

                }
                /*foreach (string d in data) {
                    manager.ExecuteNonQuery(insertDataSQL
                            , new DataParameter("doc_id", doc.id)
                            , new DataParameter("data", d)
                        );
                }*/
                manager.ExecuteNonQuery(deleteLinkSQL
                        , new DataParameter("id", doc.id)
                    );
                if (tags!=null && tags.Count>0) {
                    StringBuilder insertLinkSQL = new StringBuilder();
                    insertLinkSQL.Append("insert into doc_link (doc_id,type,ref_id,name) values");
                    foreach (DocumentTag t in tags)
                    {
                        insertLinkSQL.AppendFormat(" ({0},'{1}',{2},'{3}'),", doc.id, t.type, t.id, t.name);
                    }
                    manager.ExecuteNonQuery(insertLinkSQL.ToString(0, insertLinkSQL.Length - 1));
                }
            }
            return doc.id;
        }
        public static long SaveState(DocumentEntity doc)
        {
            string updateSQL = "UPDATE doc SET state_id=@stateid WHERE id=@id";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(updateSQL
                    , new DataParameter("id", doc.id)
                    , new DataParameter("stateid", doc.stateid)
                );
            }
            return doc.id;
        }
        public static long SetDeleted(DocumentEntity doc)
        {
            string updateSQL = "UPDATE doc SET isdeleted=@isdeleted WHERE id=@id";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(updateSQL
                    , new DataParameter("id", doc.id)
                    , new DataParameter("isdeleted", doc.isdeleted)
                );
            }
            return doc.id;
        }
        public class SchemaResponse
        {
            public string name { get; set; }
            public string file { get; set; }
        }
        public static SchemaResponse GetSchemaName(long id, string type)
        {
            SchemaResponse schema = new SchemaResponse();
            string selectSQL = string.Format("SELECT {0}_schema_name as name from doc WHERE id=@id", type);
            using (DataManager manager = new DataManager())
            {
                schema.name = ValueManager.GetString(manager.ExecuteScalar(selectSQL, new DataParameter("id", id)));
            }
            return schema;
        }
        public static SchemaResponse GetSchema(long id, string type)
        {
            SchemaResponse schema = new SchemaResponse();
            string selectSQL = string.Format("SELECT {0}_schema_name as name,{0}_schema as schema from doc WHERE id=@id", type);
            using (DataManager manager = new DataManager())
            {
                DataReader reader = manager.ExecuteReader(selectSQL, new DataParameter("id", id));
                if (reader.Read())
                {
                    schema.name = ValueManager.GetString(reader["name"]);
                    if (!ValueManager.IsDBNullOrNull(reader["schema"]))
                        schema.file = "data:application/vnd.ms-visio.drawing;base64," + Convert.ToBase64String((byte[])reader["schema"]);
                }
                reader.Close();
            }
            return schema;
        }
        public static void SaveSchema(long id, string type, string name, byte[] file)
        {
            string updateSQL = string.Format("UPDATE doc SET {0}_schema_name=@name,{0}_schema=@schema WHERE id=@id", type);
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(updateSQL
                    , new DataParameter("id", id)
                    , new DataParameter("name", name)
                    , new DataParameter("schema", file)
                );
            }
        }
        public static void ClearSchema(long id, string type)
        {
            string updateSQL = string.Format("UPDATE doc SET {0}_schema_name=null,{0}_schema=null WHERE id=@id", type);
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(updateSQL
                    , new DataParameter("id", id)
                );
            }
        }
        public static void Delete(long id)
        {
            string deleteDataSQL = "delete from doc_data where doc_id=@doc_id";
            string deleteSQL = "delete from doc where id=@id";
            using (DataManager manager=new DataManager())
            {
                manager.ExecuteNonQuery(deleteDataSQL, new DataParameter("doc_id", id));
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
    }
}
