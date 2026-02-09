using DA;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection.Emit;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class DashboardManager
    {
        public static DashboardEntity Get(long id)
        {
            string selectSQL = string.Format(@"
                select * from dashboard where id = {0}
            ", id);
            DashboardEntity result = new DashboardEntity();
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
        public static List<DashboardEntity> GetList()
        {
            string selectSQL = string.Format(@"
                select * from dashboard
            ");
            List<DashboardEntity> result = new List<DashboardEntity>();
            DataTable data = null;
            using (DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL);
            }
            if (data != null && data.Rows.Count > 0)
            {
                foreach(DataRow row in data.Rows)
                    result.Add(GetEntity(row));
            }
            return result;
        }
        /*public static List<string[]> GetGrid(DashboardEntity entity){

            List<string[]> result=new List<string[]>();
            string selectMetricSQL="";
            switch(ValueManager.GetInt(entity.entity_id)){
                case 1: // АС
                    selectMetricSQL=string.Format(@"
                        select distinct value as name, ord from (
                            select distinct value, 1 as ord  from dictionary where name ilike '{0}'
                            union
                            select distinct value, 1 as ord from system_metric where name ilike '{0}'
                            union
                            select '<нет>' as value, 2 as ord
                        ) hm
                        order by ord, name
                    ", entity.hmetric);
                break;
            }
        
            StringBuilder sb = new StringBuilder();
            using (DataManager manager = new DataManager()){
                DataTable data = manager.GetDataTable(selectMetricSQL);
                foreach (DataRow row in data.Rows)
                    sb.AppendFormat(", '' as \"{0}\"", row["name"]);
            }
            string selectSQL="";
            switch(ValueManager.GetInt(entity.entity_id)){
                case 1: // АС
                    selectSQL = string.Format(@"
                        select 
                            vm.name as vmetric,
                            system.id,
                            system.name,
                            COALESCE(system.hmetric,'<нет>') hmetric,
                            COALESCE(system.vlmetric,'<нет>') vlmetric
                            {3}
                        from 
                            (
                                select distinct value as name, ord from (
                                    select distinct value, 1 as ord  from dictionary where name ilike '{0}'
                                    union
                                    select distinct value, 1 as ord from system_metric where name ilike '{0}'
                                    union
                                    select '<нет>' as value, 2 as ord
                                ) a1) vm
                            left join
                            (
                                select 
                                    system.id,
                                    system.name,
                                    COALESCE(vmetric.value,'<нет>') as vmetric,
                                    COALESCE(hmetric.value,'<нет>') as hmetric,
                                    COALESCE(vlmetric.value,'<нет>') as vlmetric
                                from 
                                    system
                                    left join system_metric vmetric on system.id=vmetric.system_id and vmetric.name='{0}'
                                    left join system_metric hmetric on system.id=hmetric.system_id and hmetric.name='{1}'
                                    left join system_metric vlmetric on system.id=vlmetric.system_id and vlmetric.name='{2}'
                            ) system on vm.name = system.vmetric
                        order by vm.ord, vm.name
                    ", entity.vmetric, entity.hmetric, entity.metric, sb.ToString());
                break;
            }
            DataTable dt;
            using (DataManager manager = new DataManager()){
                dt = manager.GetDataTable(selectSQL);
            }
            if(dt!=null){
                string[] rc = new string[dt.Columns.Count];
                for (int i=0; i<dt.Columns.Count;i++)
                    rc[i]=dt.Columns[i].ColumnName;
                result.Add(rc);
                foreach(DataRow row in dt.Rows){
                    string[] r = new string[dt.Columns.Count];
                    for (int i=0; i<dt.Columns.Count;i++)
                        r[i]=row[i].ToString();
                    result.Add(r);
                }
            }
            return result;
        }
        */

        public static List<DictionaryEntity> GetA(string type, string term, int length, string metric, string entityid){            

            var result = DictionaryManager.GetA(type, term, length, metric, entityid);
            switch (type.ToLower().Trim()){
                case "value":
                    if(entityid=="1" && metric.Equals("Родительская АС", StringComparison.OrdinalIgnoreCase) && (string.IsNullOrEmpty(term) || "Пусто".IndexOf(term, StringComparison.OrdinalIgnoreCase)!=-1)){
                        result.Add(new DictionaryEntity(){
                            name = "Пусто",
                            value = "Пусто"
                        });
                    }
                break;
                default:
                    if(entityid=="1" && (string.IsNullOrEmpty(term) || "Родительская АС".IndexOf(term, StringComparison.OrdinalIgnoreCase)!=-1))
                    {
                        result.Add(new DictionaryEntity(){
                            name = "Родительская АС",
                            value = "Родительская АС"
                        });
                    }
                    result.AddRange(DictionaryManager.GetA("value", term, length, metric, "7"));
                break;
            }
            return result;
        }

        public static GridEntity GetGrid(DashboardEntity entity){
            GridEntity result = new GridEntity();
            string selectVMetricSQL=string.Empty;
            string selectHMetricSQL=string.Empty;
            string selectMetricSQL=string.Empty;
            string selectLabelSQL = string.Empty;
            for (int i=0;i<entity.label.Length;i++)
            {
                selectLabelSQL += string.Format(@"
                    (select max(COALESCE(value,'')) from system_metric where system.id=system_metric.system_id and name='{0}') as label{1},
                ", entity.label[i],i);
            }
            string hmetric = "";
            foreach (string hm in entity.hmetric)
                hmetric += string.Format("'{0}',", hm);
            hmetric = entity.hmetric.Length > 0 ? hmetric.Substring(0, hmetric.Length - 1) : "''";
            string vmetric = "";
            foreach (string hm in entity.vmetric)
                vmetric += string.Format("'{0}',", hm);
            vmetric = entity.vmetric.Length > 0 ? vmetric.Substring(0, vmetric.Length - 1) : "''";
            switch (ValueManager.GetInt(entity.entity_id))
            {
                case 1: // АС
                    selectHMetricSQL = string.Format(@"
                        select distinct value as name, ord from (
                            select distinct value, ord  from dictionary where name in ({0})
                            union
                            select distinct value, 997 from system_platform where name in ({0}) and description <> 'Целевая'
                            union
                            select distinct value, 998 as ord from system_metric where name in ({0}) and not value in (select distinct value from dictionary where name in ({0}))
                            union
                            select '' as value, 999 as ord
                        ) hm
                        order by ord, name
                    ", hmetric);
                    selectVMetricSQL = string.Format(@"
                        select distinct value as name, ord from (
                            select distinct value, ord  from dictionary where name in ({0})
                            union
                            select distinct value, 997 from system_platform where name in ({0}) and description <> 'Целевая'
                            union
                            select distinct value, 998 as ord from system_metric where name in ({0}) and not value in (select distinct value from dictionary where name in ({0}))
                            union
                            select '' as value, 999 as ord
                        ) hm
                        order by ord, name
                    ", vmetric);
                    selectMetricSQL = string.Format(@"
                        select distinct
                            system.id,
                            system.name,
                            system.target_id,
                            system.parent_id,
                            {4}
                            COALESCE(vmetric.value,COALESCE(vpmetric.value,'')) as vmetric,
                            COALESCE(hmetric.value,COALESCE(hpmetric.value,'')) as hmetric,
                            COALESCE(vlmetric.value,'') as vlmetric,
                            COALESCE(d.color,'') as vlcolor
                        from 
                            system
                            left join system_metric vmetric on system.id=vmetric.system_id and vmetric.name in ({0})
                            left join system_metric hmetric on system.id=hmetric.system_id and hmetric.name in ({1})
                            left join system_platform vpmetric on system.id=vpmetric.system_id and vpmetric.name in ({0}) and vpmetric.description <> 'Целевая'
                            left join system_platform hpmetric on system.id=hpmetric.system_id and hpmetric.name in ({1}) and hpmetric.description <> 'Целевая'

                            left join system_metric vlmetric on system.id=vlmetric.system_id and vlmetric.name='{2}'
                            left join dictionary d on entity_id={3} and d.name = vlmetric.name and trim(d.value) = trim(vlmetric.value)
                    ", vmetric, hmetric, entity.metric, entity.entity_id, selectLabelSQL);
                    break;
            }
            DataTable dt;
            using (DataManager manager = new DataManager()){
                dt = manager.GetDataTable(selectVMetricSQL);
                if(dt!=null){
                    result.vmetric=new List<GridMetricEntity>();
                    foreach(DataRow row in dt.Rows){
                        result.vmetric.Add(new GridMetricEntity(){
                            name = ValueManager.GetString(row["name"]),
                            order = ValueManager.GetInt(row["ord"])
                        });
                    }
                }
                dt = manager.GetDataTable(selectHMetricSQL);
                if(dt!=null){
                    result.hmetric=new List<GridMetricEntity>();
                    foreach(DataRow row in dt.Rows){
                        result.hmetric.Add(new GridMetricEntity(){
                            name = ValueManager.GetString(row["name"]),
                            order = ValueManager.GetInt(row["ord"])
                        });
                    }
                }
                if(!string.IsNullOrEmpty(entity.filter)){
                    QueryAndCollection query = new QueryAndCollection();
                    string[] conditions= new string[]{"=","<>"};
                    foreach(string condition in entity.filter.Split(new string[]{";"},StringSplitOptions.RemoveEmptyEntries)){
                        foreach(string c in conditions){
                            if(condition.Split(c).Length==2){
                                string name = condition.Split(c)[0].Trim();
                                string value = condition.Split(c)[1].Trim();
                                if(name.Equals("Родительская АС", StringComparison.OrdinalIgnoreCase)){
                                    query.Parameters.Add(
                                        string.Format("COALESCE(system.parent_id){0}{1}"
                                            ,c, (value.Equals("Пусто", StringComparison.OrdinalIgnoreCase)?0:ValueManager.GetInt(value))
                                        )
                                    );
                                }
                                else
                                {
                                    query.Parameters.Add(
                                        string.Format("system.id in (select system_id from system_metric where trim(name)='{0}' and trim(value){2}'{1}')"
                                            ,name,value,c
                                        )
                                    );
                                }
                            }
                        }
                    }
                    selectMetricSQL+=query.ToStringWhere();
                }
                dt = manager.GetDataTable(selectMetricSQL);
                if (dt != null)
                {
                    result.metric = new List<GridValueEntity>();
                    foreach (DataRow row in dt.Rows)
                    {
                        GridValueEntity res = new()
                        {
                            id = ValueManager.GetInt(row["id"]),
                            targetid = ValueManager.GetInt(row["target_id"]),
                            parentid = ValueManager.GetInt(row["parent_id"]),
                            name = ValueManager.GetString(row["name"]),
                            color = ValueManager.GetString(row["vlcolor"]),
                            v = ValueManager.GetString(row["vmetric"]),
                            h = ValueManager.GetString(row["hmetric"]),
                            value = ValueManager.GetString(row["vlmetric"]),
                            labels = new List<object>()
                        };
                        for (int i = 0; i < entity.label.Length; i++)
                        {
                            var v = ValueManager.GetString(row["label" + i.ToString()]);
                            if (!string.IsNullOrWhiteSpace(v))
                            {
                                res.labels.Add(new
                                {
                                    name = entity.label[i],
                                    value = v
                                });
                            }
                        }
                        result.metric.Add(res);
                    }
                }
            }
            return result;
        }

        public class GridEntity{
            public List<GridMetricEntity> hmetric {get;set;}
            public List<GridMetricEntity>  vmetric {get;set;}
            public List<GridValueEntity> metric {get;set;}
        }
        public class GridMetricEntity{
            public string name {get;set;}
            public int order {get;set;}
        }
        public class GridValueEntity{
            public int id {get;set;}
            public int targetid {get;set;}
            public int parentid {get;set;}
            public string name {get;set;}
            public string color {get;set;}
            public string v {get;set;}
            public string h {get;set;}
            public string value {get;set;}
            public List<object> labels {get;set;}
        }

        private static DashboardEntity GetEntity(DataRow row)
        {
            return new DashboardEntity()
            {
                id = ValueManager.GetInt(row["id"]),
                entity_id = ValueManager.GetInt(row["entity_id"]),
                name = ValueManager.GetString(row["name"]),
                vmetric = ValueManager.GetString(row["vmetric_name"]).Split(";"),
                hmetric = ValueManager.GetString(row["hmetric_name"]).Split(";"),
                metric = ValueManager.GetString(row["metric_name"]),
                description = ValueManager.GetString(row["description"]),
                grouped = ValueManager.GetBoolean(row["grouped"]),
                filter = ValueManager.GetString(row["filter"]),
                orientation = ValueManager.GetString(row["orientation"])
            };
        }
        public static DashboardEntity Save(DashboardEntity entity)
        {
            string insertSQL = @"insert into dashboard (entity_id,name,description,vmetric_name,hmetric_name,metric_name,grouped,filter,orientation) values (@entity_id,@name,@description,@vmetric_name,@hmetric_name,@metric_name,@grouped,@filter,@orientation) returning id";
            string updateSQL = @"update dashboard set entity_id=@entity_id,name=@name,description=@description,vmetric_name=@vmetric_name,hmetric_name=@hmetric_name,metric_name=@metric_name,grouped=@grouped,filter=@filter,orientation=@orientation where id=@id";

            using (DataManager manager = new DataManager())
            {
                DataParameter[] p = new DataParameter[]
                {
                    new DataParameter("id", entity.id),
                    new DataParameter("entity_id", entity.entity_id),
                    new DataParameter("name", ValueManager.GetValueOrDBNull(entity.name)),
                    new DataParameter("description", ValueManager.GetValueOrDBNull(entity.description)),
                    new DataParameter("vmetric_name", ValueManager.GetValueOrDBNull(entity.vmetric)),
                    new DataParameter("hmetric_name", ValueManager.GetValueOrDBNull(entity.hmetric)),
                    new DataParameter("metric_name", ValueManager.GetValueOrDBNull(entity.metric)),
                    new DataParameter("grouped", entity.grouped),
                    new DataParameter("filter", ValueManager.GetValueOrDBNull(entity.filter)),
                    new DataParameter("orientation", ValueManager.GetValueOrDBNull(entity.orientation))
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
                delete from dashboard where id = @id
            ";
            using (DataManager manager = new DataManager())
            {
                manager.ExecuteNonQuery(deleteSQL, new DataParameter("id", id));
            }
        }
   }
}
