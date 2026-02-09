using DA;
using System;
using System.Collections.Generic;
using System.Data;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SystemDataManager : BaseListManager
    {
        public SystemDataManager(FilterEntity filter):base(filter){
            filter.currentSort=string.IsNullOrEmpty(filter.currentSort)?"Name":filter.currentSort;
        }
        protected override object OnFormatValue(DataColumn column, DataRow row)
        {
            if (column.Caption.Equals("data", StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty(row[column].ToString()))
                return "<нет>";
            return base.OnFormatValue(column, row);
        }

        protected override GridQuery Query
        {
            get
            {
                GridQuery query = new GridQuery();
                if (!string.IsNullOrEmpty(Filter["id"]))
                    query.Parameters.Add("id", ValueManager.GetInt(Filter["id"]), "system_data.system_id = @id");
                if (!string.IsNullOrEmpty(Filter["did"]))
                    query.Parameters.Add("did", ValueManager.GetInt(Filter["did"]), "system_data.data_id = @did");
                if (!string.IsNullOrEmpty(Filter["tbDataName"]))
                    query.Parameters.Add("name", string.Concat("%", Filter["tbDataName"], "%"), "data.Name ilike @name");
                if (!string.IsNullOrEmpty(Filter["tbSystemName"]))
                    query.Parameters.Add("system", string.Concat("%", Filter["tbSystemName"], "%"), "system.Name ilike @system");
                if (!string.IsNullOrEmpty(Filter["ddlDataFlowType"]))
                    query.Parameters.Add("flowtype", Filter["ddlDataFlowType"], "system_data.flowtype = @flowtype");

                return (query);
            }
        }
        public static SystemDataEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select 
                    system.id as systemid, 
                    system.name as system, 
                    data.id as dataid, 
                    data.name as data, 
                    data.description, 
                    system_data.flowtype,
                    system_data.state
                from 
                    system_data 
                    inner join system on system_data.system_id=system.id 
                    inner join data on system_data.data_id=data.id 
                where 
                    system_data.id={0}
            ", id);
            SystemDataEntity result = new SystemDataEntity();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                result = new SystemDataEntity() { 
                    id=id,
                    systemid = ValueManager.GetInt(data.Rows[0]["systemid"]),
                    system = ValueManager.GetString(data.Rows[0]["system"]),
                    dataid = ValueManager.GetInt(data.Rows[0]["dataid"]),
                    data = ValueManager.GetString(data.Rows[0]["data"]),
                    flowtype = ValueManager.GetString(data.Rows[0]["flowtype"]),
                    datadescription = ValueManager.GetString(data.Rows[0]["description"]),
                    state = ValueManager.GetString(data.Rows[0]["state"])
                };
            }
            return result;
        }

        public static List<DataEntity> Get(DictionaryRequest request)
        {
            string selectSQL = string.Empty;
            if(!string.IsNullOrEmpty(request.Name))
                selectSQL = string.Format(@"
                        select *, 'new' as state,'master' as flowtype from data where name ilike '{0}' limit {1}
                    ", request.Name, request.Length);
            else if (!string.IsNullOrEmpty(request.Term))
                selectSQL = string.Format(@"
                        select *, 'new' as state,'master' as flowtype from data where name ilike '%{0}%' limit {1}
                    ", request.Term, request.Length);
            else 
                selectSQL = string.Format(@"
                    select data.*,system_data.state,system_data.flowtype from system_data inner join data on system_data.data_id=data.id where system_data.system_id = {0} 
                ", request.ID);


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
                    var dt = GetEntity(row);
                    dt.state = ValueManager.GetString(row["state"]);
                    dt.flowtype = ValueManager.GetString(row["flowtype"]);
                    dt.pod= ValueManager.GetString(row["pod"]);
                    dt.refid = request.ID;
                    result.Add(dt);
                }
            }
            return result;
        }
        private static DataEntity GetEntity(DataRow row)
        {
            return new DataEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                name = ValueManager.GetString(row["name"])
            };
        }
        public static SystemDataEntity Save(SystemDataEntity entity){

            DataEntity dt = ADataManager.Get(entity.dataid);
            dt.name=entity.data;
            dt.description=entity.datadescription;
            dt = ADataManager.Save(dt);

            string insertSQL = @"insert into system_data 
                    (system_id,data_id,flowtype,state)
                    values (@system_id,@data_id,@flowtype,@state)
                    returning id
            ";
            string updateSQL = @"update system_data set 
                            system_id=@system_id,
                            data_id=@data_id,
                            flowtype=@flowtype,
                            state=@state
                where id=@id
            ";
            using (DataManager manager=new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("system_id", entity.systemid),
                    new DataParameter("data_id", dt.id),
                    new DataParameter("flowtype", ValueManager.GetValueOrDBNull(entity.flowtype)),
                    new DataParameter("state", (string.IsNullOrEmpty(entity.state)?"exist":entity.state))
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
            string deleteSQL = @"
                DELETE FROM system_data WHERE ID = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }

    }
}
