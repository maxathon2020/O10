using Microsoft.AspNetCore.Mvc;
using O10.Client.Common.Interfaces;
using O10.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace O10.Web.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticController : ControllerBase
    {
        private readonly IGatewayService _gatewayService;

        public DiagnosticController(IGatewayService gatewayService)
        {
            _gatewayService = gatewayService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InfoMessage>>> GetInfo()
        {
            string version = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyFileVersionAttribute>().Version;
            List<InfoMessage> portalInfo = new List<InfoMessage> { new InfoMessage { Context = "Portal", InfoType = "Version", Message = version } };
            IEnumerable<InfoMessage> gatewayInfo;
            try
            {
                gatewayInfo = await _gatewayService.GetInfo().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                gatewayInfo = new List<InfoMessage> { new InfoMessage { Context = "Gateway", InfoType = "Error", Message = $"Failed to connect due to the error '{ex.Message}'" } };
            }

            return Ok(portalInfo.Concat(gatewayInfo));
        }
    }
}
