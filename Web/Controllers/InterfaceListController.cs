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
    public class InterfaceListController : BaseListController
    {

        protected override string key => "interfacelist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Interface list service";
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
            var manager = new InterfaceListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    interface.ID,
                    interface.Name,
                    interface.Name as interfacename,
                    interface.interaction_type as interactiontype,
                    c.Name as consumername,
                    cf.Name as consumerfunction,
                    interface.consumer_connection as consumerconnection,
                    interface.supply_connection as supplyconnection,
                    interface.interaction_platform as interactionplatform,
                    s.Name as supplyname,
                    sf.Name as supplyfunction,
                    ssf.Method as supplymethod,
                    interface.consumer_id,
                    interface.supply_id,
                    interface.consumer_function_id,
                    interface.supply_function_id
                FROM 
                    interface
                    left join system c on interface.consumer_id=c.id
                    left join system s on interface.supply_id=s.id
                    left join system_function scf on interface.consumer_function_id=scf.function_id and interface.consumer_id=scf.system_id
                    left join system_function ssf on interface.supply_function_id=ssf.function_id and interface.supply_id=ssf.system_id
                    left join function cf on scf.function_id=cf.id
                    left join function sf on ssf.function_id=sf.id
                    
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new InterfaceListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    interface.ID,
                    interface.Name,
                    interface.Name as interfacename,
                    interface.interaction_type as interactiontype,
                    c.Name as consumername,
                    cf.Name as consumerfunction,
                    interface.consumer_connection as consumerconnection,
                    interface.supply_connection as supplyconnection,
                    interface.interaction_platform as interactionplatform,
                    s.Name as supplyname,
                    sf.Name as supplyfunction,
                    ssf.Method as supplymethod,
                    interface.consumer_id,
                    interface.supply_id,
                    interface.consumer_function_id,
                    interface.supply_function_id
                FROM 
                    interface
                    left join system c on interface.consumer_id=c.id
                    left join system s on interface.supply_id=s.id
                    left join system_function scf on interface.consumer_function_id=scf.function_id and interface.consumer_id=scf.system_id
                    left join system_function ssf on interface.supply_function_id=ssf.function_id and interface.supply_id=ssf.system_id
                    left join function cf on scf.function_id=cf.id
                    left join function sf on ssf.function_id=sf.id
                    
            ");
            DataTable data = InterfaceListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "name", "Наименование" },
                    { "consumername", "Потребитель" },
                    { "supplyname", "Поставщик" },
                    { "consumerfunction", "Функция потребителя" },
                    { "supplyfunction", "Функция поставщика" },
                    {"supplymethod" , "Сервис поставщика" },
                    {"interfacedata" , "Передаваемые данные" },
                    {"supplyconnection" , "Подключение поставщика" },
                    {"consumerconnection" , "Подключение потребителя" },
                    {"interactiontype" , "Тип подключения" },
                    {"interactionplatform" , "Интеграционная платформа" }
                },
                new string[] { "interfacename", "consumer_id", "supply_id", "consumer_function_id", "supply_function_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

        [HttpPost("template")]
        public ActionResult<object> GetExcelTemplate()
        {
            DataTable data = new DataTable();
            data.Columns.AddRange(new DataColumn[]
                {
                    new DataColumn("Код поставщика", typeof(int)),
                    new DataColumn("Код потребителя", typeof(int)),
                    new DataColumn("Название", typeof(string)),
                    new DataColumn("Интеграционная платформа", typeof(string))
                });
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
            //return File(Excel2.GetStreamFromDataTable(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }
    }
}
