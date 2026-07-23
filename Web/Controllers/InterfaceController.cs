using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Threading.Tasks;
using ExcelTool;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Web.Models;
using Web.Modules;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterfaceController : ControllerBase
    {
        // GET: api/<InterfaceController>
        [HttpGet("about")]
        public ActionResult<string> Get()
        {
            string info = @"System interface service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get(string id)
        {
            return InterfaceManager.Get(id);
        }

        [HttpGet("a")]
        public async Task<object> Get(string cid, string sid, string did)
        {
            if (!string.IsNullOrEmpty(did))
                return Ok();//InterfaceManager.GetByData(did));
            return Ok(await InterfaceManager.GetA(cid, sid));
        }
        /*[HttpGet]
        public ActionResult<object> Get(int? intid, int cid, int sid, string term, int length)
        {
            if (intid != null)
                return InterfaceManager.Get(intid.GetValueOrDefault(0));
            return Post(
                new DictionaryRequest()
                {
                    ID = cid,
                    ID2 = sid,
                    Term = term,
                    Length = length
                }
            );
        }*/
        [HttpPost]
        public async Task<object> Post([FromBody] DictionaryRequest2 request)
        {
            List<InterfaceEntity> result = await InterfaceManager.Get(request.ID, request.ID2, request.Term, request.Length);
            return Ok(result);
        }
        // PUT api/<InterfaceController>
        [HttpPut]
        public ActionResult<object> Put([FromBody] InterfaceEntity value)
        {
            return Ok();//InterfaceManager.Save(value));
        }
        [HttpPut("uploadlist")]
        public ActionResult<object> Post([FromForm] IFormFile file)
        {
            DataTable data = null;
            string res = null;
            string errors = null;//InterfaceManager.SaveFromFile(file, out data);
            /*if (data != null && data.Rows.Count > 0)
            {
                ExcelDocument excel = new ExcelDocument(data);
                res = excel.ToString();
                //res = File(new MemoryStream(excel.GetBytes()), "application/octet-stream");
                //return File(Excel.GetStreamFromDataTable(data), "application/octet-stream");
            }*/
            return Ok(new
            {
                messages = errors,
                data = res
            });
        }
        [HttpDelete("{id}")]
        public ActionResult<object> Delete(int id)
        {
            try
            {
                //InterfaceManager.Delete(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

    }
}
