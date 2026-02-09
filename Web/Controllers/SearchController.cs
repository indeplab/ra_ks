using Microsoft.AspNetCore.Mvc;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        // GET: api/<SearchController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Search service";
            return Ok(info);
        }

        [HttpPost]
        public ActionResult<object> Get([FromBody] SearchEntity search)
        {
            var result = SearchManager.Get(search);
            return Ok(result);
        }
    }
}
