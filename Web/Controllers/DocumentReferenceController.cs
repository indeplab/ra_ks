using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Web.Modules;
using Web.UI;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentReferenceController : BaseListController
    {

        protected override string key => "documentreaference_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Documents list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }

        [HttpPost("list")]
        public ActionResult<object> GetList([FromBody] FilterEntity filter)
        {
            var manager = new DocumentReferenceManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    doc.ID,
                    CONCAT(CASE WHEN COALESCE(doc.project,'')<>'' THEN CONCAT(doc.project, '. ') ELSE '' END, CASE WHEN COALESCE(doc_type.name,'')<>'' THEN ' ' ELSE '' END, doc.name) as name,
                    doc.author,
                    doc.date,
                    doc_state.name as state,
                    doc.Description
                FROM 
                    doc 
                    left join doc_state on COALESCE(doc.state_id,1)=doc_state.id
                    left join doc_type on COALESCE(doc.type_id,2)=doc_type.id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }

    }
}
