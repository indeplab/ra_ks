using DA;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Data;
using System.Text.Json;
using Web.Models;

namespace Web.Modules
{
    public class CouncilManager
    {
        public static CouncilEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    * 
                from 
                    council 
                where id = {0}
            ", id);
            /*string selectIssueSQL = string.Format(@"
                select 
                    * 
                from 
                    council_issue
                where council_id = {0}
            ", id);*/
            string selectSystemSQL = string.Format(@"
                select 
                    council_system.*, 
                    system.name as system_name
                from 
                    council_system
                    left join system on council_system.system_id = system.id
                where council_id = {0}
            ", id);
            DataTable data = null;
            DataTable system = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
                system = manager.GetDataTable(selectSystemSQL);
            }
            CouncilEntity entity = new CouncilEntity();
            if (data.Rows.Count > 0)
            {
                /*entity = GetCouncilEntity(data.Rows[0]);
                entity.issues = new List<CouncilIssueEntity>();
                foreach (DataRow row in d.Rows)
                    entity.issues.Add(GetIssueEntity(row));*/
                entity = GetCouncilEntity(data.Rows[0]);
                entity.systems = new List<CouncilSystemEntity>();
                foreach (DataRow row in system.Rows)
                    entity.systems.Add(GetSystemEntity(row));
            }
            return entity;
        }
        private static CouncilEntity GetCouncilEntity(DataRow row)
        {
            CouncilEntity result = new()
            {
                id = ValueManager.GetInt(row["id"]),
                number = ValueManager.GetInt(row["number"]),
                date = ValueManager.GetDateTime(row["date"]),
                agendaFile = ValueManager.GetString(row["agenda_file"]),
                decisionFile = ValueManager.GetString(row["decision_file"])
            };
            return result;
        }
        private static CouncilSystemEntity GetSystemEntity(DataRow row)
        {
            CouncilSystemEntity result = new()
            {
                id = ValueManager.GetInt(row["id"]),
                councilid = ValueManager.GetInt(row["council_id"]),
                systemid = ValueManager.GetInt(row["system_id"]),
            };
            result.system = ValueManager.GetIfExist<string>(row, "system_name");
            return result;
        }
        /*private static CouncilIssueEntity GetIssueEntity(DataRow row)
        {
            CouncilIssueEntity result = new()
            {
                id = ValueManager.GetInt(row["id"]),
                councilid = ValueManager.GetInt(row["council_id"]),
                question = ValueManager.GetInt(row["question"]),
                agenda = ValueManager.GetString(row["agenda"]),
                decision = ValueManager.GetString(row["decision"]),
                speaker = ValueManager.GetString(row["speaker"]),
                division = ValueManager.GetString(row["division"])
            };
            return result;
        }*/

        public static CouncilEntity SaveForm(IFormFile agenda, IFormFile decision, string councilString)
        {
            CouncilEntity council = JsonSerializer.Deserialize<CouncilEntity>(councilString);
            string subpath = council.id.ToString();
            if (council.id != 0)
            {
                CouncilEntity entity = Get(council.id);
                if (!string.IsNullOrEmpty(entity.agendaFile) &&
                    (string.IsNullOrEmpty(council.agendaFile) && agenda == null || agenda != null)
                )
                    FileManager.Delete("council", subpath, entity.agendaFile);

                if (!string.IsNullOrEmpty(entity.decisionFile) &&
                    (string.IsNullOrEmpty(council.decisionFile) && decision == null || decision != null)
                )
                    FileManager.Delete("council", subpath, entity.decisionFile);
            }
            if (agenda != null) FileManager.Save("council", subpath, agenda);
            if (decision != null) FileManager.Save("council", subpath, decision);
            Save(council);
            return council;
        }
        public static CouncilEntity Save(CouncilEntity entity)
        {
            string insertSQL = @"insert into council 
                    (number,date,agenda_file,decision_file)
                    values (@number,@date,@agenda_file,@decision_file)
                    returning id
            ";
            string updateSQL = @"update council set 
                            number=@number,
                            date=@date,
                            agenda_file=@agenda_file,
                            decision_file=@decision_file
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("number", entity.number),
                    new DataParameter("date", entity.date),
                    new DataParameter("agenda_file", ValueManager.GetValueOrDBNull(entity.agendaFile)),
                    new DataParameter("decision_file", ValueManager.GetValueOrDBNull(entity.decisionFile))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
                if (entity.systems != null)
                {
                    entity.systems = SaveSystem(entity.id, entity.systems);
                }
                /*if (entity.issues != null)
                {
                    for (int i = 0; i < entity.issues.Count; i++)
                    {
                        entity.issues[i].councilid = entity.id;
                        entity.issues[i] = SaveIssue(entity.issues[i]);
                    }
                }*/
            }
            return entity;
        }
        public static List<CouncilSystemEntity> SaveSystem(long councilid, List<CouncilSystemEntity> systemList)
        {
            string selectSQL = @"
                select * from council_system where council_id=@id
            ";
            string deleteSQL = @"
                delete from council_system where id=@id
            ";
            string insertSQL = @"
                insert into council_system (council_id,system_id) values (@council_id,@system_id) returning id
            ";
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("id", councilid));
                foreach (CouncilSystemEntity system in systemList)
                {
                    DataRow[] rows = data.Select(string.Format("system_id ={0}", system.systemid));
                    if (rows.Length == 0)
                        system.id = ValueManager.GetInt(manager.ExecuteScalar(insertSQL,
                            new DataParameter("council_id", councilid),
                            new DataParameter("system_id", system.systemid)
                        ));
                    else
                    {
                        system.id = ValueManager.GetInt(rows[0]["id"]);
                        data.Rows.Remove(rows[0]);
                    }
                }
                foreach (DataRow row in data.Rows)
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", ValueManager.GetInt(data.Rows[0]["id"])));
            }
            return systemList;
        }
        public static CouncilSystemEntity SaveSystem(CouncilSystemEntity entity)
        {
            string insertSQL = @"insert into council_system 
                    (council_id,system_id)
                    values (@council_id,@system_id)
                    returning id
            ";
            string updateSQL = @"update council_system set 
                            council_id=@council_id,
                            system_id=@system_id
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("council_id", entity.councilid),
                    new DataParameter("system_id", entity.systemid)
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
            }
            return entity;
        }
        /*public static CouncilIssueEntity SaveIssue(CouncilIssueEntity entity)
        {
            string insertSQL = @"insert into council_issue 
                    (council_id,question,agenda,decision,speaker,division)
                    values (@council_id,@question,@agenda,@decision,@speaker,@division)
                    returning id
            ";
            string updateSQL = @"update council_issue set 
                            council_id=@council_id,
                            question=@question,
                            agenda=@agenda,
                            decision=@decision,
                            speaker=@speaker,
                            division=@division
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("council_id", entity.councilid),
                    new DataParameter("question", entity.question),
                    new DataParameter("agenda", ValueManager.GetValueOrDBNull(entity.agenda)),
                    new DataParameter("decision", ValueManager.GetValueOrDBNull(entity.decision)),
                    new DataParameter("speaker", ValueManager.GetValueOrDBNull(entity.speaker)),
                    new DataParameter("division", ValueManager.GetValueOrDBNull(entity.division))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
            }
            return entity;
        }*/
        public static void Delete(long id)
        {
            FileManager.DeleteDir("council",id.ToString());

            string checkSQL = @"
                select id from council_issue where council_id = @id 
                limit 1
            ";
            using (DataManager manager = new DataManager())
            {
                /*if (manager.ExecuteScalar(checkSQL, new DataParameter("id", id)) != null)
                    throw new Exception("Невозможно удалить протокол - существует решения");
                else
                {
                    manager.ExecuteNonQuery("DELETE FROM council_issue WHERE council_id = @id", new DataParameter("id", id));*/

                    manager.ExecuteNonQuery("DELETE FROM council_system WHERE council_id = @id", new DataParameter("id", id));
                    manager.ExecuteNonQuery("DELETE FROM Council WHERE id = @id", new DataParameter("id", id));
                //}
            }
        }
        /*public static void DeleteIssue(long id)
        {
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery("DELETE FROM council_issue WHERE id = @id", new DataParameter("id", id));
            }

        }*/
    }
}
