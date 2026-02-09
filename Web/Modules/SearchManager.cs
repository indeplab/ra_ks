using DA;
using System.Collections.Generic;
using System.Data;
using Web.Models;
using Web.UI;

namespace Web.Modules
{
    public class SearchManager
    {
        public static List<SearchResultEntity> Get(SearchEntity search)
        {
            string selectSQL = "";
            List = new FilterParameterCollection();
            switch(search.type){
                case "system":
                case "function":
                case "data":
                    selectSQL = string.Format(@"
                        select id,name,description, '{3}' as entitytype, '{3}' as subtype, '' as img, '' as link from {3} 
                        " + GetQueryByType(search.type,search).ToStringWhere("name ilike '%{0}%' or description ilike '%{0}%'") +@"
                        limit {1} offset {2}
                    ", search.term, search.length, search.page * search.length, search.type);
                break;
                case "interface":
                    selectSQL = string.Format(@"
                        select interface.id,interface.name,
                            concat('Поставщик: ', s.name, ', потребитель: ', c.name) as description, 
                            'interface' as entitytype, 
                            '{3}' as subtype
                            , '' as img, '' as link 
                        from 
                            interface 
                            left join system c on interface.consumer_id=c.id
                            left join system s on interface.supply_id=s.id
                        " + GetQueryByType("interface",search).ToStringWhere("interface.name ilike '%{0}%' or interface.description ilike '%{0}%'") +@"
                        limit {1} offset {2}
                    ", search.term, search.length, search.page * search.length, search.type);
                break;
                case "server":
                    selectSQL = string.Format(@"
                        select 
                            netobject.id,netobject.name,netobject.description, netobject_type.name as entitytype, '{3}' as subtype, netobject_type.image as img, '' as link
                        from 
                            netobject 
                            inner join netobject_type on netobject_type_id=netobject_type.id
                        " + GetQueryByType(search.type,search).ToStringWhere("netobject.name ilike '%{0}%' or netobject.ip ilike '%{0}%' or netobject.description ilike '%{0}%'") +@"
                        limit {1} offset {2}
                    ", search.term, search.length, search.page * search.length, search.type);
                break;
                case "doc":
                    selectSQL = string.Format(@"
                        select doc.id,doc.name,
                            concat('Автор: ', doc.author, ', обновлен: ', to_char(doc.date,'dd.MM.yyyy HH:MI:SS')) as description, 
                            doc_type.name as entitytype, 
                            '{3}' as subtype
                            , '' as img, '' as link
                        from doc 
                        left join doc_type on coalesce(doc.type_id, 2)=doc_type.id
                        " + GetQueryByType("doc",search).ToStringWhere(@"
                            doc.name ilike '%{0}%' 
                            or doc.description ilike '%{0}%' 
                            or doc.author ilike '%{0}%' 
                            or doc.project ilike '%{0}%'
                            or doc.id in (select doc_id from doc_link where name ilike '%{0}%')
                        ") +@"
                        union
                        select content.id,content.name,content.description, 'document' as entitytype, case when content.islink then '' else 'content' end as subtype, content_type.image as img, content.src as link
                        from content 
                        left join content_type on content.type_id = content_type.id
                        where content.name ilike '%{0}%' 
                        union
                        select id, concat('Протокол AC №',cast(number as varchar(5)),' от ', to_char(date, 'dd.mm.yyyy')) as name,'' as description, 'council' as entitytype, 'council' as subtype, '' as img, '' as link from council 
                        " + GetQueryByType("council",search).ToStringWhere("concat('Протокол AC №',cast(number as varchar(5)),' от ', to_char(date, 'dd.mm.yyyy')) ilike '%{0}%'") +@"
                        limit {1} offset {2}
                    ", search.term, search.length, search.page * search.length, search.type);
                break;
                default:
                    selectSQL = string.Format(@"
                        select id,name,description, 'system' as entitytype, 'system' as subtype, '' as img, '' as link from system 
                        " + GetQueryByType("system",search).ToStringWhere("name ilike '%{0}%' or description ilike '%{0}%'") +@"
                        union
                        select id,name,description, 'function' as entitytype, 'function' as subtype, '' as img, '' as link from function 
                        " + GetQueryByType("function",search).ToStringWhere("name ilike '%{0}%' or description ilike '%{0}%'") +@"
                        union
                        select interface.id,interface.name,
                            concat('Поставщик: ', s.name, ', потребитель: ', c.name) as description, 
                            'interface' as entitytype,
                            'interface' as subtype 
                            , '' as img, '' as link
                        from 
                            interface 
                            left join system c on interface.consumer_id=c.id
                            left join system s on interface.supply_id=s.id
                        " + GetQueryByType("interface",search).ToStringWhere("interface.name ilike '%{0}%' or interface.description ilike '%{0}%'") +@"
                        union
                        select id,name,description, 'data' as entitytype, 'data' as subtype, '' as img, '' as link from data 
                        " + GetQueryByType("data",search).ToStringWhere("name ilike '%{0}%' or description ilike '%{0}%'") +@"
                        union
                        select 
                            netobject.id,netobject.name,netobject.description, netobject_type.name as entitytype, 'server' as subtype, netobject_type.image as img, '' as link
                        from 
                            netobject 
                            inner join netobject_type on netobject_type_id=netobject_type.id
                        " + GetQueryByType("server",search).ToStringWhere("netobject.name ilike '%{0}%' or netobject.ip ilike '%{0}%' or netobject.description ilike '%{0}%'") +@"
                        union
                        select doc.id,doc.name,
                            concat('Автор: ',doc.author, ', обновлен: ', to_char(doc.date,'dd.MM.yyyy HH:MI:SS')) as description, 
                            doc_type.shortname as entitytype,
                            'doc' as subtype 
                            , '' as img, '' as link
                        from doc 
                        left join doc_type on coalesce(doc.type_id, 2)=doc_type.id
                        " + GetQueryByType("doc",search).ToStringWhere(@"
                            doc.name ilike '%{0}%' 
                            or doc.description ilike '%{0}%' 
                            or doc.author ilike '%{0}%' 
                            or doc.project ilike '%{0}%'
                            or doc.id in (select doc_id from doc_link where name ilike '%{0}%')
                        ") +@"
                        union
                        select content.id,content.name,content.description, 'document' as entitytype, case when content.islink then '' else 'content' end as subtype, content_type.image as img, content.src as link 
                        from content 
                        left join content_type on content.type_id = content_type.id
                        where content.name ilike '%{0}%' 
                        union
                        select id, concat('Протокол AC №',cast(number as varchar(5)),' от ', to_char(date, 'dd.mm.yyyy')) as name,'' as description, 'council' as entitytype, 'council' as subtype, '' as img, '' as link from council 
                        " + GetQueryByType("council",search).ToStringWhere("concat('Протокол AC №',cast(number as varchar(5)),' от ', to_char(date, 'dd.mm.yyyy')) ilike '%{0}%'") +@"
                        limit {1} offset {2}
                    ", search.term, search.length, search.page * search.length);
                break;
            }

            List<SearchResultEntity> result = new List<SearchResultEntity>();
            DataTable data = null;
            using(DataManager manager = new DataManager())
            {
                data = manager.GetDataTable(selectSQL, List.ToDataParameterArray());
            }
            if (data != null)
            {
                foreach(DataRow row in data.Rows)
                {
                    var name = ValueManager.GetString(row["name"]);
                    var description = ValueManager.GetString(row["description"]);
                    result.Add(new SearchResultEntity() { 
                        id= ValueManager.GetInt(row["id"]),
                        name = name,
                        type = ValueManager.GetString(row["entitytype"]),
                        subtype = ValueManager.GetString(row["subtype"]),
                        description = description,
                        img = ValueManager.GetString(row["img"]),
                        link = ValueManager.GetString(row["link"])
                    });
                }
            }
            return result;
        }
    
        private static FilterParameterCollection List = new FilterParameterCollection();
        private static QueryAndCollection GetQueryByType(string type, SearchEntity filter){

            QueryAndCollection query = new QueryAndCollection();
            QueryAndCollection and;
            QueryOrCollection or;

            //system
            and = new QueryAndCollection();
            if (!string.IsNullOrEmpty(filter["sys_name"])){
                and.Parameters.Add("system.name ilike @sys_name");
                List.Add("sys_name",string.Concat("%", filter["sys_name"], "%"));
            }
            bool sys_consumer = ValueManager.GetBoolean(filter["sys_consumer"]);
            bool sys_supply = ValueManager.GetBoolean(filter["sys_supply"]);
            or = new QueryOrCollection();
            if(sys_consumer)
                or.Parameters.Add("system.id in (select consumer_id from interface)");
            if(sys_supply)
                or.Parameters.Add("system.id in (select supply_id from interface)");
            and.Parameters.Add(or.ToString());

            switch(type){
                case "system":
                    query.Parameters.Add(and.ToString());
                break;
                case "function":
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("function.id in (select system_function.function_id from system_function inner join system on system_function.system_id=system.id {0})", and.ToStringWhere()));
                break;
                case "interface":
                    if (!string.IsNullOrEmpty(filter["sys_name"])){
                        or = new QueryOrCollection();
                        if(sys_consumer || !sys_consumer && sys_consumer==sys_supply)
                            or.Parameters.Add("consumer_id in (select id from system where name ilike @sys_name)");
                        if(sys_supply || !sys_supply && sys_consumer==sys_supply)
                            or.Parameters.Add("supply_id in (select id from system where name ilike @sys_name)");
                        query.Parameters.Add(or.ToString());
                    }
                break;
                case "data":
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("id in (select system_data.data_id from system_data inner join system on system_data.system_id=system.id {0})", and.ToStringWhere()));
                break;
                case "server":
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("netobject.id in (select system_netobject.netobject_id from system_netobject inner join system on system_netobject.system_id=system.id {0})", and.ToStringWhere()));
                break;
                case "council":
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("council.id in (select council_system.council_id from council_system inner join system on council_system.system_id=system.id {0})", and.ToStringWhere()));
                break;
                case "doc":
                    if (!string.IsNullOrEmpty(filter["sys_name"]))
                        and.Parameters.Add("system.name ilike @sys_name or doc_link.name ilike @sys_name");
                    if(!and.IsEmpty) {
                        and.Parameters.Add("doc_link.type='system'");
                        query.Parameters.Add(string.Format("doc.id in (select doc_link.doc_id from doc_link inner join system on doc_link.ref_id=system.id {0})", and.ToStringWhere()));
                    }
                break;
            }

            // function
            and = new QueryAndCollection();
            if (!string.IsNullOrEmpty(filter["fn_name"])){
                and.Parameters.Add("function.name ilike @fn_name");
                List.Add("fn_name",string.Concat("%", filter["fn_name"], "%"));
            }
            if (!string.IsNullOrEmpty(filter["fn_service"]))
                List.Add("fn_service",string.Concat("%", filter["fn_service"], "%"));

            switch(type){
                case "system":
                    if (!string.IsNullOrEmpty(filter["fn_service"]))
                        and.Parameters.Add("system_function.method ilike @fn_service");

                    if(!and.IsEmpty) query.Parameters.Add(string.Format("system.id id in (select system_function.system_id from system_function inner join function on system_function.function_id=function.id {0})", and.ToStringWhere()));
                break;
                case "function":
                    query.Parameters.Add(and.ToString());
                    if (!string.IsNullOrEmpty(filter["fn_service"]))
                        query.Parameters.Add("function.id in (select system_function.system_id from system_function where system_function.method ilike @fn_service)");
                break;
                case "interface":
                    if (!string.IsNullOrEmpty(filter["fn_name"]))
                        query.Parameters.Add("consumer_function_id in (select id from function where name ilike @fn_name) or supply_function_id in (select id from function where name ilike @fn_name)");
                    if (!string.IsNullOrEmpty(filter["fn_service"]))
                        query.Parameters.Add("interface.consumer_method ilike @fn_service");
                break;
                case "data":
                    if (!string.IsNullOrEmpty(filter["fn_name"]) || !string.IsNullOrEmpty(filter["fn_service"]))
                        query.Parameters.Add("0=1"); // no data
                break;
                case "doc":
                    and = new QueryAndCollection();
                    if (!string.IsNullOrEmpty(filter["fn_name"]))
                        and.Parameters.Add("function.name ilike @fn_name or doc_link.name ilike @fn_name");
                    if (!string.IsNullOrEmpty(filter["fn_service"]))
                        and.Parameters.Add("function.id in (select system_function.function_id from system_function where method ilike @fn_service)");

                    if(!and.IsEmpty) {
                        and.Parameters.Add("doc_link.type='function'");
                        query.Parameters.Add(string.Format("doc.id in (select doc_link.doc_id from doc_link inner join function on doc_link.ref_id=function.id {0})", and.ToStringWhere()));
                    }
                break;
            }

            // data
            and = new QueryAndCollection();
            if (!string.IsNullOrEmpty(filter["dt_name"])){
                and.Parameters.Add("data.name ilike @dt_name");
                List.Add("dt_name",string.Concat("%", filter["dt_name"], "%"));
            }
            bool dt_master = ValueManager.GetBoolean(filter["dt_master"]);
            bool dt_transfer = ValueManager.GetBoolean(filter["dt_transfer"]);
            bool dt_copy = ValueManager.GetBoolean(filter["dt_copy"]);
            or = new QueryOrCollection();
            if(dt_master)
                or.Parameters.Add("system_data.flowtype = 'master'");
            if(dt_copy)
                or.Parameters.Add("system_data.flowtype = 'copy'");
            if(dt_transfer)
                or.Parameters.Add("system_data.flowtype = 'transfer'");
            switch(type){
                case "system":
                    and.Parameters.Add(or.ToString());
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("system.id in (select system_data.system_id from system_data inner join data on system_data.data_id=data.id {0})", and.ToStringWhere()));
                break;
                case "function":
                    if (!string.IsNullOrEmpty(filter["dt_name"])) 
                        query.Parameters.Add("0=1"); // no data
                break;
                case "interface":
                    //and.Parameters.Add(or.ToString()); // no flow data for interface
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("interface.id in (select interface_data.interface_id from interface_data inner join data on interface_data.data_id=data.id {0})", and.ToStringWhere()));
                break;
                case "data":
                    query.Parameters.Add(and.ToString());
                break;
                case "doc":
                    and = new QueryAndCollection();
                    if (!string.IsNullOrEmpty(filter["dt_name"])){
                        and.Parameters.Add("data.name ilike @dt_name or doc_link.name ilike @dt_name");
                    }
                    if(!and.IsEmpty) {
                        and.Parameters.Add("doc_link.type='data'");
                        query.Parameters.Add(string.Format("doc.id in (select doc_link.doc_id from doc_link inner join data on doc_link.ref_id=data.id {0})", and.ToStringWhere()));
                    }
                break;
            }

            // server
            and = new QueryAndCollection();
            if (!string.IsNullOrEmpty(filter["srv_name"])){
                and.Parameters.Add("(netobject.name ilike @srv_name or netobject.ip ilike @srv_name or netobject.description ilike @srv_name)");
                List.Add("srv_name",string.Concat("%", filter["srv_name"], "%"));
            }
            switch(type){
                case "system":
                    and.Parameters.Add(or.ToString());
                    if(!and.IsEmpty) query.Parameters.Add(string.Format("system.id in (select system_netobject.system_id from system_netobject inner join netobject on system_netobject.netobject_id=netobject.id {0})", and.ToStringWhere()));
                break;
                case "server":
                    query.Parameters.Add(and.ToString());
                break;
                case "":
                break;
                default:
                    if (!string.IsNullOrEmpty(filter["srv_name"])) 
                        query.Parameters.Add("0=1"); // no data
                break;
            }

            // doc
            and = new QueryAndCollection();
            if (!string.IsNullOrEmpty(filter["doc_name"])){
                and.Parameters.Add("doc.name ilike @doc_name");
                List.Add("doc_name",string.Concat("%", filter["doc_name"], "%"));
            }

            bool doc_design = ValueManager.GetBoolean(filter["doc_design"]);
            bool doc_concept = ValueManager.GetBoolean(filter["doc_concept"]);
            or = new QueryOrCollection();
            if(doc_concept)
                or.Parameters.Add("doc.type_id = 1");
            if(doc_design)
                or.Parameters.Add("doc.type = 2");
            and.Parameters.Add(or.ToString());

            bool doc_state_develop = ValueManager.GetBoolean(filter["doc_state_develop"]);
            bool doc_state_accept = ValueManager.GetBoolean(filter["doc_state_accept"]);
            bool doc_state_process = ValueManager.GetBoolean(filter["doc_state_process"]);
            bool doc_state_reject = ValueManager.GetBoolean(filter["doc_state_reject"]);
            List<string> ls =new List<string>();
            if(doc_state_develop) ls.Add("0");
            if(doc_state_accept) ls.Add("1");
            if(doc_state_process) ls.Add("2");
            if(doc_state_reject) ls.Add("3");
            if(ls.Count>0)
                and.Parameters.Add(string.Format("doc.state_id in ({0})", string.Join(",", ls.ToArray())));

            if(!and.IsEmpty){
                switch(type){
                    case "system":
                        and.Parameters.Add("doc_link.type='system'");
                        query.Parameters.Add(string.Format("system.id in (select doc_link.ref_id from doc_link inner join doc on doc_link.doc_id=doc.id {0})", and.ToStringWhere()));
                    break;
                    case "function":
                        and.Parameters.Add("doc_link.type='function'");
                        query.Parameters.Add(string.Format("function.id in (select doc_link.ref_id from doc_link inner join doc on doc_link.doc_id=doc.id {0})", and.ToStringWhere()));
                    break;
                    case "interface":
                        and.Parameters.Add("doc_link.type='interface'");
                        query.Parameters.Add(string.Format("interface.id in (select doc_link.ref_id from doc_link inner join doc on doc_link.doc_id=doc.id {0})", and.ToStringWhere()));
                    break;
                    case "data":
                        and.Parameters.Add("doc_link.type='data'");
                        query.Parameters.Add(string.Format("data.id in (select doc_link.ref_id from doc_link inner join doc on doc_link.doc_id=doc.id {0})", and.ToStringWhere()));
                    break;
                    case "doc":
                        query.Parameters.Add(and.ToString());
                    break;
                }
            }
            return (query);
        }

    }
}
