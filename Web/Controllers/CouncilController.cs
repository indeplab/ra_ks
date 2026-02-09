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
    public class CouncilController : ControllerBase
    {
        // GET: api/<SystemController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"Council dictionary service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return CouncilManager.Get(id);
        }
        [HttpPost]
        public ActionResult<object> Post([FromForm] IFormFile agenda, [FromForm] IFormFile decision, [FromForm] string council)
        {
            return Ok(CouncilManager.SaveForm(agenda, decision, council));
        }
        /*[HttpPost("file")]
        public ActionResult<object> PostFile([FromForm] IFormFile file)
        {
            return Ok();
        }*/
        [HttpPut]
        public ActionResult<object> Put([FromBody] CouncilEntity value)
        {
            CouncilEntity entity = CouncilManager.Save(value);
            return Ok(entity);
        }
        /*[HttpPut("issue")]
        public ActionResult<object> PutIssure([FromBody] CouncilIssueEntity value)
        {
            CouncilIssueEntity entity = CouncilManager.SaveIssue(value);
            return Ok(entity);
        }*/
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                CouncilManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        /*[HttpDelete("issue/{id}")]
        public ActionResult<object> DeleteIssure(int id)
        {
            try{
                CouncilManager.DeleteIssue(id);
                return Ok();
            }
            catch(Exception ex){
                return BadRequest(ex.Message);
            }
        }*/
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
