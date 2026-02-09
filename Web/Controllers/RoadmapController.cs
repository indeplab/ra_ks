using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Text.Json;
using Web.Modules;
using Web.UI;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoadmapController : BaseListController
    {

        protected override string key => "roadmap_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Roadmap service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }
        [HttpGet("legend")]
        public ActionResult<object> GetLegend(string metric)
        {
            List<object> result = RoadmapManager.GetLegend(metric);
            return Ok(result);
        }

        [HttpPost("list")]
        public ActionResult<object> Post([FromBody] FilterEntity filter)
        {
            var manager = new RoadmapManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT 
                    System.ID,
                    System.Name,
                    System.Description,
                    system_event.type,
                    system_event.name as event,
                    system_event.state,
                    system_event.description as note,
                    dictionary.img,
                    dictionary.color,
                    case when system_event.date='-infinity'::timestamp or system_event.date='infinity'::timestamp then null else system_event.date end date,
                    coalesce(system_metric.value,'Требует принятия решения') as target_state
                FROM 
                    system
                    inner join system_event on system.id = system_event.system_id
                    inner join dictionary on dictionary.name = 'Статусы событий' and system_event.state=dictionary.value
                    left join system_metric on system.id = system_metric.system_id and system_metric.name='Целевой статус'
                    
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }
    }
}
