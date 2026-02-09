using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Web.UI;

namespace Web.Controllers
{
    public class BaseListController : ControllerBase
    {
        protected virtual string key { get { return "baselist_filter"; } }
        protected FilterEntity GetFromKey()
        {
            FilterEntity filter = null;
            string data = HttpContext.Session.GetString(key);
            if (!string.IsNullOrEmpty(data))
            {
                try
                {
                    filter = JsonSerializer.Deserialize<FilterEntity>(data);
                }
                catch
                {
                    filter = new FilterEntity();
                }
            }
            return (filter ?? new FilterEntity());
        }
    }
}
