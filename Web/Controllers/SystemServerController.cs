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
    public class SystemServerController : BaseListController
    {

        protected override string key => "systemserver_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Systems server list service";
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
            return SystemServerManager.GetA(sysid, term, length);
        }
        [HttpPost]
        public ActionResult<object> Post([FromBody] SystemServerEntity entity)
        {
            return Ok(SystemServerManager.Get(entity.id));
        }

        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemServerEntity value)
        {
            SystemServerEntity entity = SystemServerManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemServerManager.Delete(id);
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
            var manager = new SystemServerManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_netobject.ID,
                    System_netobject.system_id,
                    system.name as system,
                    netobject.Name,
                    netobject.IP,
                    netobject.Description
                FROM 
                    system_netobject
                    inner join netobject on system_netobject.netobject_id=netobject.id
                    inner join system on system_netobject.system_id=system.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new SystemServerManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System_netobject.ID,
                    System_netobject.system_id,
                    system.name as system,
                    netobject.Name,
                    netobject.IP,
                    netobject.Description
                FROM 
                    system_netobject
                    inner join netobject on system_netobject.netobject_id=netobject.id
                    inner join system on system_netobject.system_id=system.id
            ");
            DataTable data = SystemServerManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "ip", "IP адрес" },
                    { "system", "Система" },
                    { "name", "Сервер" },
                    {"description" , "Описание" }
                },
                new string[] { "system_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
