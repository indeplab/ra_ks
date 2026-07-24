using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ra.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DictionaryController : ControllerBase
    {
        // GET: api/<DictionaryController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Dictionary service";
            return Ok(info);
        }

        // POST api/<DictionaryController>
        [HttpPost]
        public async Task<object> Post([FromBody] DictionaryRequest request)
        {
            List<DictionaryEntity> result = await DictionaryManager.Get(request.Name, request.Term, request.Length);
            return Ok(result);
        }
    }
}
