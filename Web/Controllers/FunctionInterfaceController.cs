using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FunctionInterfaceController : InterfaceListController
    {
        protected override string key => "functioninterface_filter";

    }
}
