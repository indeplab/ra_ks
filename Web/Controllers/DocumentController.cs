using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [RequestFormLimits(KeyLengthLimit = 10000000)]
    public class DocumentController : ControllerBase
    {
        // GET: api/<DocumentController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Document data service";
            return Ok(info);
        }
        [HttpGet("list")]
        public ActionResult<string> GetList(string search, string type, string state, int length)
        {
            return Ok(DocumentManager.GetList(search, type, state, length));
        }
        /*[HttpGet("tag")]
        public ActionResult<string> GetByTag(string tag)
        {
            return Ok(DocumentManager.GetByTag(tag));
        }*/
        [HttpGet("getschema")]
        public ActionResult<DocumentManager.SchemaResponse> Get(long id, string type)
        {
            return Ok(DocumentManager.GetSchema(id, type));
        }
        [HttpGet("getschemaname")]
        public ActionResult<DocumentManager.SchemaResponse> GetName(long id, string type)
        {
            return Ok(DocumentManager.GetSchemaName(id, type));
        }
        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return Ok(DocumentManager.Get(id));
        }
        // POST api/<DocumentController>
        [HttpPost]
        public ActionResult<DocumentEntity> Post([FromBody] DocumentRequest request)
        {
            return Ok(DocumentManager.Save(request.doc, request.tags, request.list));
        }
        // POST api/<DocumentController>
        [HttpPost("savestate")]
        public ActionResult<long> SaveState([FromBody] DocumentEntity doc)
        {
            return Ok(DocumentManager.SaveState(doc));
        }
        // POST api/<DocumentController>s
        [HttpPost("setdeleted")]
        public ActionResult<long> SetDeleted([FromBody] DocumentEntity doc)
        {
            return Ok(DocumentManager.SetDeleted(doc));
        }
        // POST api/<DocumentController>s
        [HttpPost("saveschema")]
        public ActionResult<long> Post()
        {
            var form = HttpContext.Request.Form;
            long id;
            if (long.TryParse(form["id"], out id) && form.Files.Count > 0)
            {
                byte[] bytes = null;
                var file = form.Files[0];
                string type = form["type"];
                using (MemoryStream stream = new MemoryStream())
                {
                    form.Files[0].CopyTo(stream);
                    bytes = stream.ToArray();
                    stream.Flush();
                    stream.Close();
                }
                DocumentManager.SaveSchema(id, type, file.FileName, bytes);
            }
            else
                return StatusCode(StatusCodes.Status400BadRequest, "Неверный ID=" + form["id"]);
            return Ok(id);
            //return Ok(DocumentManager.Save(request.doc, request.list));
        }
        // POST api/<DocumentController>s
        [HttpPost("clearschema")]
        public ActionResult<long> Post([FromBody] SchemaRequest request)
        {
            DocumentManager.ClearSchema(request.id, request.type);
            return Ok(request.id);
        }
        // DELETE api/<DocumentController>
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                DocumentManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
    public class DocumentRequest
    {
        public DocumentEntity doc { get; set; }
        public List<DocumentTag> tags { get; set; }
        public List<string> list { get; set; }
    }
    public class SchemaRequest
    {
        public int id { get; set; }
        public string type { get; set; }
    }
    public class DocumentTag
    {
        public int id { get; set; }
        public string type { get; set; }
        public string name { get; set; }

    }

}
