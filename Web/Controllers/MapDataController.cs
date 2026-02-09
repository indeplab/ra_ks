using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Web.Models;
using Web.Modules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ra.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MapDataController : ControllerBase
    {
        // GET: api/<MapDataController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"MapData service";
            return Ok(info);
        }

        [HttpGet]
        public ActionResult<object> Get(int id)
        {
            return MapDataManager.Get(id);
        }
        [HttpGet("list")]
        public ActionResult<object> GetList()
        {
            return Ok(MapDataManager.GetList());
        }
        [HttpPut]
        public ActionResult<object> Put([FromBody] MapDataEntity value)
        {
            MapDataEntity entity = MapDataManager.Save(value);
            return Ok(entity);
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                MapDataManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
