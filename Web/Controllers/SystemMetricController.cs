using System;
using System.Collections.Generic;
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
        public ActionResult<object> GetList(DictionaryRequest request)
        {
            return Post(request);
        }
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<MetricEntity> result = SystemMetricManager.GetList(request);
            return Ok(result);
        }
        [HttpPost("checklist")]
        public ActionResult<object> GetCheckList(DictionaryRequest request)
        {
            List<object> result = SystemMetricManager.GetCheckList(request);
            return Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemEntity value)
        {
            SystemMetricManager.Save(value.id, value.metrics, value.metricEntityid);
            return Ok(new { });
        }
    }
}
