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
    public class NetobjectController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Netobject dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return NetobjectManager.Get(id);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(int typeid, string term, int length)
        {
            List<DictionaryEntity> result = NetobjectManager.GetA(typeid, term, length);
            return Ok(result);
        }
        [HttpGet("type")]
        public ActionResult<object> GetTypeList()
        {
            List<object> result = NetobjectManager.GetTypeList();
            return Ok(result);
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
            List<NetobjectEntity> result = NetobjectManager.Get(request);
            return Ok(result);
        }
        // PUT api/<SystemController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] NetobjectEntity value)
        {
            NetobjectEntity entity = NetobjectManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                NetobjectManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
