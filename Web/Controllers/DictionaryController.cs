using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ra.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DictionaryController : ControllerBase
    {
        // GET: api/<DictionaryController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return DictionaryManager.Get(id);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(string type, string term, int length, string metric, string entityid)
        {
            List<DictionaryEntity> result = DictionaryManager.GetA(type, term, length, metric, entityid);
            return Ok(result);
        }
        [HttpGet("entity")]
        public ActionResult<object> GetEntityList()
        {
            List<object> result = DictionaryManager.GetEntityList();
            return Ok(result);
        }
        // POST api/<DictionaryController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<DictionaryEntity> result = DictionaryManager.Get(request.Name, request.Term, request.Length);
            return Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] DictionaryEntity value)
        {
            DictionaryEntity entity = DictionaryManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                DictionaryManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
