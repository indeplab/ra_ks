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
    public class AccountListController : BaseListController
    {

        protected override string key => "accountlist_filter";
        [HttpGet("about")]
        public ActionResult<string> GetInfo()
        {
            string info = @"Account list service";
            return Ok(info);
        }
        [HttpGet]
        public ActionResult<object> Get()
        {
            FilterEntity filter = GetFromKey();
            return Ok(filter.search);
        }

        [HttpPost("list")]
        public ActionResult<object> Post([FromBody] FilterEntity filter)
        {
            var manager = new UserListManager(GetFromKey());
            manager.ApplyFilter(GetFromKey(), filter.search, filter.rows, filter.param, @"
                SELECT distinct
                    staff.ID,
                    staff.Login,
                    staff.Name,
                    role.Description as role,
                    case COALESCE(staff.state_id,0)
                        when -1 then 'Подтверждение e-mail'
                        when 0 then 'Новая заявка'
                        when 1 then 'Активен'
                        when 2 then 'Заблокирован'
                    end as State
                FROM 
                    staff
                    left join staffrole on LOWER(staff.login) = LOWER(staffrole.staff_login)
                    left join role on role.id=staffrole.role_id
            ");
            manager.DataBind();
            HttpContext.Session.SetString(key, JsonSerializer.Serialize(manager.Filter));

            return Ok(manager.Filter);
        }

    }
}
