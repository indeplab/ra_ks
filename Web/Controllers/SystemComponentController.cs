using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;
using Web.UI;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemComponentController : BaseListController
    {
        protected override string key => "systemcomponent_filter";
        // GET: api/<SystemPlatformController>
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"System component service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }

        // POST api/<SystemPlatformController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemEntity value)
        {
            SystemEntity entity = SystemComponentManager.Link(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemComponentManager.Unlink(id);
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
            var manager = new SystemComponentManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    system.ID,
                    system.Name,
                    system.Description,
                    (select value from system_metric where system_id = system.id and name='Тип АС') as Type
                FROM 
                    system
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
    }
}
