using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Web.Modules;
using Web.Models;
using System;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"System dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return SystemManager.Get(id);
        }
        [HttpGet("parent")]
        public ActionResult<object> GetParentListtBy(int id = 0, string type = "", int length = 20)
        {
            return SystemManager.GetParentListtBy(id, type, length);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(string type, string term, int length)
        {
            return SystemManager.GetA(type, term, length);
        }
        [HttpGet("list")]
        public ActionResult<object> GetList(DictionaryRequest request)
        {
            return Post(request);
        }
        // POST api/<SystemController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<SystemEntity> result = SystemManager.Get(request);
            return Ok(result);
        }
        // PUT api/<SystemController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] SystemEntity value)
        {
            SystemEntity entity = SystemManager.Save(value);
            return Ok(entity);
        }
        // DELETE api/<SystemController>
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
