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
    public class NetzoneController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Netzone dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return NetzoneManager.Get(id);
        }
        // POST api/<SystemController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<NetzoneEntity> result = NetzoneManager.Get(request);
            return Ok(result);
        }
        // PUT api/<SystemController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] NetzoneEntity value)
        {
            NetzoneEntity entity = NetzoneManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                NetzoneManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
