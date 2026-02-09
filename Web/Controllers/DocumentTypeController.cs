using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ra.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentTypeController : ControllerBase
    {
        // GET: api/<DocumentStateController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Document type dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> GetList()
        {
            List<DocumentTypeEntity> result = DocumentTypeManager.Get();
            return Ok(result);
        }
    }
}
