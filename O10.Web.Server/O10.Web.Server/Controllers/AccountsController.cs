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
using O10.Web.Server.Dtos;
using O10.Web.Server.Dtos.User;
using O10.Core.Translators;
using O10.Client.DataLayer.Model;
using Microsoft.AspNetCore.Http;
using O10.Web.Server.Exceptions;
using O10.Client.Common.Exceptions;
using O10.Crypto.ConfidentialAssets;

namespace O10.Web.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountsServiceEx _accountsService;
        private readonly IExecutionContextManager _executionContextManager;
        private readonly IDataAccessService _dataAccessService;
        private readonly ITranslatorsRepository _translatorsRepository;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;

        public AccountsController(IAccountsServiceEx accountsService,
                                  IExecutionContextManager executionContextManager,
                                  IDataAccessService dataAccessService,
                                  ILoggerService loggerService,
                                  ITranslatorsRepository translatorsRepository,
                                  IOptions<AppSettings> appSettings)
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
            _translatorsRepository = translatorsRepository;
            _logger = loggerService.GetLogger(nameof(AccountsController));
            _appSettings = appSettings.Value;
        }

        [HttpPost("Authenticate")]
        public IActionResult Authenticate([FromBody] AccountDto accountDto)
        {
            _logger.LogIfDebug(() => $"[{accountDto.AccountId}]: Started authentication of the account {JsonConvert.SerializeObject(accountDto)}");

            var accountDescriptor = _accountsService.Authenticate(accountDto.AccountId, accountDto.Password);

            if (accountDescriptor == null)
            {
                throw new AccountAuthenticationFailedException(accountDto.AccountId);
            }

            if (accountDescriptor.AccountType == AccountType.User)
            {
                _executionContextManager.InitializeUtxoExecutionServices(accountDescriptor.AccountId, accountDescriptor.SecretSpendKey, accountDescriptor.SecretViewKey, accountDescriptor.PwdHash);
            }
            else
            {
                _executionContextManager.InitializeStateExecutionServices(accountDescriptor.AccountId, accountDescriptor.SecretSpendKey);
            }

            var forLog = new
            {
                accountDescriptor.AccountId,
                accountDescriptor.AccountType,
                accountDescriptor.AccountInfo,
                SecretSpendKey = accountDescriptor.SecretSpendKey.ToHexString(),
                PublicSpendKey = accountDescriptor.PublicSpendKey.ToHexString(),
                SecretViewKey = accountDescriptor.SecretViewKey.ToHexString(),
                PublicViewKey = accountDescriptor.PublicViewKey.ToHexString()
            };

            _logger.LogIfDebug(() => $"[{accountDto.AccountId}]: Authenticated account {JsonConvert.SerializeObject(forLog)}");

            return Ok(_translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(accountDescriptor));
        }

        [HttpPost("Start")]
        public IActionResult Start([FromBody] AccountDto accountDto)
        {
            _logger.LogIfDebug(() => $"[{accountDto.AccountId}]: Starting the account {JsonConvert.SerializeObject(accountDto)}");

            try
            {
                var account = _dataAccessService.GetAccount(accountDto.AccountId);
                var accountDescriptor = _translatorsRepository.GetInstance<Account, AccountDescriptor>()?.Translate(account);

                if (accountDescriptor == null)
                {
                    throw new AccountNotFoundException(accountDto.AccountId);
                }

                if (accountDescriptor.AccountType == AccountType.User)
                {
                    _executionContextManager.InitializeUtxoExecutionServices(accountDescriptor.AccountId, accountDescriptor.SecretSpendKey, accountDescriptor.SecretViewKey, accountDescriptor.PwdHash);
                }
                else
                {
                    _executionContextManager.InitializeStateExecutionServices(accountDescriptor.AccountId, accountDescriptor.SecretSpendKey);
                }

                var forLog = new
                {
                    accountDescriptor.AccountId,
                    accountDescriptor.AccountType,
                    accountDescriptor.AccountInfo,
                    SecretSpendKey = accountDescriptor.SecretSpendKey.ToHexString(),
                    PublicSpendKey = accountDescriptor.PublicSpendKey.ToHexString(),
                    SecretViewKey = accountDescriptor.SecretViewKey.ToHexString(),
                    PublicViewKey = accountDescriptor.PublicViewKey.ToHexString()
                };

                _logger.LogIfDebug(() => $"[{accountDto.AccountId}]: Authenticated account {JsonConvert.SerializeObject(forLog)}");

                return Ok(_translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(accountDescriptor));
            }
            catch (Exception ex)
            {
                _logger.Error($"[{accountDto.AccountId}]: failure during authentication", ex);
                throw;
            }
        }

        [HttpPost("BindingKey")]
        public IActionResult BindingKey([FromBody] BindingKeyRequestDto bindingKeyRequest)
        {
            var accountDescriptor = _accountsService.Authenticate(bindingKeyRequest.AccountId, bindingKeyRequest.Password);

            if (accountDescriptor == null)
            {
                throw new AccountAuthenticationFailedException(bindingKeyRequest.AccountId);
            }

            var persistency = _executionContextManager.ResolveUtxoExecutionServices(bindingKeyRequest.AccountId);
                persistency.BindingKeySource.SetResult(ConfidentialAssetsHelper.PasswordHash(bindingKeyRequest.Password));

            return Ok();
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] AccountDto accountDto)
        {
            try
            {
                long accountId = _accountsService.Create((AccountType)accountDto.AccountType, accountDto.AccountInfo, accountDto.Password);
                var accountDescriptor = _accountsService.GetById(accountId);
                return Ok(_translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(accountDescriptor));
            }
            catch (Exception ex)
            {
                return BadRequest(new { ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetAll(long scenarioId = 0, bool withPrivate = false, int ofTypeOnly = 0)
        {
            ScenarioSession scenarioSession = scenarioId > 0 ? _dataAccessService.GetScenarioSessions(User.Identity.Name).FirstOrDefault(s => s.ScenarioId == scenarioId) : null;
            if (scenarioSession != null)
            {
                IEnumerable<ScenarioAccount> scenarioAccounts = _dataAccessService.GetScenarioAccounts(scenarioSession.ScenarioSessionId);

                var accounts = _accountsService.GetAll()
                    .Where(a => scenarioAccounts.Any(sa => sa.AccountId == a.AccountId))
                    .Select(a => _translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(a));

                return Ok(accounts);
            }
            else
            {
                var accounts = _accountsService.GetAll()
                    .Where(a => (withPrivate || !a.IsPrivate) && (ofTypeOnly == 0 || (int)a.AccountType == ofTypeOnly))
                    .Select(a => _translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(a));

                return Ok(accounts);
            }
        }

        [HttpGet("{accountId}")]
        public IActionResult GetById(long accountId)
        {
            var accountDescriptor = _accountsService.GetById(accountId);
            var accountDto = _translatorsRepository.GetInstance<AccountDescriptor, AccountDto>().Translate(accountDescriptor);
            
            if(accountDto == null)
            {
                throw new AccountNotFoundException(accountId);
            }
            
            return Ok(accountDto);
        }

        [HttpPost("DuplicateUserAccount")]
        public IActionResult DuplicateUserAccount([FromBody] UserAccountReplicationDto userAccountReplication)
        {
            long accountId = _accountsService.DuplicateAccount(userAccountReplication.SourceAccountId, userAccountReplication.AccountInfo);

            if (accountId > 0)
            {
                return Ok();
            }

            return BadRequest();
        }

        [HttpPost("RemoveAccount")]
        public IActionResult RemoveAccount([FromBody] AccountDto account)
        {
            if (account != null)
            {
                _accountsService.Delete(account.AccountId);
                _executionContextManager.UnregisterExecutionServices(account.AccountId);
                return Ok();
            }

            return BadRequest();
        }

        [HttpPut("StopAccount/{accountId}")]
        public IActionResult StopAccount(long accountId)
        {
            _executionContextManager.UnregisterExecutionServices(accountId);
            return Ok();
        }

        [HttpPut("UserAccount")]
        public IActionResult OverrideUserAccount(long accountId, [FromBody] AccountOverrideDto accountOverride)
        {
            _logger.LogIfDebug(() => $"[{accountId}]: {nameof(OverrideUserAccount)} with {JsonConvert.SerializeObject(accountOverride, new ByteArrayJsonConverter())}");
            _accountsService.Override(AccountType.User, accountId, accountOverride.SecretSpendKey.HexStringToByteArray(), accountOverride.SecretViewKey.HexStringToByteArray(), accountOverride.Password, accountOverride.LastCombinedBlockHeight);

            _executionContextManager.UnregisterExecutionServices(accountId);
            return Ok();
        }

        [HttpGet("ResetCompromisedAccount")]
        public IActionResult ResetCompromisedAccount(long accountId, string password)
        {
            AccountDescriptor accountDescriptor = _accountsService.Authenticate(accountId, password);

            if (accountDescriptor != null)
            {
                _accountsService.ResetAccount(accountId, password);
                _executionContextManager.UnregisterExecutionServices(accountId);

                accountDescriptor = _accountsService.Authenticate(accountId, password);

                if (accountDescriptor.AccountType == AccountType.User)
                {
                    _executionContextManager.InitializeUtxoExecutionServices(accountId, accountDescriptor.SecretSpendKey, accountDescriptor.SecretViewKey, accountDescriptor.PwdHash);
                }
                else
                {
                    _executionContextManager.InitializeStateExecutionServices(accountId, accountDescriptor.SecretSpendKey);
                }

                return Ok();
            }
            else
            {
                throw new AccountAuthenticationFailedException(accountId);
            }
        }

        [HttpPost("KeyValues")]
        public IActionResult SetAccountKeyValues(long accountId, [FromBody] Dictionary<string, string> keyValues)
        {
            _dataAccessService.SetAccountKeyValues(accountId, keyValues);

            
            return Ok(_dataAccessService.GetAccountKeyValues(accountId));
        }

        [HttpDelete("KeyValues")]
        public IActionResult DeleteAccountKeyValues(long accountId, [FromBody] List<string> keys)
        {
            _dataAccessService.RemoveAccountKeyValues(accountId, keys);

            return Ok(_dataAccessService.GetAccountKeyValues(accountId));
        }

        [HttpGet("KeyValues")]
        public IActionResult GetAccountKeyValues(long accountId)
        {
            return Ok(_dataAccessService.GetAccountKeyValues(accountId));
        }

        private ObjectResult InternalServerError(Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { ex.Message });
        }
    }
}

