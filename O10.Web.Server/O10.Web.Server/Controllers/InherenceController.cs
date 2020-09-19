using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using O10.Client.Common.Entities;
using O10.Web.Server.Services.Inherence;

namespace O10.Web.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InherenceController : ControllerBase
    {
        private readonly IInherenceServicesManager _inherenceServicesManager;

        public InherenceController(IInherenceServicesManager inherenceServicesManager)
        {
            _inherenceServicesManager = inherenceServicesManager;
        }

        [AllowAnonymous]
        [HttpGet]
        public ActionResult<IEnumerable<InherenceServiceInfo>> GetInherenceServices()
        {
            return Ok(_inherenceServicesManager.GetAll()?
                .Select(s =>
                new InherenceServiceInfo
                {
                    Name = s.Name,
                    Alias = s.Alias,
                    Description = s.Description,
                    Target = s.Target
                }));
        }
    }
}
