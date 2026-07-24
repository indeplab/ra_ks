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
        public ActionResult<object> Get(string id)
        {
            return FunctionManager.Get(id);
        }
        // POST api/<FunctionController>
        [HttpPost]
        public async Task<object> Post([FromBody] DictionaryRequest2 request)
        {
            List<FunctionEntity> result = await FunctionManager.Get(request);
            return Ok(result);
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] FunctionEntity value)
        {
            //FunctionEntity entity = FunctionManager.Save(value);
            return Ok();//(entity);
        }
        [HttpDelete("system/{id}")]
        public ActionResult<object> DeleteFromSystem(int id)
        {
            try
            {
                //SystemFunctionManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("supply/{id}")]
        public ActionResult<object> DeleteAsSupply(string id)
        {
            /*InterfaceEntity _int = InterfaceManager.Get(id);
            _int.supplyfunctionid = 0;
            _int.supplyfunctionname = string.Empty;
            InterfaceManager.Save(_int);*/
            return Ok();
        }
        [HttpDelete("consumer/{id}")]
        public ActionResult<object> DeleteAsConsumer(string id)
        {
            /*InterfaceEntity _int = InterfaceManager.Get(id);
            _int.consumerfunctionid = "0";
            _int.consumerfunctionname = string.Empty;
            InterfaceManager.Save(_int);*/
            return Ok();
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                //FunctionManager.Delete(id);
                return Ok(new{});
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
