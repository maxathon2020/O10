using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using O10.Client.DataLayer.Enums;
using O10.Core.ExtensionMethods;
using O10.Client.Web.Common.Services;
using O10.Client.Common.Entities;
using O10.Client.DataLayer.Services;
using O10.Client.DataLayer.Model.Scenarios;
using System.Collections.Generic;
using O10.Core.Logging;
using Newtonsoft.Json;
using O10.Web.Server.Helpers;
using O10.Web.Server.Services;

namespace O10.Web.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountsController : ControllerBase
    {
        private IAccountsServiceEx _accountsService;
        private readonly IExecutionContextManager _executionContextManager;
        private readonly IDataAccessService _dataAccessService;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;

        public AccountsController(IAccountsServiceEx accountsService, IExecutionContextManager executionContextManager,
            IDataAccessService dataAccessService, ILoggerService loggerService, IOptions<AppSettings> appSettings)
        {
            if (loggerService is null)
            {
                throw new ArgumentNullException(nameof(loggerService));
            }

            if (appSettings is null)
            {
                throw new ArgumentNullException(nameof(appSettings));
            }

            _accountsService = accountsService;
            _executionContextManager = executionContextManager;
            _dataAccessService = dataAccessService;
            _logger = loggerService.GetLogger(nameof(AccountsController));
            _appSettings = appSettings.Value;
        }
    }
}
