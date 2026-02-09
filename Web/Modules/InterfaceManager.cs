using DA;
using ExcelTool;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Text;
using Web.Models;

namespace Web.Modules
{
    public class InterfaceManager
    {

        public static InterfaceEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    interface.*, 
                    c.name as consumer_name,
                    s.name as supply_name,
                    c.description as consumer_description,
                    s.description as supply_description,
                    cf.name as consumer_function_name,
                    sf.name as supply_function_name
                from 
                    interface 
                    left join system c on interface.consumer_id=c.id
                    left join system s on interface.supply_id=s.id
                    left join function cf on interface.consumer_function_id=cf.id
                    left join function sf on interface.supply_function_id=sf.id
                where interface.id = {0}
            ", id);
            string selectDataSQL = string.Format(@"
                select 
                    interface.id,
                    data.id as dataid,
                    data.name,
                    interface_data.state 
                from 
                    interface
                    inner join interface_data on interface.id=interface_data.interface_id
                    inner join data on interface_data.data_id=data.id
                where interface.id = {0}
            ", id);
            DataTable data = null;
            DataTable d = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
                d = manager.GetDataTable(selectDataSQL);
            }
            InterfaceEntity entity = new InterfaceEntity();
            var list = getList(data);
            if (list.Count > 0)
            {
                entity = list[0];
                entity.data = new List<DataEntity>();
                foreach (DataRow row in d.Rows)
                {
                    entity.data.Add(new DataEntity()
                    {
                        id = ValueManager.GetInt(row["dataid"]),
                        name = ValueManager.GetString(row["name"]),
                        state = ValueManager.GetString(row["state"])
                    });
                }

            }
            return entity;
        }
        public static List<InterfaceEntity> GetByData(int id)
        {
            string selectSQL = string.Format(@"
                select 
                    interface.*,
                    c.name as consumer_name,
                    s.name as supply_name,
                    c.description as consumer_description,
                    s.description as supply_description
                from 
                    interface 
                    inner join interface_data on interface_data.interface_id=interface.id 
                    left join system c on interface.consumer_id=c.id
                    left join system s on interface.supply_id=s.id
                where 
                    interface_data.data_id={0}
            ", id);
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            return getList(data);
        }
        public static List<InterfaceEntity> Get(int consumerId, int supplyId, string term, int length)
        {
            string selectSQL = string.Format(@"
                select * from interface where (consumer_id = {0} or {0}=-1) and (supply_id = {1} or {1}=-1) and name ilike '%{2}%' limit {3}
            ", consumerId, supplyId, term, length);
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            return getList(data);
        }
        public static List<InterfaceEntity> GetA(int? consumerId, int? supplyId)
        {
            string selectSQL = @"
                select 
                    interface.*, 
                    c.name as consumer_name,
                    s.name as supply_name,
                    c.description as consumer_description,
                    s.description as supply_description,
                    cf.name as consumer_function_name,
                    sf.name as supply_function_name
                from 
                    interface 
                    left join system c on interface.consumer_id=c.id
                    left join system s on interface.supply_id=s.id
                    left join function cf on interface.consumer_function_id=cf.id
                    left join function sf on interface.supply_function_id=sf.id
            ";
            string selectDataSQL = @"
                select 
                    interface.id,
                    data.id as dataid,
                    data.name,
                    interface_data.state 
                from 
                    interface
                    inner join interface_data on interface.id=interface_data.interface_id
                    inner join data on interface_data.data_id=data.id
            ";
            string query = string.Empty;
            if (consumerId == null && supplyId == null)
                query = "1=0";
            if (consumerId != null)
                query += (query.Length > 0 ? " and " : "") + "interface.consumer_id=" + consumerId.GetValueOrDefault().ToString();
            if (supplyId != null)
                query += (query.Length > 0 ? " and " : "") + "interface.supply_id=" + supplyId.GetValueOrDefault().ToString();
            DataTable data = null;
            DataTable d = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL + " where " + query);
                d = manager.GetDataTable(selectDataSQL + " where " + query);
            }
            var result = getList(data);
            foreach (InterfaceEntity entity in result)
            {
                entity.data = new List<DataEntity>();
                foreach (DataRow row in d.Select("id=" + entity.id))
                {
                    entity.data.Add(new DataEntity()
                    {
                        id = ValueManager.GetInt(row["dataid"]),
                        name = ValueManager.GetString(row["name"]),
                        state = ValueManager.GetString(row["state"])
                    });
                }

            }
            return result;
        }
        private static List<InterfaceEntity> getList(DataTable data)
        {
            List<InterfaceEntity> result = new List<InterfaceEntity>();
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                {
                    result.Add(GetEntity(row));
                }
            }
            return result;
        }
        private static InterfaceEntity GetEntity(DataRow row)
        {
            var inter = new InterfaceEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                name = ValueManager.GetString(row["name"]),
                consumerid = ValueManager.GetInt(row["consumer_id"]),
                supplyid = ValueManager.GetInt(row["supply_id"]),
                interaction = ValueManager.GetString(row["interaction_type"]),
                interactionplatform = ValueManager.GetString(row["interaction_platform"]),
                state = ValueManager.GetString(row["state"]),
                consumerfunctionid = ValueManager.GetInt(row["consumer_function_id"]),
                supplyfunctionid = ValueManager.GetInt(row["supply_function_id"]),
                consumermethod = ValueManager.GetString(row["consumer_method"]),
                consumerint = ValueManager.GetString(row["consumer_connection"]),
                supplyint = ValueManager.GetString(row["supply_connection"]),
                docref = ValueManager.GetString(row["doc_ref"]),
                description = ValueManager.GetString(row["description"]),
                issupplyreсeive = ValueManager.GetBoolean(row["issupplyreсeive"])
            };
            inter.supplyname = ValueManager.GetIfExist<string>(row, "supply_name");
            inter.consumername = ValueManager.GetIfExist<string>(row, "consumer_name");
            inter.supplyfunctionname = ValueManager.GetIfExist<string>(row, "supply_function_name");
            inter.consumerfunctionname = ValueManager.GetIfExist<string>(row, "consumer_function_name");
            inter.supplydescription = ValueManager.GetIfExist<string>(row, "supply_description");
            inter.consumerdescription = ValueManager.GetIfExist<string>(row, "consumer_description");
            return inter;
        }
        public static InterfaceEntity Save(InterfaceEntity entity)
        {
            string insertSQL = @"insert into interface 
                    (name,consumer_id,supply_id,interaction_type,interaction_platform,consumer_function_id,supply_function_id,state,consumer_method,consumer_connection,supply_connection,doc_ref,description,issupplyreсeive)
                    values (@name,@consumer_id,@supply_id,@interaction_type,@interaction_platform,@consumer_function_id,@supply_function_id,@state,@consumer_method,@consumer_connection,@supply_connection,@doc_ref,@description,@issupplyreсeive)
                    returning id
            ";
            string updateSQL = @"update interface set 
                    name=@name,
                    consumer_id=@consumer_id,
                    supply_id=@supply_id,
                    interaction_type=@interaction_type,
                    interaction_platform=@interaction_platform,
                    consumer_function_id=@consumer_function_id,
                    supply_function_id=@supply_function_id,
                    state=@state,
                    consumer_method=@consumer_method,
                    consumer_connection=@consumer_connection,
                    supply_connection=@supply_connection,
                    doc_ref=@doc_ref,
                    description=@description,
                    issupplyreсeive=@issupplyreсeive
                where id=@id
            ";
            using (DataManager manager = new DataManager())
            {

                DataParameter[] p = new DataParameter[] {
                    new DataParameter("id", entity.id),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name)),
                    new DataParameter("consumer_id", entity.consumerid),
                    new DataParameter("supply_id", entity.supplyid),
                    new DataParameter("interaction_type", ValueManager.GetValueOrDBNull(entity.interaction)),
                    new DataParameter("interaction_platform", ValueManager.GetValueOrDBNull(entity.interactionplatform)),
                    new DataParameter("consumer_function_id", entity.consumerfunctionid),
                    new DataParameter("supply_function_id", entity.supplyfunctionid),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state)),
                    new DataParameter("consumer_method", ValueManager.GetValueOrDBNull(entity.consumermethod)),
                    new DataParameter("consumer_connection", ValueManager.GetValueOrDBNull(entity.consumerint)),
                    new DataParameter("supply_connection", ValueManager.GetValueOrDBNull(entity.supplyint)),
                    new DataParameter("doc_ref",ValueManager.GetValueOrDBNull(entity.docref)),
                    new DataParameter("description",ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("issupplyreсeive",ValueManager.GetBoolean(entity.issupplyreсeive))
                };
                if (entity.id == 0)
                    entity.id = ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                else
                    manager.ExecuteNonQuery(updateSQL, p);
                if (entity.data != null)
                {
                    entity.data = InterfaceDataManager.Save(entity.id, entity.data);
                }
            }
            return entity;
        }
        public static List<string> SaveFromFile(IFormFile file, out DataTable result)
        {
            string insertSQL = @"insert into interface 
                    (name,supply_id,consumer_id,interaction_platform)
                    values (@name,@supply_id,@consumer_id,@interaction_platform)
            ";
            result = null;
            var errors = new List<string>();
            using var fileStream = file.OpenReadStream();
            DataTable data;
            try
            {
                data = Excel.GetDataTableFromStream(fileStream);
            }
            catch
            {
                errors.Add("Невозможно прочитать файл");
                return errors;
            }
            if (data == null || data.Rows.Count == 0)
            {
                errors.Add("Пустой список");
                return errors;
            }

            string supplyCode = "Код поставщика";
            string consumerCode = "Код потребителя";
            string interfaceName = "Название";
            string integrationPlatform = "Интеграционная платформа";
            string errorColumn = "Ошибка";

            errors = CheckColumn(data, supplyCode, errors);
            errors = CheckColumn(data, consumerCode, errors);
            errors = CheckColumn(data, interfaceName, errors);
            if (errors.Count > 0)
            {
                return errors;
            }
            var systemList = SystemListManager.GetIdDataTable();
            if (!data.Columns.Contains(integrationPlatform)) data.Columns.Add(integrationPlatform);
            if (!data.Columns.Contains(errorColumn)) data.Columns.Add(errorColumn);

            using (DataManager manager = new DataManager())
            {
                foreach (DataRow row in data.Rows)
                {
                    StringBuilder sb = new StringBuilder();
                    if (systemList.Select(string.Format("id={0}", ValueManager.GetInt(row[supplyCode]))).Length == 0)
                        sb.AppendFormat("Значение поля '{0}' не найдено. ", supplyCode);
                    if (systemList.Select(string.Format("id={0}", ValueManager.GetInt(row[consumerCode]))).Length == 0)
                        sb.AppendFormat("Значение поля '{0}' не найдено. ", consumerCode);
                    if (sb.Length > 0)
                        row[errorColumn] = sb.ToString(0, sb.Length - 1);
                    else
                    {
                        DataParameter[] p = new DataParameter[] {
                            new DataParameter("name", ValueManager.GetString(row[interfaceName])),
                            new DataParameter("supply_id", ValueManager.GetInt(row[supplyCode])),
                            new DataParameter("consumer_id", ValueManager.GetInt(row[consumerCode])),
                            new DataParameter("interaction_platform", ValueManager.GetString(row[integrationPlatform]))
                        };
                        try
                        {
                            ValueManager.GetLong(manager.ExecuteScalar(insertSQL, p));
                        }
                        catch (Exception ex)
                        {
                            row[errorColumn] = ex.Message;
                        }
                    }
                }
            }
            var res = data.Select(string.Format("{0}<>''", errorColumn));
            errors.Add(string.Format("Обработано {0} строк из {1}. Ошибок {2}{3}", data.Rows.Count - res.Length, data.Rows.Count, res.Length, (res.Length > 0 ? "\nСписок см. в выгруженных результатах" : "")));
            if(res.Length>0)
                result = res.CopyToDataTable();
            return errors;
        }
        private static List<string> CheckColumn(DataTable data, string name, List<string> errors)
        {
            if (data == null || data.Columns.Count == 0 || !data.Columns.Contains(name))
                errors.Add(string.Format("Столбец '{0}' отсутствует", name));
            return errors;
        }
        public static void Delete(long id)
        {
            string deleteSQL = @"
                DELETE FROM interface WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }

    }
}
