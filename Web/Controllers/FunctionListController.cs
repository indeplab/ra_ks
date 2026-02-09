using ExcelTool;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text.Json;
using Web.Modules;
using Web.UI;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FunctionListController : BaseListController
    {

        protected override string key => "functionlist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Function list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }

        [HttpPost("list")]
        public ActionResult<object> Post([FromBody] FilterEntity filter)
        {
            var manager = new FunctionListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                select	
                    function.*, 
                    function.name as function_name,
	                a1.type_name,
                    a1.method,
                    '' as img_value,
	                COALESCE(a1.type_id,0) as type_id,
                    COALESCE(a1.type,'function') as type_code
                from
	                function
	                left join 
                (
                select
	                system_function.id as type_id,
                    system.id as type_id2,
	                system_function.function_id,
	                system.Name as type_name,
	                system_function.method,
	                'systemFunction' as type
                from
	                system_function
	                inner join system on system_function.system_id=system.id
                union
                select
	                id as type_id,
                    0 as type_id2,
	                supply_function_id as function_id,
	                name as type_name,
	                consumer_method as method,
	                'supply' as type
                from
	                interface
                union
                select
	                id as type_id,
                    0 as type_id2,
	                consumer_function_id as function_id,
	                name as type_name,
	                '' as method,
	                'consumer' as type
                from
	                interface
	                ) a1 on a1.function_id=function.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new FunctionListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                select	
                    function.*, 
                    function.name as function_name,
	                a1.type_name,
                    a1.method,
                    '' as img_value,
	                COALESCE(a1.type_id,0) as type_id,
                    COALESCE(a1.type,'function') as type_code
                from
	                function
	                left join 
                (
                    select
                        system_function.id as type_id,
                        system.id as type_id2,
                        system_function.function_id,
                        system.Name as type_name,
                        system_function.method,
                        'systemFunction' as type
                    from
                        system_function
                        inner join system on system_function.system_id=system.id
                    union
                    select
                        id as type_id,
                        0 as type_id2,
                        supply_function_id as function_id,
                        name as type_name,
                        consumer_method as method,
                        'supply' as type
                    from
                        interface
                    union
                    select
                        id as type_id,
                        0 as type_id2,
                        consumer_function_id as function_id,
                        name as type_name,
                        '' as method,
                        'consumer' as type
                    from
                        interface
                        ) a1 on a1.function_id=function.id
            ");
            DataTable data = FunctionListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "name", "Наименование" },
                    { "method", "Сервис функции" },
                    { "type_name", "Используется в" },
                    { "description", "Описание" }
                },
                new string[] { "pod", "img_value", "type_id", "type_code", "function_name" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }
    }
}
