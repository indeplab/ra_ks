using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemMetricController : ControllerBase
    {
        // GET: api/<SystemPlatformController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"System metric service";
            return Ok(info);
        }

        [HttpGet("list")]
        public ActionResult<object> GetList(DictionaryRequest2 request)
        {
            return Post(request);
        }
        [HttpPost]
        public async Task<ActionResult<object>> Post([FromBody] DictionaryRequest2 request)
        {
            List<MetricEntity> result = await SystemMetricManager.GetList(request);
            return Ok(result);
        }
        [HttpPost("checklist")]
        public ActionResult<object> GetCheckList(DictionaryRequest2 request)
        {
            //List<object> result = SystemMetricManager.GetCheckList(request);
            return Post(request);//Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemEntity value)
        {
            //SystemMetricManager.Save(value.id, value.metrics, value.metricEntityid);
            return Ok(new { });
        }
    }
}
