using Microsoft.AspNetCore.Mvc;
using Web.Modules;
using Web.Models;
using System;
using Microsoft.AspNetCore.Http;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Content dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return ContentManager.Get(id);
        }
        [HttpGet("typelist")]
        public ActionResult<object> GetTypeList()
        {
            return ContentManager.GetTypeList();
        }
        [HttpGet("list")]
        public ActionResult<object> GetList(int partid)
        {
            return ContentManager.GetList(partid);
        }
        [HttpPost]
        public ActionResult<object> Post([FromForm] IFormFile file, [FromForm] string content)
        {
            return Ok(ContentManager.SaveForm(file, content));
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] ContentEntity value)
        {
            ContentEntity entity = ContentManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                ContentManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("file/{subpath}/{name}")]
        public ActionResult<object> DeleteIssure(string subpath, string name)
        {
            try
            {
                FileManager.Delete("coucil", subpath, name);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
