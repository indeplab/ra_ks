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
    public class SystemEventController : BaseListController
    {

        protected override string key => "systemevent_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Systems event list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }
        [HttpPost]
        public ActionResult<object> Post([FromBody] SystemEventEntity entity)
        {
            return Ok(SystemEventManager.Get(entity.id));
        }

        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemEventEntity value)
        {
            SystemEventEntity entity = SystemEventManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemEventManager.Delete(id);
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
            var manager = new SystemEventManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    system_event.ID,
                    system_event.Date,
                    system_event.system_id,
                    system.name as system,
                    system_event.Name,
                    system_event.state,
                    system_event.type,
                    system_event.Description
                FROM 
                    system_event
                    inner join system on system_event.system_id=system.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
        [HttpPost("excel")]
        public ActionResult<object> ToExcel([FromBody] FilterEntity filter)
        {
            var manager = new SystemEventManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    system_event.ID,
                    system_event.Date,
                    system_event.system_id,
                    system.name as system,
                    system_event.Name,
                    system_event.state,
                    system_event.type,
                    system_event.Description
                FROM 
                    system_event
                    inner join system on system_event.system_id=system.id
            ");
            DataTable data = SystemEventManager.MapColumn(manager.GetDataTable(),
                new Dictionary<string, string>()
                {
                    { "id", "Код" },
                    { "date", "Дата события" },
                    { "type", "Тип события" },
                    { "name", "Событие" },
                    { "system", "Система" },
                    { "state", "Статус" },
                    {"description" , "Описание" }
                },
                new string[] { "system_id" }
            );
            ExcelDocument excel = new ExcelDocument(data);
            return File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
        }

    }
}
