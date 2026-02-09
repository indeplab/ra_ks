using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ra.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentStateController : ControllerBase
    {
        // GET: api/<DocumentStateController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Document state dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> GetList()
        {
            List<DocumentStateEntity> result = DocumentStateManager.Get();
            return Ok(result);
        }
    }
}
