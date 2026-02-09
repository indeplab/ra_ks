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
    public class NetobjectListController : BaseListController
    {

        protected override string key => "netobjectlist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Netobject list service";
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
            var manager = new NetobjectListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    netobject.ID,
                    netobject.Name,
                    netobject.ip,
                    netobject.Description
                FROM 
                    netobject
                    left join netzone z on netobject.netzone_id = z.id
                    left join netzone dc on netobject.netdc_id = dc.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new NetobjectListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    netobject.ID,
                    netobject.Name,
                    netobject.ip,
                    netobject_type.name as type,
                    netobject.Description,
                    z.name as zone,
                    dc.name as datacenter

                FROM 
                    netobject
                    left join netobject_type on netobject.netobject_type_id = netobject_type.id
                    left join netzone z on netobject.netzone_id = z.id
                    left join netzone dc on netobject.netdc_id = dc.id
            ");
            DataTable data = NetobjectListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    {"type", "Тип"},
                    { "name", "Наименование" },
                    { "ip", "IP адрес" },
                    { "zone", "Сетевой сегмент" },
                    { "datacenter", "ЦОД" },
                    {"description" , "Описание" }
                },
                new string[] { "ID" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
