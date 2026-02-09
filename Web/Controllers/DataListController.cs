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
    public class DataListController : BaseListController
    {

        protected override string key => "datalist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Data list service";
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
            var manager = new DataListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                select	
                    data.*, 
                    data.name as data_name,
	                a1.type_name,
                    CASE a1.flowtype 
                        WHEN 'master' THEN 'Мастер-данные'
                        WHEN 'copy' THEN 'Копия данных'
                        WHEN 'transfer' THEN 'Не храниться'
                        WHEN 'flow' THEN 'Передается'
                        ELSE ''
                    END as flow_type,
                    '' as img_value,
	                COALESCE(a1.type_id1,0) as type_id1,
	                COALESCE(a1.type_id2,0) as type_id2,
                    COALESCE(a1.type,'data') as type_code
                from
	                data
	                left join 
                (
                select
	                system_data.id as type_id1,
                    system_data.id as type_id2,
                    system.id as type_id3,
	                system_data.data_id,
	                system.Name as type_name,
	                system_data.flowtype,
	                'systemData' as type
                from
	                system_data
	                inner join system on system_data.system_id=system.id
                union
                select
	                interface.id as type_id1,
                    interface_data.id as type_id2,
                    0 as type_id3,
	                interface_data.data_id,
	                interface.name as type_name,
	                'flow' as flowtype,
	                'interface' as type
                from
	                interface_data
	                inner join interface on interface_data.interface_id=interface.id
	                ) a1 on a1.data_id=data.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new DataListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                select	
                    data.*, 
                    data.name as data_name,
	                a1.type_name,
                    CASE a1.flowtype 
                        WHEN 'master' THEN 'Мастер-данные'
                        WHEN 'copy' THEN 'Копия данных'
                        WHEN 'transfer' THEN 'Не храниться'
                        WHEN 'flow' THEN 'Передается'
                        ELSE ''
                    END as flow_type,
                    '' as img_value,
	                COALESCE(a1.type_id1,0) as type_id1,
	                COALESCE(a1.type_id2,0) as type_id2,
                    COALESCE(a1.type,'data') as type_code
                from
	                data
	                left join 
                (
                select
	                system_data.id as type_id1,
                    system_data.id as type_id2,
                    system.id as type_id3,
	                system_data.data_id,
	                system.Name as type_name,
	                system_data.flowtype,
	                'system_data' as type
                from
	                system_data
	                inner join system on system_data.system_id=system.id
                union
                select
	                interface.id as type_id1,
                    interface_data.id as type_id2,
                    0 as type_id3,
	                interface_data.data_id,
	                interface.name as type_name,
	                'flow' as flowtype,
	                'interface_data' as type
                from
	                interface_data
	                inner join interface on interface_data.interface_id=interface.id
	                ) a1 on a1.data_id=data.id
            ");
            DataTable data = DataListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "name", "Наименование" },
                    { "flow_type", "Тип" },
                    { "type_name", "Используется в" },
                    { "description", "Описание" },
                    { "interfacedata", "Передаваемые данные" }
                },
                new string[] { "pod", "img_value", "type_id1", "type_id2", "type_code", "data_name" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
