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
    public class NetzoneListController : BaseListController
    {

        protected override string key => "netzonelist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Netzone list service";
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
            var manager = new NetzoneListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    netzone.ID,
                    netzone.Name,
                    netzone.Description,
                    netzone.color
                FROM 
                    netzone
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new NetzoneListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    netzone.ID,
                    netzone.Name,
                    netzone_type.name as type,
                    netzone.Description,
                    netzone.color
                FROM 
                    netzone
                    left join netzone_type on netzone.netzone_type_id = netzone_type.id
            ");
            DataTable data = NetzoneListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    {"type", "Тип"},
                    { "name", "Наименование" },
                    {"color" , "Цвет" },
                    {"description" , "Описание" }
                },
                new string[] { "ID" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
