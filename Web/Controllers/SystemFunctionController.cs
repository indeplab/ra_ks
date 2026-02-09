using ExcelTool;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text.Json;
using Web.Models;
using Web.Modules;
using Web.UI;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemFunctionController : BaseListController
    {

        protected override string key => "systemfunction_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Systems function list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(long sysid, string term, int length)
        {
            return SystemFunctionManager.GetA(sysid, term, length);
        }
        [HttpPost]
        public ActionResult<object> Post([FromBody] SystemFunctionEntity entity)
        {
            return Ok(SystemFunctionManager.Get(entity.id));
        }

        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemFunctionEntity value)
        {
            SystemFunctionEntity entity = SystemFunctionManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemFunctionManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("list")]
        public ActionResult<object> GetList([FromBody] FilterEntity filter)
        {
            var manager = new SystemFunctionManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_function.ID,
                    System_function.system_id,
                    system.name as system,
                    function.Name,
                    system_function.Method,
                    function.Description
                FROM 
                    system_function
                    inner join function on system_function.function_id=function.id
                    inner join system on system_function.system_id=system.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new SystemFunctionManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_function.ID,
                    System_function.system_id,
                    system.name as system,
                    function.Name,
                    system_function.Method,
                    function.Description
                FROM 
                    system_function
                    inner join function on system_function.function_id=function.id
                    inner join system on system_function.system_id=system.id
            ");
            DataTable data = SystemFunctionManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "method", "Метод" },
                    { "system", "Система" },
                    { "name", "Функция" },
                    {"description" , "Описание" }
                },
                new string[] { "system_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
