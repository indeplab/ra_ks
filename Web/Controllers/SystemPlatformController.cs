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
    public class SystemPlatformController : BaseListController
    {
        protected override string key => "systemplatform_filter";
        // GET: api/<SystemPlatformController>
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"System platform service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }
        /*public ActionResult<object> Get(int id)
        {
            return SystemPlatformManager.Get(id);
        }*/
        [HttpPost("lista")]
        public ActionResult<object> GetList([FromBody] DictionaryRequest request)
        {
            List<SystemPlatformEntity> result = SystemPlatformManager.GetList(request);
            return Ok(result);
        }
        // POST api/<SystemPlatformController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] SystemPlatformEntity entity)
        {
            return Ok(SystemPlatformManager.Get(entity.id));
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemPlatformEntity value)
        {
            SystemPlatformEntity entity = SystemPlatformManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemPlatformManager.Delete(id);
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
            var manager = new SystemPlatformManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    system_platform.ID,
                    system_platform.system_id,
                    system_platform.Name,
                    system_platform.Description,
                    system_platform.Value,
                    CASE system_platform.type 
                        WHEN 'os' THEN 'Операционная система'
                        WHEN 'dbos' THEN 'Операционная система СУБД'
                        WHEN 'app' THEN 'Софт прикладной'
                        WHEN 'sys' THEN 'Софт системный'
                        WHEN 'containerapp' THEN 'Платформа управления контейнерами'
                        WHEN 'container' THEN 'Средство контейнеризации'
                        WHEN 'db' THEN 'СУБД'
                        WHEN 'cos' THEN 'Клиентская операционная система'
                        WHEN 'virt' THEN 'Система виртуализации'
                        ELSE 'Среда разработки'
                    END as type
                FROM 
                    system_platform
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
    }
}
