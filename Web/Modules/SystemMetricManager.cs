using DA;
using Microsoft.Extensions.ObjectPool;
using System.Collections.Generic;
using System.Data;
using Web.Models;

namespace Web.Modules
{
    public class SystemMetricManager
    {
        public static List<MetricEntity> GetList(DictionaryRequest request)
        {
            string selectSQL = string.Empty;
            int entityID=request.ID2==0?1:request.ID2;
            if (request.IsRecursion)
                selectSQL = string.Format(@"
                    select d.name,s.value,d.alias,d.requared, d.ord
	                from 
		                (select name, max(alias) as alias, bool_or(requared) as requared, max(ord) as ord from dictionary where entity_id={1} group by name) as d
		                left join (select * from system_metric where system_id={0} or system_id in (select id from system where parent_id={0})) as s on d.name=s.name
                    union
                    select name, max(value) as value, '' as alias, false, 0 as requared
                    from
                        system_metric 
                    where 
                        (system_id={0} or system_id in (select id from system where parent_id={0})) and name not in (select distinct name from dictionary)
                    group by name
                ", request.ID, entityID);
            else
                selectSQL = string.Format(@"
                    select d.name,s.value,d.alias,d.requared, d.ord
	                from 
		                (select name, max(alias) as alias, bool_or(requared) as requared, max(ord) as ord from dictionary where entity_id={1} group by name) as d
		                left join (select * from system_metric where system_id={0}) as s on d.name=s.name
                    union
                    select name,value,'' as alias,false,0 as requared
                    from
                        system_metric 
                    where 
                        system_id={0} and name not in (select distinct name from dictionary)
		        ", request.ID, entityID);
            List<MetricEntity> result = new List<MetricEntity>();
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

        public static List<object> GetCheckList(DictionaryRequest request)
        {
            string selectSQL = string.Format(@"
                select d.name,d.value,d.ord,d.color,(not s.value is null) as check
                from 
                    (select name, value, ord, color from dictionary where entity_id={1}) as d
                    left join (select * from system_metric where system_id={0}) as s on d.value=s.value
            ", request.ID, request.ID2==0?1:request.ID2);
            List<object> result = new List<object>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null)
            {
                foreach (DataRow row in data.Rows)
                {
                    result.Add(new{
                        name = ValueManager.GetString(row["name"]),
                        value = ValueManager.GetString(row["value"]),
                        order = ValueManager.GetString(row["ord"]),
                        color = ValueManager.GetString(row["color"]),
                        check = ValueManager.GetBoolean(row["check"])
                    });
                }
            }
            return result;
        }
        public static MetricEntity GetEntity(DataRow row)
        {
            return new MetricEntity()
            {
                name = ValueManager.GetString(row["name"]),
                value = ValueManager.GetString(row["value"]),
                alias = ValueManager.GetString(row["alias"]),
                requared = ValueManager.GetBoolean(row["requared"]),
                order = ValueManager.GetInt(row["ord"])
            };
        }
        public static void Save(long sysid, List<SystemMetricEntity> metricList, int entityID = 1)
        {
            string selectSQL = string.Format(@"
                select * from system_metric where system_id=@id and name in (select name from dictionary where entity_id={0})
            ", entityID);
            string deleteSQL = @"
                delete from system_metric where id=@id
            ";
            string updateSQL = @"
                update system_metric set value=@value where id=@id
            ";
            string insertSQL = @"
                insert into system_metric (system_id,name,value) values (@id,@name,@value)
            ";
            using (DataManager manager = new DataManager())
            {
                DataTable data = manager.GetDataTable(selectSQL, new DataParameter("id", sysid));
                foreach (SystemMetricEntity metric in metricList)
                {
                    if (!string.IsNullOrEmpty(metric.value))
                    {
                        DataRow[] rows = data.Select(string.Format("name ='{0}'", metric.name));
                        if (rows.Length == 0)
                            manager.ExecuteNonQuery(insertSQL, new DataParameter("id", sysid), new DataParameter("name", metric.name), new DataParameter("value", metric.value));
                        else
                        {
                            if (!metric.value.Equals(ValueManager.GetString(rows[0]["value"]), System.StringComparison.OrdinalIgnoreCase))
                                manager.ExecuteNonQuery(updateSQL, new DataParameter("id", ValueManager.GetInt(rows[0]["id"])), new DataParameter("value", metric.value));
                            data.Rows.Remove(rows[0]);
                        }
                    }
                }
                foreach (DataRow row in data.Rows)
                {
                    manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", ValueManager.GetInt(data.Rows[0]["id"])));
                }
            }
        }

    }
}
