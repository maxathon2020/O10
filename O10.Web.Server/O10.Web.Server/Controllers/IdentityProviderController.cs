using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using O10.Client.Common.Entities;
using O10.Client.Common.Interfaces;
using O10.Client.DataLayer.Enums;
using O10.Client.DataLayer.Model;
using O10.Client.DataLayer.Services;
using O10.Core.ExtensionMethods;
using System.Globalization;
using Flurl;
using Flurl.Http;
using O10.Client.Web.Common.Services;
using O10.Client.Web.Common.Dtos.Biometric;
using System.Threading.Tasks;
using O10.Client.DataLayer.AttributesScheme;
using O10.Core.Cryptography;
using O10.Crypto.ConfidentialAssets;
using O10.Client.DataLayer.Model.Scenarios;
using O10.Core.Logging;
using Newtonsoft.Json;
using O10.Core.Translators;
using O10.Web.Server.Exceptions;
using System.Collections.ObjectModel;
using O10.Web.Server.Services;
using O10.Web.Server.Dtos.IdentityProvider;
using O10.Client.Common.Exceptions;

namespace O10.Web.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class IdentityProviderController : ControllerBase
    {
        private readonly IExecutionContextManager _executionContextManager;
        private readonly IAssetsService _assetsService;
        private readonly IDataAccessService _dataAccessService;
        private readonly IIdentityAttributesService _identityAttributesService;
        private readonly IAccountsServiceEx _accountsService;
        private readonly ITranslatorsRepository _translatorsRepository;
        private readonly ILogger _logger;

        public IdentityProviderController(
            IExecutionContextManager executionContextManager,
            IAssetsService assetsService,
            IDataAccessService dataAccessService,
            IIdentityAttributesService identityAttributesService,
            IAccountsServiceEx accountsService,
            ITranslatorsRepository translatorsRepository,
            ILoggerService loggerService)
        {
            _executionContextManager = executionContextManager;
            _assetsService = assetsService;
            _dataAccessService = dataAccessService;
            _identityAttributesService = identityAttributesService;
            _accountsService = accountsService;
            _translatorsRepository = translatorsRepository;
            _logger = loggerService.GetLogger(nameof(IdentityProviderController));
        }


        [HttpGet("All")]
        public IActionResult GetAll(long scenarioId = 0)
        {
            ScenarioSession scenarioSession = scenarioId > 0 ? _dataAccessService.GetScenarioSessions(User.Identity.Name).FirstOrDefault(s => s.ScenarioId == scenarioId) : null;
            if (scenarioSession != null)
            {
                IEnumerable<ScenarioAccount> scenarioAccounts = _dataAccessService.GetScenarioAccounts(scenarioSession.ScenarioSessionId);
                var identityProviders = _accountsService.GetAll().Where(a => a.AccountType == AccountType.IdentityProvider && scenarioAccounts.Any(sa => sa.AccountId == a.AccountId)).Select(a => new IdentityProviderInfoDto
                {
                    Id = a.AccountId.ToString(CultureInfo.InvariantCulture),
                    Description = a.AccountInfo,
                    Target = a.PublicSpendKey.ToHexString()
                });

                return Ok(identityProviders);
            }
            else
            {
                var identityProviders = _accountsService.GetAll().Where(a => !a.IsPrivate && a.AccountType == AccountType.IdentityProvider).Select(a => new IdentityProviderInfoDto
                {
                    Id = a.AccountId.ToString(CultureInfo.InvariantCulture),
                    Description = a.AccountInfo,
                    Target = a.PublicSpendKey.ToHexString()
                });

                return Ok(identityProviders);
            }
        }

        [AllowAnonymous]
        [HttpGet("ById/{accountId}")]
        public IActionResult GetById(long accountId)
        {
            AccountDescriptor account = _accountsService.GetById(accountId);

            if (account == null)
            {
                return BadRequest();
            }

            var identityProvider = new IdentityProviderInfoDto
            {
                Id = account.AccountId.ToString(CultureInfo.InvariantCulture),
                Description = account.AccountInfo,
                Target = account.PublicSpendKey.ToHexString()
            };

            return Ok(identityProvider);
        }

        [HttpPost("Identity")]
        public async Task<IActionResult> CreateIdentity(long accountId, [FromBody] IdentityDto identity)
        {
            //StatePersistency statePersistency = _executionContextManager.ResolveStateExecutionServices(accountId);
            AccountDescriptor account = _accountsService.GetById(accountId);

            //byte[] assetId = await _assetsService.GenerateAssetId(identity.RootAttribute.SchemeName, identity.RootAttribute.Content, account.PublicSpendKey.ToHexString()).ConfigureAwait(false);
            //statePersistency.TransactionsService.IssueBlindedAsset(assetId, 0UL.ToByteArray(32), out byte[] originatingCommitment);
            //identity.RootAttribute.OriginatingCommitment = originatingCommitment.ToHexString();

            IEnumerable<(string attributeName, string content)> attrs = await GetAttribitesAndContent(identity, account).ConfigureAwait(false);

            Identity identityDb = _dataAccessService.CreateIdentity(account.AccountId, identity.Description, attrs.ToArray());
            identity.Id = identityDb.IdentityId.ToString(CultureInfo.InvariantCulture);

            return Ok(identity.Id);
        }

        private async Task<IEnumerable<(string attributeName, string content)>> GetAttribitesAndContent(IdentityDto identity, AccountDescriptor account)
        {
            IEnumerable<(string attributeName, string content)> attrs;

            IdentitiesScheme rootScheme = _dataAccessService.GetRootIdentityScheme(account.PublicSpendKey.ToHexString());
            if (rootScheme != null)
            {
                IdentityAttributeDto rootAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == rootScheme.AttributeName);
                byte[] rootAssetId = await _assetsService.GenerateAssetId(rootScheme.AttributeSchemeName, rootAttribute.Content, account.PublicSpendKey.ToHexString()).ConfigureAwait(false);

                var protectionIdentityAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD);
                if (protectionIdentityAttribute != null)
                {
                    protectionIdentityAttribute.Content = rootAssetId.ToHexString();
                }

                attrs = identity.Attributes.Select(a => (a.AttributeName, a.Content));

                if (protectionIdentityAttribute == null)
                {
                    attrs = attrs.Append((AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, rootAssetId.ToHexString()));
                }
            }
            else
            {
                attrs = identity.Attributes.Select(a => (a.AttributeName, a.Content));
            }

            return attrs;
        }

        [HttpGet("GetIdentityById/{id}")]
        public IActionResult GetIdentityById(long id)
        {
            Identity identity = _dataAccessService.GetIdentity(id);

            if (identity != null)
            {
                return base.Ok(GetIdentityDto(identity));
            }

            return BadRequest();
        }

        private static IdentityDto GetIdentityDto(Identity identity) => new IdentityDto
        {
            Id = identity.IdentityId.ToString(CultureInfo.InvariantCulture),
            Description = identity.Description,
            Attributes = identity.Attributes.Select(
                    a => new IdentityAttributeDto
                    {
                        AttributeName = a.AttributeName,
                        Content = a.Content,
                        OriginatingCommitment = a.Commitment?.ToHexString()
                    }).ToArray(),
            //NumberOfTransfers = _dataAccessService.GetOutcomingTransactionsCountByOriginatingCommitment(identity.RootAttribute.Commitment)
        };

        [HttpGet("GetAllIdentities/{accountId}")]
        public IActionResult GetAllIdentities(long accountId)
        {
            IEnumerable<Identity> identities = _dataAccessService.GetIdentities(accountId);

            return Ok(identities?.Select(identity => GetIdentityDto(identity)));
        }

        [AllowAnonymous]
        [HttpGet("AttributesScheme")]
        public async Task<IActionResult> GetAttributesScheme(long accountId)
        {
            AccountDescriptor account = _accountsService.GetById(accountId);

            if(account == null)
            {
                throw new AccountNotFoundException(accountId);
            }

            if(account.AccountType != AccountType.IdentityProvider)
            {
                throw new UnexpectedAccountTypeException(accountId, account.AccountType);
            }

            string issuer = account.PublicSpendKey.ToHexString();
            var (schemeName, alias) = await _assetsService.GetRootAttributeSchemeName(issuer).ConfigureAwait(false);
            if(schemeName == null)
            {
                return Ok(new IdentityAttributesSchemaDto());
            }

            var associated = await _assetsService.GetAssociatedAttributeSchemeNames(issuer).ConfigureAwait(false);

            IdentityAttributesSchemaDto schemaDto = new IdentityAttributesSchemaDto
            {
                RootAttribute = new IdentityAttributeSchemaDto { SchemeName = schemeName, Name = alias },
                AssociatedAttributes = associated.Select(a => new IdentityAttributeSchemaDto { SchemeName = a.schemeName, Name = a.alias }).ToList()
            };

            return Ok(schemaDto);
        }

        [AllowAnonymous]
        [HttpGet("IssuanceDetails")]
        public ActionResult<IssuerActionDetails> GetIssuanceDetails(string issuer)
        {
            AccountDescriptor account = _accountsService.GetByPublicKey(issuer.HexStringToByteArray());
            IssuerActionDetails registrationDetails = new IssuerActionDetails
            {
                Issuer = account.PublicSpendKey.ToHexString(),
                IssuerAlias = account.AccountInfo,
                ActionUri = $"{Request.Scheme}://{Request.Host.ToUriComponent()}/IdentityProvider/ProcessRootIdentityRequest?issuer={issuer}".EncodeToString64()
            };

            return registrationDetails;
        }

        [AllowAnonymous]
        [HttpPost("ProcessRootIdentityRequest")]
        public async Task<ActionResult<IEnumerable<AttributeValue>>> ProcessRootIdentityRequest(string issuer, [FromBody] IdentityBaseData sessionData)
        {
            try
            {
                _logger.LogIfDebug(() => $"{nameof(ProcessRootIdentityRequest)} of {issuer} with sessionData: {JsonConvert.SerializeObject(sessionData)}");
                string sessionDataJson = sessionData != null ? JsonConvert.SerializeObject(sessionData) : "NULL";
                _logger.Info($"{nameof(ProcessRootIdentityRequest)}: {nameof(issuer)} = {issuer}, {nameof(sessionData)} = {sessionDataJson}");

                AccountDescriptor account = _accountsService.GetByPublicKey(issuer.HexStringToByteArray());
                StatePersistency statePersistency = _executionContextManager.ResolveStateExecutionServices(account.AccountId);
                byte[] blindingPoint = sessionData.BlindingPoint.HexStringToByteArray();

                IdentitiesScheme rootScheme = _dataAccessService.GetRootIdentityScheme(issuer);
                if (rootScheme == null)
                {
                    throw new NoRootAttributeSchemeDefinedException(issuer);
                }

                IEnumerable<IdentitiesScheme> identitiesSchemes = _dataAccessService.GetAttributesSchemeByIssuer(issuer, true);
                Identity identity = _dataAccessService.GetIdentityByAttribute(account.AccountId, rootScheme.AttributeName, sessionData.Content);

                if (identity == null)
                {
                    string message = $"Failed to find person with {rootScheme.AttributeName} {sessionData.Content} at account {account.AccountId}";
                    _logger.Warning(message);
                    return BadRequest(new { Message = message });
                }

                bool proceed = !identitiesSchemes.Any(s => s.AttributeSchemeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO) || await VerifyFaceImage(sessionData.ImageContent, sessionData.Content, issuer).ConfigureAwait(false);

                if (proceed)
                {
                    byte[] rootAssetId = await _assetsService.GenerateAssetId(rootScheme.AttributeSchemeName, sessionData.Content, issuer).ConfigureAwait(false);
                    IdentityAttribute rootAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == rootScheme.AttributeName);
                    if (!CreateRootAttributeIfNeeded(statePersistency, rootAttribute, rootAssetId))
                    {
                        var protectionAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD);
                        bool res = VerifyProtectionAttribute(protectionAttribute,
                                           sessionData.SignatureE.HexStringToByteArray(),
                                           sessionData.SignatureS.HexStringToByteArray(),
                                           sessionData.SessionCommitment.HexStringToByteArray());

                        if (!res)
                        {
                            const string message = "Failed to verify Surjection Proofs";
                            _logger.Warning($"[{account.AccountId}]: " + message);
                            return BadRequest(message);
                        }
                    }
                    else
                    {
                        await IssueAssociatedAttributes(
                            identity.Attributes.Where(a => a.AttributeName != rootScheme.AttributeName)
                                .Select(a =>
                                    (
                                        a.AttributeId,
                                        identitiesSchemes.FirstOrDefault(s => s.AttributeName == a.AttributeName).AttributeSchemeName,
                                        a.Content,
                                        blindingPoint,
                                        blindingPoint))
                                .ToArray(),
                            statePersistency.TransactionsService,
                            issuer, rootAssetId).ConfigureAwait(false);
                    }

                    //byte[] faceImageAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO, identityRequest.FaceImageContent, issuer).ConfigureAwait(false);

                    bool sent = TransferAssetToUtxo(
                        statePersistency.TransactionsService,
                        new ConfidentialAccount
                        {
                            PublicSpendKey = sessionData.PublicSpendKey.HexStringToByteArray(),
                            PublicViewKey = sessionData.PublicViewKey.HexStringToByteArray()
                        },
                        rootAssetId);

                    if (!sent)
                    {
                        _logger.Error($"[{account.AccountId}]: failed to transfer Root Attribute");
                        return BadRequest();
                    }

                    IEnumerable<AttributeValue> attributeValues = GetAttributeValues(issuer, identity);

                    return Ok(attributeValues);
                }
                else
                {
                    const string message = "Captured face does not match to registered one";
                    _logger.Warning($"[{account.AccountId}]: " + message);
                    return BadRequest(new { Message = message });
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"[{issuer}]: Failed ProcessRootIdentityRequest\r\nSessionData={(sessionData != null ? JsonConvert.SerializeObject(sessionData) : null)}", ex);
                throw;
            }
        }

        [AllowAnonymous]
        [HttpPost("IssueIdpAttributes/{issuer}")]
        public async Task<ActionResult<IEnumerable<AttributeValue>>> IssueIdpAttributes(string issuer, [FromBody] IssueAttributesRequestDTO request)
        {
            if (request is null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            AccountDescriptor account = _accountsService.GetByPublicKey(issuer.HexStringToByteArray());
            StatePersistency statePersistency = _executionContextManager.ResolveStateExecutionServices(account.AccountId);

            IEnumerable<AttributeDefinition> attributeDefinitions = _dataAccessService.GetAttributesSchemeByIssuer(issuer, true)
                .Select(a => new AttributeDefinition
                {
                    SchemeId = a.IdentitiesSchemeId,
                    AttributeName = a.AttributeName,
                    SchemeName = a.AttributeSchemeName,
                    Alias = a.Alias,
                    Description = a.Description,
                    IsActive = a.IsActive,
                    IsRoot = a.CanBeRoot
                });

            ValidateNotSupportedAttributes(request, attributeDefinitions);

            if (!string.IsNullOrEmpty(request.PublicSpendKey) && !string.IsNullOrEmpty(request.PublicViewKey))
            {
                await IssueIdpAttributesAsRoot(issuer, request, account, statePersistency).ConfigureAwait(false);
            }
            else
            {
                await IssueIdpAttributesAsAssociated(issuer, request, statePersistency).ConfigureAwait(false);
            }

            var attributeValues = FillAttributeValues(request, attributeDefinitions);

            return Ok(attributeValues);

            #region Internal Functions

            IReadOnlyCollection<AttributeValue> FillAttributeValues(IssueAttributesRequestDTO request,
                            IEnumerable<AttributeDefinition> attributeDefinitions)
            {
                List<AttributeValue> attributeValues = new List<AttributeValue>();
                foreach (var schemeName in request.Attributes.Keys.Where(a => a != AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD))
                {
                    string content = request.Attributes[schemeName].Value;

                    AttributeValue attributeValue = new AttributeValue
                    {
                        Value = content,
                        Definition = attributeDefinitions.FirstOrDefault(d => d.SchemeName == schemeName)
                    };
                    attributeValues.Add(attributeValue);
                }

                return new ReadOnlyCollection<AttributeValue>(attributeValues);
            }

            async Task IssueIdpAttributesAsRoot(
                string issuer,
                IssueAttributesRequestDTO request,
                AccountDescriptor account,
                StatePersistency statePersistency)
            {
                IdentitiesScheme rootScheme = _dataAccessService.GetRootIdentityScheme(issuer);
                if (rootScheme == null)
                {
                    throw new NoRootAttributeSchemeDefinedException(issuer);
                }

                string rootAttributeContent = request.Attributes[rootScheme.AttributeSchemeName].Value;
                byte[] rootAssetId = await _assetsService.GenerateAssetId(rootScheme.AttributeSchemeName, rootAttributeContent, issuer).ConfigureAwait(false);

                Identity identity = _dataAccessService.GetIdentityByAttribute(account.AccountId, rootScheme.AttributeName, rootAttributeContent);
                if (identity == null)
                {
                    _dataAccessService.CreateIdentity(account.AccountId,
                                       rootAttributeContent,
                                       new (string attrName, string content)[] {
                                           (rootScheme.AttributeName, rootAttributeContent),
                                           (AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, rootAssetId.ToHexString())
                                       });
                    identity = _dataAccessService.GetIdentityByAttribute(account.AccountId, rootScheme.AttributeName, rootAttributeContent);
                }

                IdentityAttribute rootAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == rootScheme.AttributeName);
                if (!CreateRootAttributeIfNeeded(statePersistency, rootAttribute, rootAssetId))
                {
                    var protectionAttribute = identity.Attributes.FirstOrDefault(a => a.AttributeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD);
                    bool res = VerifyProtectionAttribute(protectionAttribute,
                                       request.SignatureE.HexStringToByteArray(),
                                       request.SignatureS.HexStringToByteArray(),
                                       request.SessionCommitment.HexStringToByteArray());

                    if (!res)
                    {
                        _logger.Warning($"[{account.AccountId}]: Failed to verify Surjection Proofs of the Protection Attribute");
                        throw new ProtectionAttributeVerificationFailedException();
                    }
                }
                else
                {
                    await IssueAssociatedAttributes(
                                        request.Attributes.Select(kv => (0L, kv.Key, kv.Value.Value, kv.Value.BlindingPointValue, kv.Value.BlindingPointRoot)).Where(e => e.Key != AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD).ToArray(),
                                        statePersistency.TransactionsService,
                                        issuer, rootAssetId).ConfigureAwait(false);
                }

                ConfidentialAccount confidentialAccount = new ConfidentialAccount
                {
                    PublicSpendKey = request.PublicSpendKey.HexStringToByteArray(),
                    PublicViewKey = request.PublicViewKey.HexStringToByteArray()
                };

                bool sent = TransferAssetToUtxo(statePersistency.TransactionsService, confidentialAccount, rootAssetId);

                if (!sent)
                {
                    _logger.Error($"[{account.AccountId}]: failed to transfer Root Attribute");
                    throw new RootAttributeTransferFailedException();
                }
            }

            async Task IssueIdpAttributesAsAssociated(string issuer, IssueAttributesRequestDTO request, StatePersistency statePersistency)
            {
                IdentitiesScheme rootScheme = _dataAccessService.GetRootIdentityScheme(issuer);

                await IssueAssociatedAttribute(rootScheme.AttributeSchemeName,
                                            request.Attributes[rootScheme.AttributeSchemeName].Value,
                                            request.Attributes[rootScheme.AttributeSchemeName].BlindingPointValue,
                                            request.Attributes[rootScheme.AttributeSchemeName].BlindingPointRoot,
                                            issuer,
                                            statePersistency.TransactionsService).ConfigureAwait(false);

                byte[] rootAssetId = _assetsService.GenerateAssetId(rootScheme.IdentitiesSchemeId, request.Attributes[rootScheme.AttributeSchemeName].Value);
                await IssueAssociatedAttributes(
                                    request.Attributes.Select(kv => (0L, kv.Key, kv.Value.Value, kv.Value.BlindingPointValue, kv.Value.BlindingPointRoot)).Where(e => e.Key != AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD && (rootScheme == null || e.Key != rootScheme.AttributeSchemeName)).ToArray(),
                                    statePersistency.TransactionsService,
                                    issuer, rootAssetId).ConfigureAwait(false);
            }

            static void ValidateNotSupportedAttributes(IssueAttributesRequestDTO request, IEnumerable<AttributeDefinition> attributeDefinitions)
            {
                IEnumerable<string> notSupportedSchemeNames = request.Attributes.Keys.Where(k => attributeDefinitions.All(a => a.SchemeName != k));

                if (notSupportedSchemeNames?.Any() ?? false)
                {
                    throw new Exception($"Following scheme names are not supported: {string.Join(',', notSupportedSchemeNames)}");
                }
            }

            #endregion  Internal Functions
        }

        private IEnumerable<AttributeValue> GetAttributeValues(string issuer, Identity identity)
        {
            IEnumerable<AttributeDefinition> attributeDefinitions = _dataAccessService.GetAttributesSchemeByIssuer(issuer, true)
                .Select(a => new AttributeDefinition
                {
                    SchemeId = a.IdentitiesSchemeId,
                    AttributeName = a.AttributeName,
                    SchemeName = a.AttributeSchemeName,
                    Alias = a.Alias,
                    Description = a.Description,
                    IsActive = a.IsActive,
                    IsRoot = a.CanBeRoot
                });

            IEnumerable<AttributeValue> attributeValues
                = identity.Attributes.Select(a =>
                    new AttributeValue
                    {
                        Value = a.Content,
                        Definition = attributeDefinitions.FirstOrDefault(d => d.AttributeName == a.AttributeName)
                    });
            return attributeValues;
        }

        private static bool VerifyProtectionAttribute(IdentityAttribute protectionAttribute, byte[] signatureE, byte[] signatureS, byte[] sessionCommitment)
        {
            if (protectionAttribute != null)
            {
                byte[] protectionCommitment = protectionAttribute.Commitment;

                SurjectionProof surjectionProof = new SurjectionProof
                {
                    AssetCommitments = new byte[][] { protectionCommitment },
                    Rs = new BorromeanRingSignature
                    {
                        E = signatureE,
                        S = new byte[][] { signatureS }
                    }
                };

                bool res = ConfidentialAssetsHelper.VerifySurjectionProof(surjectionProof, sessionCommitment);
                return res;
            }

            return true;
        }

        private bool CreateRootAttributeIfNeeded(StatePersistency statePersistency, IdentityAttribute rootAttribute, byte[] rootAssetId)
        {
            bool rootAttributeIssued = false;

            if (rootAttribute != null && rootAttribute.Commitment == null)
            {
                statePersistency.TransactionsService.IssueBlindedAsset(rootAssetId, 0UL.ToByteArray(32), out byte[] originatingCommitment);
                _dataAccessService.UpdateIdentityAttributeCommitment(rootAttribute.AttributeId, originatingCommitment);

                rootAttributeIssued = true;
            }

            return rootAttributeIssued;
        }

        private async Task IssueAssociatedAttributes((long attributeId, string schemeName, string content, byte[] blindingPointValue, byte[] blindingPointRoot)[] attributes, IStateTransactionsService transactionsService, string issuer, byte[] rootAssetId = null)
        {
            (string rootSchemeName, _) = await _assetsService.GetRootAttributeSchemeName(issuer).ConfigureAwait(false);
            long rootSchemeId = await _assetsService.GetSchemeId(rootSchemeName, issuer).ConfigureAwait(false);

            if (attributes.Any(a => a.schemeName == rootSchemeName))
            {
                var (attributeId, schemeName, content, blindingPointValue, blindingPointRoot) = attributes.FirstOrDefault(a => a.schemeName == rootSchemeName);
                byte[] originatingCommitment = await IssueAssociatedAttribute(schemeName, content, blindingPointValue, blindingPointRoot, issuer, transactionsService).ConfigureAwait(false);
                _dataAccessService.UpdateIdentityAttributeCommitment(attributeId, originatingCommitment);
                rootAssetId = _assetsService.GenerateAssetId(rootSchemeId, content);
            }

            if (rootAssetId == null)
            {
                throw new ArgumentException("Either rootAssetId must be provided outside or one of attributes must be root one");
            }

            foreach ((long attributeId, string schemeName, string content, byte[] blindingPointValue, byte[] blindingPointRoot) in attributes.Where(a => a.schemeName != rootSchemeName))
            {
                byte[] rootCommitment = _assetsService.GetCommitmentBlindedByPoint(rootAssetId, blindingPointRoot);
                string issuanceContent = AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD.Equals(schemeName) ? rootAssetId.ToHexString() : content;

                byte[] originatingCommitment = await IssueAssociatedAttribute(schemeName, issuanceContent, blindingPointValue, rootCommitment, issuer, transactionsService).ConfigureAwait(false);
                if (attributeId > 0)
                {
                    _dataAccessService.UpdateIdentityAttributeCommitment(attributeId, originatingCommitment);
                }
            }
        }

        private async Task<byte[]> IssueAssociatedAttribute(string schemeName,
                                                      string content,
                                                      byte[] blindingPointValue,
                                                      byte[] blindingPointRoot,
                                                      string issuer,
                                                      IStateTransactionsService transactionsService)
        {
            byte[] assetId = await _assetsService.GenerateAssetId(schemeName, content, issuer).ConfigureAwait(false);
            byte[] groupId;

            if (AttributesSchemes.AttributeSchemes.FirstOrDefault(a => a.Name == schemeName)?.ValueType == AttributeValueType.Date)
            {
                groupId = await _identityAttributesService.GetGroupId(schemeName, DateTime.ParseExact(content, "yyyy-MM-dd", null), issuer).ConfigureAwait(false);
            }
            else
            {
                groupId = schemeName switch
                {
                    AttributesSchemes.ATTR_SCHEME_NAME_PLACEOFBIRTH => await _identityAttributesService.GetGroupId(schemeName, content, issuer).ConfigureAwait(false),
                    _ => await _identityAttributesService.GetGroupId(schemeName, issuer).ConfigureAwait(false),
                };
            }

            transactionsService.IssueAssociatedAsset(assetId, groupId, blindingPointValue, blindingPointRoot, out byte[] originatingCommitment);

            return originatingCommitment;
        }

        private async Task<bool> VerifyFaceImage(string imageContent, string idContent, string publicKey)
        {
            if (!string.IsNullOrEmpty(imageContent))
            {
                try
                {
                    var biometricResult
                        = await $"{Request.Scheme}://{Request.Host.ToUriComponent()}/biometric/"
                            .AppendPathSegment("VerifyPersonFace")
                            .PostJsonAsync(
                                new BiometricVerificationDataDto
                                {
                                    KeyImage = ConfidentialAssetsHelper.GetRandomSeed().ToHexString(),
                                    Issuer = publicKey,
                                    RegistrationKey = idContent,
                                    ImageString = imageContent
                                })
                            .ReceiveJson<BiometricSignedVerificationDto>().ConfigureAwait(false);


                    return biometricResult != null;
                }
                catch (FlurlHttpException)
                {
                    return false;
                }
            }

            return true;
        }

        private bool TransferAssetToUtxo(IStateTransactionsService transactionsService, ConfidentialAccount account, byte[] rootAssetId)
        {
            bool sent = transactionsService.TransferAssetToUtxo(rootAssetId, account);

            return sent;
        }
    }
}