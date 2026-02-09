using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FunctionController : ControllerBase
    {
        // GET: api/<FunctionController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"System function service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return FunctionManager.Get(id);
        }
        [HttpGet("a")]
        public ActionResult<object> GetA(string type, string term, int length)
        {
            return FunctionManager.GetA(type, term, length);
        }
        [HttpGet("list")]
        public ActionResult<object> GetList(DictionaryRequest request)
        {
            return Post(request);
        }
        // POST api/<FunctionController>
        [HttpPost]
        public ActionResult<object> Post([FromBody] DictionaryRequest request)
        {
            List<FunctionEntity> result = FunctionManager.Get(request);
            return Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] FunctionEntity value)
        {
            FunctionEntity entity = FunctionManager.Save(value);
            return Ok(entity);
        }
        [HttpPut("changeparent")]
        public ActionResult<object> PutParentList([FromBody] FunctionEntity[] children)
        {
            try
            {
                FunctionManager.ChangeParent(children);
                return Ok(new{});
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
                SystemFunctionManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("supply/{id}")]
        public ActionResult<object> DeleteAsSupply(int id)
        {
            InterfaceEntity _int = InterfaceManager.Get(id);
            _int.supplyfunctionid = 0;
            _int.supplyfunctionname = string.Empty;
            InterfaceManager.Save(_int);
            return Ok();
        }
        [HttpDelete("consumer/{id}")]
        public ActionResult<object> DeleteAsConsumer(int id)
        {
            InterfaceEntity _int = InterfaceManager.Get(id);
            _int.consumerfunctionid = 0;
            _int.consumerfunctionname = string.Empty;
            InterfaceManager.Save(_int);
            return Ok();
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                FunctionManager.Delete(id);
                return Ok(new{});
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
