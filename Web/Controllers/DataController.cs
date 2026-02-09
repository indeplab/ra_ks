using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataController : ControllerBase
    {
        // GET: api/<DataController>
        [HttpGet("about")]
        [Authorize(Roles = "Administrator")]
        public ActionResult<string> Get()
        {
            string info = @"System data service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return ADataManager.Get(id);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(string type, string term, int length)
        {
            return ADataManager.GetA(type, term, length);
        }
        [HttpGet("list")]
        public ActionResult<object> GetList(DictionaryRequest request)
        {
            return Post(request);
        }
        // POST api/<DataController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<DataEntity> result = ADataManager.Get(request);
            return Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] DataEntity value)
        {
            DataEntity entity = ADataManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                ADataManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("system/{id}")]
        public ActionResult<object> DeleteFromSystem(int id)
        {
            try
            {
                SystemDataManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("interface/{id}")]
        public ActionResult<object> DeleteFromInterface(int id)
        {
            try
            {
                InterfaceDataManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
