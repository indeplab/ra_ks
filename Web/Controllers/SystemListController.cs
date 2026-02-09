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
    public class SystemListController : BaseListController
    {

        protected override string key => "systemlist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"System list service";
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
            var manager = new SystemListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System.ID,
                    System.Name,
                    System.Description,
                    p.name as ParentName,
                    t.name as TargetName,
                    system.start_date,
                    system.end_date,
                    (select value from system_metric where system_id = system.id and name='Тип АС') as Type,
                    (select value from system_metric where system_id = system.id and name='Менеджер ИТ') as ManagerIT
                FROM 
                    system
                    left join system p on system.parent_id=p.id
                    left join system t on system.target_id=t.id
                    
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new SystemListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System.ID,
                    System.Name,
                    System.Description,
                    p.name as ParentName,
                    t.name as TargetName,
                    case when system.start_date='-infinity'::timestamp or system.start_date='infinity'::timestamp then null else system.start_date end start_date,
                    case when system.end_date='-infinity'::timestamp or system.end_date='infinity'::timestamp then null else system.end_date end end_date
                FROM 
                    system
                    left join system p on system.parent_id=p.id
                    left join system t on system.target_id=t.id
                    
            ");
            DataTable data = SystemListManager.MapColumn(manager.GetSystemDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "name", "Наименование" },
                    { "parentname", "Родительская АС" },
                    { "targetname", "Целевая АС" },
                    { "start_date", "Дата ввода в эксплуатацию" },
                    { "end_date", "Дата вывода из эксплуатации" },
                    {"description" , "Описание" }
                },
                new string[] { "system_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
