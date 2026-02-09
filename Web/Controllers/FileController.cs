using Microsoft.AspNetCore.Mvc;
using Web.Modules;
using Web.Models;
using System;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"File service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Download(string type, string name)
        {
            FileEntity entity = FileManager.GetFile(type, name);
            if (entity == null)
                return NotFound();
            //return Ok(entity);
            return File(entity.content, entity.contentType, entity.name);
        }
        [HttpPost]
        public ActionResult<object> Download(FileEntity file)
        {
            FileEntity entity = FileManager.GetFile(file.type, file.name);
            if (entity == null)
                return NotFound();
            //return Ok(entity);
            return File(entity.content, entity.contentType, entity.name);
        }

        [HttpGet("text")]
        public ActionResult<string> ReadText(string filename)
        {
            try
            {
                return Ok(FileManager.ReadText(filename));
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpPut("text")]
        public ActionResult<object> WriteText(FileEntity file)
        {
            try
            {
                FileManager.WriteText(file.name, file.text);
                return Ok(new{});
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

    }
}
