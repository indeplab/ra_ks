using System;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Dashboard service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return DashboardManager.Get(id);
        }
        [HttpGet("list")]
        public ActionResult<object> GetList()
        {
            return Ok(DashboardManager.GetList());
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(string type, string term, int length, string metric, string entityid)
        {
            var result = DashboardManager.GetA(type, term, length, metric, entityid);
            return Ok(result);
        }
        [HttpPost("grid")]
        public ActionResult<object> GetGrid([FromBody] DashboardEntity value)
        {
            return Ok(DashboardManager.GetGrid(value));
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] DashboardEntity value)
        {
            DashboardEntity entity = DashboardManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                DashboardManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
