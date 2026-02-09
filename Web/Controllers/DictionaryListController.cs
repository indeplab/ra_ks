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
    public class DictionaryListController : BaseListController
    {

        protected override string key => "dictionarylist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Dictionary list service";
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
            var manager = new DictionaryListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    dictionary.ID,
                    dictionary.Name,
                    dictionary.Value,
                    entity.name as entity,
                    dictionary.Description,
                    dictionary.ord,
                    case COALESCE(dictionary.color,'') when '' then 'white' else dictionary.color end as color
                FROM 
                    dictionary
                    left join entity on dictionary.entity_id=entity.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new DictionaryListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    dictionary.ID,
                    dictionary.Name,
                    dictionary.Value,
                    entity.name as entity,
                    dictionary.Description,
                    dictionary.ord,
                    dictionary.color
                FROM 
                    dictionary
                    left join entity on dictionary.entity_id=entity.id
            ");
            DataTable data = DictionaryListManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    {"entity", "Назначение"},
                    { "name", "Наименование" },
                    {"description" , "Описание" },
                    { "Value","Значение"},
                    {"color" , "Цвет" },
                    {"ord" , "Порядок" }
                },
                new string[] { "ID" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
