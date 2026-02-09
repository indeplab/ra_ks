using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemFileController : ControllerBase
    {
        // GET: api/<SystemPlatformController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"System file service";
            return Ok(info);
        }

        [HttpPost("list")]
        public ActionResult<object> GetList(DictionaryRequest request)
        {
            return Ok(SystemFileManager.GetList(request));
        }
        [HttpPost]
        public ActionResult<object> Post([FromForm] IFormFile file, [FromForm] string filestr)
        {
            return Ok(SystemFileManager.SaveForm(file, filestr));
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                SystemFileManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
