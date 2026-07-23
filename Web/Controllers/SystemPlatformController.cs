using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
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

        [HttpPost("lista")]
        public async Task<object> GetList([FromBody] DictionaryRequest2 request)
        {
            List<SystemPlatformEntity> result = await SystemPlatformManager.GetList(request);
            return Ok(result);
        }
        // POST api/<SystemPlatformController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemPlatformEntity value)
        {
            //SystemPlatformEntity entity = SystemPlatformManager.Save(value);
            return Ok();//entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                //SystemPlatformManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
