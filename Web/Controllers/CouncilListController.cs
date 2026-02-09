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
    public class CouncilListController : BaseListController
    {

        protected override string key => "councillist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Council list service";
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
            var manager = new CouncilListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    council.id,
                    council.number,
                    council.date,
                    council.decision_file as decision,
                    string_agg(system.name,', ') as system
                FROM 
                    council
                    left join council_system on council.id=council_system.council_id
                    left join system on council_system.system_id = system.id
                {where}
                group by
                    council.id,
                    council.number,
                    council.date,
                    council.decision_file
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new CouncilListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    council.id,
                    council.number,
                    council.date,
                    string_agg(system.name,', ') as system
                FROM 
                    council
                    left join council_system on council.id=council_system.council_id
                    left join system on council_system.system_id = system.id
                {where}
                group by
                    council.id,
                    council.number,
                    council.date
            ");
            DataTable data = CouncilListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "number", "Номер" },
                    { "date", "Дата" },
                    { "system", "Затрагиваемые системы"},
                    { "question", "Вопрос" },
                    { "speaker", "Докладчик" },
                    { "division", "Подразделение" },
                    { "agenda", "Повестка" },
                    { "decision" , "Решение" }
                },
                new string[] { "id", "ci_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
