using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using O10.Client.Common.Interfaces;
using O10.Client.DataLayer.Services;
using O10.Core.ExtensionMethods;
using O10.Client.DataLayer.Enums;
using O10.Web.Server.Dtos;
using O10.Core.Configuration;
using O10.Crypto.ConfidentialAssets;
using System.Text;
using O10.Client.Common.Identities;
using O10.Client.Common.Interfaces.Inputs;
using System.Globalization;
using Flurl;
using Flurl.Http;
using System.Net.Http;
using O10.Client.DataLayer.Model;
using O10.Transactions.Core.DataModel;
using System.Collections.Specialized;
using O10.Client.Common.Interfaces.Outputs;
using O10.Web.Server.Dtos.User;
using Microsoft.AspNetCore.SignalR;
using System.Web;
using O10.Client.Web.Common.Dtos.SamlIdp;
using O10.Client.Web.Common.Services;
using O10.Client.Web.Common.Hubs;
using O10.Client.Web.Common.Dtos.Biometric;
using O10.Core.Cryptography;
using System.Threading.Tasks;
using O10.Transactions.Core.DataModel.UtxoConfidential.Internal;
using O10.Client.DataLayer.AttributesScheme;
using O10.Client.Common.Configuration;
using System.Threading;
using O10.Core;
using O10.Core.Logging;
using Newtonsoft.Json;
using O10.Core.HashCalculations;
using O10.Client.Common.Entities;
using O10.Web.Server.Services;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using O10.Web.Server.Configuration;

namespace O10.Web.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IDocumentSignatureVerifier _documentSignatureVerifier;
        private readonly IAccountsService _accountsService;
        private readonly IExecutionContextManager _executionContextManager;
        private readonly IAssetsService _assetsService;
        private readonly IIdentityAttributesService _identityAttributesService;
        private readonly IDataAccessService _dataAccessService;
        private readonly IGatewayService _gatewayService;
        private readonly ISchemeResolverService _schemeResolverService;
        private readonly IHubContext<IdentitiesHub> _idenitiesHubContext;
        private readonly IRestApiConfiguration _restApiConfiguration;
        private readonly IHashCalculation _hashCalculation;
        private readonly ILogger _logger;
        private readonly IPortalConfiguration _portalConfiguration;

        public UserController(IDocumentSignatureVerifier documentSignatureVerifier,
                              IAccountsService accountsService,
                              IExecutionContextManager executionContextManager,
                              IAssetsService assetsService,
                              IIdentityAttributesService identityAttributesService,
                              IDataAccessService externalDataAccessService,
                              IGatewayService gatewayService,
                              ISchemeResolverService schemeResolverService,
                              IConfigurationService configurationService,
                              IHubContext<IdentitiesHub> idenitiesHubContext,
                              ILoggerService loggerService,
                              IHashCalculationsRepository hashCalculationsRepository)
        {
            _documentSignatureVerifier = documentSignatureVerifier;
            _accountsService = accountsService;
            _executionContextManager = executionContextManager;
            _assetsService = assetsService;
            _identityAttributesService = identityAttributesService;
            _dataAccessService = externalDataAccessService;
            _gatewayService = gatewayService;
            _schemeResolverService = schemeResolverService;
            _idenitiesHubContext = idenitiesHubContext;
            _restApiConfiguration = configurationService.Get<IRestApiConfiguration>();
            _portalConfiguration = configurationService.Get<IPortalConfiguration>();
            _hashCalculation = hashCalculationsRepository.Create(Globals.DEFAULT_HASH);
            _logger = loggerService.GetLogger(nameof(UserController));
        }

        [HttpGet("UserAttributes")]
        public async Task<ActionResult<IEnumerable<UserAttributeSchemeDto>>> GetUserAttributes(long accountId)
        {
            IEnumerable<UserRootAttribute> userRootAttributes = _dataAccessService.GetUserAttributes(accountId);
            List<UserAttributeSchemeDto> userAttributeSchemes = new List<UserAttributeSchemeDto>();

            foreach (var rootAttribute in userRootAttributes)
            {
                var issuer = rootAttribute.Source;
                var userAttributeScheme = userAttributeSchemes.Find(i => i.Issuer == issuer && i.RootAssetId == rootAttribute.AssetId.ToHexString());
                if(userAttributeScheme == null)
                {
                    userAttributeScheme = new UserAttributeSchemeDto
                    {
                        Issuer = issuer,
                        IssuerName = _dataAccessService.GetUserIdentityIsserAlias(issuer),
                        RootAttributeContent = rootAttribute.Content,
                        RootAssetId = rootAttribute.AssetId.ToHexString(),
                        SchemeName = rootAttribute.SchemeName
                    };

                    if (string.IsNullOrEmpty(userAttributeScheme.IssuerName))
                    {
                        await _schemeResolverService.ResolveIssuer(issuer)
                            .ContinueWith(t =>
                            {
                                if (t.IsCompletedSuccessfully)
                                {
                                    _dataAccessService.AddOrUpdateUserIdentityIsser(issuer, t.Result, string.Empty);
                                    userAttributeScheme.Issuer = t.Result;
                                }
                                else
                                {
                                    userAttributeScheme.IssuerName = issuer;
                                }
                            }, TaskScheduler.Default).ConfigureAwait(false);
                    }
                    userAttributeScheme.RootAttributes.Add(await GetUserAttributeDto(rootAttribute).ConfigureAwait(false));
                }
            }

            return userAttributeSchemes;
        }

        [HttpDelete("UserRootAttribute")]
        public IActionResult DeleteUserRootAttribute(long accountId, long attributeId)
        {
            return Ok(_dataAccessService.RemoveUserAttribute(accountId, attributeId));
        }

        private async Task<UserAttributeDto> GetUserAttributeDto(UserRootAttribute c)
        {
            string issuerName = await _schemeResolverService.ResolveIssuer(c.Source).ConfigureAwait(false);
            return new UserAttributeDto
            {
                UserAttributeId = c.UserAttributeId,
                SchemeName = c.SchemeName,
                Content = c.Content,
                Validated = !string.IsNullOrEmpty(c.Content),
                Source = c.Source,
                IssuerName = issuerName,
                IsOverriden = c.IsOverriden
            };
        }

        [HttpPost("CompromisedProofs")]
        public async Task<IActionResult> SendCompromisedProofs(long accountId, [FromBody] UnauthorizedUseDto unauthorizedUse)
        {
            var userSettings = _dataAccessService.GetUserSettings(accountId);
            _logger.LogIfDebug(() => $"[{accountId}]: {nameof(SendCompromisedProofs)}, userSettings={(userSettings != null ? JsonConvert.SerializeObject(userSettings, new ByteArrayJsonConverter()) : "NULL")}");

            if (userSettings?.IsAutoTheftProtection == false)
            {
                _logger.Info("Sending compromised proofs abandoned");
                return Ok();
            }

            _logger.LogIfDebug(() => $"[{accountId}]: {nameof(SendCompromisedProofs)}, unauthorizedUse={(unauthorizedUse != null ? JsonConvert.SerializeObject(unauthorizedUse, new ByteArrayJsonConverter()) : "NULL")}");

            UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);
            UserRootAttribute rootAttribute = null;
            byte[] keyImageCompromized = unauthorizedUse.KeyImage.HexStringToByteArray();
            byte[] transactionKeyCompromized = unauthorizedUse.TransactionKey.HexStringToByteArray();
            byte[] destinationKeyCompromized = unauthorizedUse.DestinationKey.HexStringToByteArray();

            rootAttribute = GetRootAttributeOnTransactionKeyArriving(accountId, transactionKeyCompromized);

            if (rootAttribute == null)
            {
                return BadRequest();
            }

            byte[] target = unauthorizedUse.Target.HexStringToByteArray();

            GetRequestInput(rootAttribute, target, out byte[] issuer, out RequestInput requestInput);

            OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            byte[][] issuanceCommitments = await _gatewayService.GetIssuanceCommitments(issuer, _restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            RequestResult requestResult = utxoPersistency.TransactionsService.SendCompromisedProofs(requestInput, keyImageCompromized, transactionKeyCompromized, destinationKeyCompromized, outputModels, issuanceCommitments).Result;

            rootAttribute = GetRootAttributeOnTransactionKeyArriving(accountId, requestResult.NewTransactionKey);

            IEnumerable<UserRootAttribute> userRootAttributes = _dataAccessService.GetUserAttributes(accountId).Where(u => !u.IsOverriden);

            foreach (UserRootAttribute userAttribute in userRootAttributes)
            {
                await SendRevokeIdentity(userAttribute, utxoPersistency).ConfigureAwait(false);
            }

            return Ok();
        }

        private static void GetRequestInput(UserRootAttribute rootAttribute, byte[] target, out byte[] issuer, out RequestInput requestInput)
        {
            issuer = rootAttribute.Source.HexStringToByteArray();
            byte[] assetId = rootAttribute.AssetId;
            byte[] originalBlindingFactor = rootAttribute.OriginalBlindingFactor;
            byte[] originalCommitment = rootAttribute.OriginalCommitment;
            byte[] lastTransactionKey = rootAttribute.LastTransactionKey;
            byte[] lastBlindingFactor = rootAttribute.LastBlindingFactor;
            byte[] lastCommitment = rootAttribute.LastCommitment;
            byte[] lastDestinationKey = rootAttribute.LastDestinationKey;

            requestInput = new RequestInput
            {
                AssetId = assetId,
                EligibilityBlindingFactor = originalBlindingFactor,
                EligibilityCommitment = originalCommitment,
                Issuer = issuer,
                PrevAssetCommitment = lastCommitment,
                PrevBlindingFactor = lastBlindingFactor,
                PrevDestinationKey = lastDestinationKey,
                PrevTransactionKey = lastTransactionKey,
                PublicSpendKey = target
            };
        }

        private UserRootAttribute GetRootAttributeOnTransactionKeyArriving(long accountId, Memory<byte> transactionKey)
        {
            UserRootAttribute rootAttribute;
            int counter = 0;
            do
            {
                IEnumerable<UserRootAttribute> userAttributes = _dataAccessService.GetUserAttributes(accountId).Where(u => !u.IsOverriden && !u.LastCommitment.Equals32(new byte[32]));
                rootAttribute = userAttributes.FirstOrDefault(a => transactionKey.Equals32(a.LastTransactionKey));

                if (rootAttribute == null)
                {
                    counter++;
                    Thread.Sleep(500);
                }
            } while (rootAttribute == null && counter <= 10);
            return rootAttribute;
        }

        private UserRootAttribute GetRootAttributeOnTransactionKeyChanging(long accountId, byte[] originalCommitment, byte[] transactionKey)
        {
            UserRootAttribute rootAttribute;
            int counter = 0;
            do
            {
                Thread.Sleep(500);
                rootAttribute = _dataAccessService.GetUserAttributes(accountId).FirstOrDefault(u => !u.IsOverriden && u.OriginalCommitment.Equals32(originalCommitment) && !u.LastTransactionKey.Equals32(transactionKey));
            } while (rootAttribute == null && counter <= 10);
            return rootAttribute;
        }

        private async Task SendRevokeIdentity(UserRootAttribute rootAttribute, UtxoPersistency utxoPersistency)
        {
            byte[] target = rootAttribute.Source.HexStringToByteArray();
            byte[] issuer = rootAttribute.Source.HexStringToByteArray();
            byte[] assetId = rootAttribute.AssetId;
            byte[] originalBlindingFactor = rootAttribute.OriginalBlindingFactor;
            byte[] originalCommitment = rootAttribute.OriginalCommitment;
            byte[] lastTransactionKey = rootAttribute.LastTransactionKey;
            byte[] lastBlindingFactor = rootAttribute.LastBlindingFactor;
            byte[] lastCommitment = rootAttribute.LastCommitment;
            byte[] lastDestinationKey = rootAttribute.LastDestinationKey;

            RequestInput requestInput = new RequestInput
            {
                AssetId = assetId,
                EligibilityBlindingFactor = originalBlindingFactor,
                EligibilityCommitment = originalCommitment,
                Issuer = issuer,
                PrevAssetCommitment = lastCommitment,
                PrevBlindingFactor = lastBlindingFactor,
                PrevDestinationKey = lastDestinationKey,
                PrevTransactionKey = lastTransactionKey,
                PublicSpendKey = target
            };

            OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            RequestResult requestResult = await utxoPersistency.TransactionsService.SendRevokeIdentity(requestInput, outputModels, new byte[][] { rootAttribute.IssuanceCommitment }).ConfigureAwait(false);
        }

        [HttpPost("SendDocumentSignRequest")]
        public async Task<IActionResult> SendDocumentSignRequest(long accountId, [FromBody] UserAttributeTransferDto userAttributeTransfer)
        {
            UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);

            (bool proceed, BiometricProof biometricProof) = await CheckBiometrics(userAttributeTransfer, accountId).ConfigureAwait(false);

            if (proceed)
            {
                await SendDocumentSignRequest(accountId, userAttributeTransfer, utxoPersistency.TransactionsService, biometricProof).ConfigureAwait(false);

                return Ok(true);
            }

            return Ok(false);
        }

        private async Task<(BiometricPersonDataForSignatureDto dataForSignature, byte[] sourceImageBlindingFactor)> GetInputDataForBiometricSignature(UserAttributeTransferDto userAttributeTransfer, long accountId)
        {
            (string schemeName, string sourceImage) = _dataAccessService.GetUserAssociatedAttributes(accountId, userAttributeTransfer.Source).FirstOrDefault(t => t.schemeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO);

            byte[] sourceImageBytes = Convert.FromBase64String(sourceImage);
            byte[] sourceImageAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO, sourceImage, userAttributeTransfer.Source).ConfigureAwait(false);
            byte[] sourceImageBlindingFactor = ConfidentialAssetsHelper.GetRandomSeed();
            byte[] sourceImageCommitment = ConfidentialAssetsHelper.GetAssetCommitment(sourceImageBlindingFactor, sourceImageAssetId);
            SurjectionProof surjectionProof = ConfidentialAssetsHelper.CreateNewIssuanceSurjectionProof(sourceImageCommitment, new byte[][] { sourceImageAssetId }, 0, sourceImageBlindingFactor);

            BiometricPersonDataForSignatureDto biometricPersonDataForSignature = new BiometricPersonDataForSignatureDto
            {
                ImageSource = sourceImage,
                ImageTarget = userAttributeTransfer.ImageContent,
                SourceImageCommitment = sourceImageCommitment.ToHexString(),
                SourceImageProofCommitment = surjectionProof.AssetCommitments[0].ToHexString(),
                SourceImageProofSignatureE = surjectionProof.Rs.E.ToHexString(),
                SourceImageProofSignatureS = surjectionProof.Rs.S[0].ToHexString()
            };

            return (biometricPersonDataForSignature, sourceImageBlindingFactor);
        }

        [HttpPost("SendEmployeeRequest")]
        public async Task<IActionResult> SendEmployeeRequest(long accountId, [FromBody] UserAttributeTransferDto userAttributeTransfer)
        {
            UserRootAttribute userRootAttribute = _dataAccessService.GetUserRootAttribute(userAttributeTransfer.UserAttributeId);
            string assetId = userRootAttribute.AssetId.ToHexString();
            UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);

            (bool proceed, BiometricProof biometricProof) = await CheckBiometrics(userAttributeTransfer, accountId).ConfigureAwait(false);

            if (proceed)
            {
                await SendEmployeeRequest(accountId, userAttributeTransfer, utxoPersistency.TransactionsService, biometricProof).ConfigureAwait(false);

                string[] categoryEntries = userAttributeTransfer.ExtraInfo.Split("/");

                foreach (string categoryEntry in categoryEntries)
                {
                    string groupOwnerName = categoryEntry.Split("|")[0];
                    string groupName = categoryEntry.Split("|")[1];

                    long groupRelationId = _dataAccessService.AddUserGroupRelation(accountId, groupOwnerName, userAttributeTransfer.Target, groupName, assetId, userAttributeTransfer.Source);

                    if (groupRelationId > 0)
                    {
                        GroupRelationDto groupRelationDto = new GroupRelationDto
                        {
                            GroupRelationId = groupRelationId,
                            GroupOwnerName = groupOwnerName,
                            GroupOwnerKey = userAttributeTransfer.Target,
                            GroupName = groupName,
                            Issuer = userAttributeTransfer.Source,
                            AssetId = assetId
                        };

                        await _idenitiesHubContext.Clients.Group(accountId.ToString(CultureInfo.InvariantCulture)).SendAsync("PushGroupRelation", groupRelationDto).ConfigureAwait(false);

                        await _schemeResolverService.StoreGroupRelation(userAttributeTransfer.Source, assetId, userAttributeTransfer.Target, groupName).ConfigureAwait(false);
                    }
                }


                return Ok(true);
            }

            return Ok(false);
        }


        private async Task<(bool proceed, BiometricProof biometricProof)> CheckBiometrics(UserAttributeTransferDto userAttributeTransfer, long accountId)
        {
            bool proceed = true;
            BiometricProof biometricProof = null;

            if (!string.IsNullOrEmpty(userAttributeTransfer.ImageContent) && !string.IsNullOrEmpty(userAttributeTransfer.Content))
            {
                (BiometricPersonDataForSignatureDto biometricPersonDataForSignature, byte[] sourceImageBlindingFactor) = await GetInputDataForBiometricSignature(userAttributeTransfer, accountId).ConfigureAwait(false);

                try
                {
                    //BiometricSignedVerificationDto biometricSignedVerification = _restApiConfiguration.BiometricUri.AppendPathSegment("SignPersonFaceVerification").PostJsonAsync(biometricPersonDataForSignature).ReceiveJson<BiometricSignedVerificationDto>().Result;

                    //biometricProof = await GetBiometricProof(biometricPersonDataForSignature, biometricSignedVerification, userAttributeTransfer.Content, userAttributeTransfer.Password, sourceImageBlindingFactor).ConfigureAwait(false);
                }
                catch (FlurlHttpException)
                {
                    proceed = false;
                }

                proceed = true;
            }

            return (proceed, biometricProof);
        }

        private async Task<BiometricProof> GetBiometricProof(BiometricPersonDataForSignatureDto biometricPersonDataForSignature, BiometricSignedVerificationDto biometricSignedVerification, string rootAttributeContent, string password, byte[] sourceImageBlindingFactor)
        {
            byte[] assetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO, biometricPersonDataForSignature.ImageSource, null).ConfigureAwait(false);
            _assetsService.GetBlindingPoint(ConfidentialAssetsHelper.PasswordHash(password), assetId, out byte[] blindingPoint, out byte[] blindingFactor);

            byte[] photoIssuanceCommitment = _assetsService.GetCommitmentBlindedByPoint(assetId, blindingPoint);
            byte[] sourceImageCommitment = biometricPersonDataForSignature.SourceImageCommitment.HexStringToByteArray();
            byte[] diffBF = ConfidentialAssetsHelper.GetDifferentialBlindingFactor(sourceImageBlindingFactor, blindingFactor);
            SurjectionProof surjectionProof = ConfidentialAssetsHelper.CreateSurjectionProof(sourceImageCommitment, new byte[][] { photoIssuanceCommitment }, 0, diffBF);

            return new BiometricProof
            {
                BiometricCommitment = sourceImageCommitment,
                BiometricSurjectionProof = surjectionProof,
                VerifierPublicKey = biometricSignedVerification.PublicKey.HexStringToByteArray(),
                VerifierSignature = biometricSignedVerification.Signature.HexStringToByteArray()
            };
        }

        [HttpPost("SendIdentityProofs")]
        public async Task<IActionResult> SendIdentityProofs(long accountId, [FromBody] UserAttributeTransferWithValidationsDto userAttributeTransfer)
        {
            bool res = false;

            UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);

            string sessionInfo = userAttributeTransfer.UserAttributeTransfer.ExtraInfo;

            if (!string.IsNullOrEmpty(sessionInfo))
            {
                UriBuilder uriBuilder = new UriBuilder(_restApiConfiguration.SamlIdpUri);
                NameValueCollection queryParams = HttpUtility.ParseQueryString(uriBuilder.Query);
                queryParams["sessionInfo"] = sessionInfo;
                uriBuilder.Query = queryParams.ToString();

                SamlIdpSessionInfo samlIdpSessionInfo = uriBuilder.Uri.ToString().AppendPathSegments("SamlIdp", "GetSessionInfo").GetJsonAsync<SamlIdpSessionInfo>().Result;
                userAttributeTransfer.UserAttributeTransfer.Target = samlIdpSessionInfo.TargetPublicSpendKey;
                userAttributeTransfer.UserAttributeTransfer.Target2 = samlIdpSessionInfo.TargetPublicViewKey;
            }

            AssociatedProofPreparation[] associatedProofPreparations = null;

            //if (samlIdpSessionInfo.IdentityAttributeValidationDefinitions != null && samlIdpSessionInfo.IdentityAttributeValidationDefinitions.IdentityAttributeValidationDefinitions.Count > 0)
            //{
            //    var rootAttribute = _dataAccessService.GetUserAttributes(accountId).FirstOrDefault(u => !u.IsOverriden && u.AttributeType == _identityAttributesService.GetRootAttributeType().Item1);
            //    _assetsService.GetBlindingPoint(rootAttribute.Content, userAttributeTransfer.Password, out byte[] blindingPoint, out byte[] blindingFactor);
            //    byte[] rootOriginatingCommitment = _assetsService.GetCommitmentBlindedByPoint(rootAttribute.AssetId, blindingPoint);

            //    associatedProofPreparations = new AssociatedProofPreparation[samlIdpSessionInfo.IdentityAttributeValidationDefinitions.IdentityAttributeValidationDefinitions.Count];

            //    var associatedAttributes = _dataAccessService.GetUserAssociatedAttributes(accountId);

            //    int index = 0;
            //    foreach (var validation in samlIdpSessionInfo.IdentityAttributeValidationDefinitions.IdentityAttributeValidationDefinitions)
            //    {
            //        AttributeType attributeType = (AttributeType)uint.Parse(validation.AttributeType);
            //        ValidationType validationType = (ValidationType)uint.Parse(validation.ValidationType);

            //        string attrContent = associatedAttributes.FirstOrDefault(a => a.Item1 == attributeType)?.Item2 ?? string.Empty;
            //        byte[] groupId = _identityAttributesService.GetGroupId(attributeType);
            //        byte[] assetId = attributeType != AttributeType.DateOfBirth ? _assetsService.GenerateAssetId(attributeType, attrContent) : rootAttribute.AssetId;
            //        byte[] associatedBlindingFactor = attributeType != AttributeType.DateOfBirth ? ConfidentialAssetsHelper.GetRandomSeed() : null;
            //        byte[] associatedCommitment = attributeType != AttributeType.DateOfBirth ? ConfidentialAssetsHelper.GetAssetCommitment(assetId, associatedBlindingFactor) : null;
            //        byte[] associatedOriginatingCommitment = _assetsService.GetCommitmentBlindedByPoint(assetId, blindingPoint);

            //        AssociatedProofPreparation associatedProofPreparation = new AssociatedProofPreparation { GroupId = groupId, Commitment = associatedCommitment, CommitmentBlindingFactor = associatedBlindingFactor, OriginatingAssociatedCommitment = associatedOriginatingCommitment, OriginatingBlindingFactor = blindingFactor, OriginatingRootCommitment = rootOriginatingCommitment };

            //        associatedProofPreparations[index++] = associatedProofPreparation;
            //    }
            //}

            (bool proceed, BiometricProof biometricProof) = await CheckBiometrics(userAttributeTransfer.UserAttributeTransfer, accountId).ConfigureAwait(false);

            if (proceed)
            {
                await SendIdentityProofs(accountId, userAttributeTransfer.UserAttributeTransfer, utxoPersistency.TransactionsService, utxoPersistency.RelationsBindingService, biometricProof, associatedProofPreparations).ConfigureAwait(false);
            }

            return Ok(res);
        }

        private async Task SendIdentityProofs(long accountId, UserAttributeTransferDto userAttributeTransfer, IUtxoTransactionsService transactionsService, IRelationsBindingService relationsBindingService, BiometricProof biometricProof, AssociatedProofPreparation[] associatedProofPreparations = null)
        {
            (byte[] issuer, RequestInput requestInput) = GetRequestInput<RequestInput>(userAttributeTransfer, biometricProof);

            OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            byte[][] issuanceCommitments = await _gatewayService.GetIssuanceCommitments(issuer, _restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            RequestResult requestResult = transactionsService.SendIdentityProofs(requestInput, associatedProofPreparations, outputModels, issuanceCommitments).Result;
            relationsBindingService.GetBoundedCommitment(requestInput.AssetId, requestInput.PublicSpendKey, out byte[] registrationBlindingFactor, out byte[] registrationCommitment);
            if (_dataAccessService.AddUserRegistration(accountId, registrationCommitment.ToHexString(), string.Empty, requestInput.AssetId.ToHexString(), issuer.ToHexString()) > 0)
            {
                await _schemeResolverService.StoreRegistrationCommitment(issuer.ToHexString(), requestInput.AssetId.ToHexString(), registrationCommitment.ToHexString(), string.Empty).ConfigureAwait(false);
            }
        }


        private async Task SendDocumentSignRequest(long accountId, UserAttributeTransferDto userAttributeTransfer, IUtxoTransactionsService transactionsService, BiometricProof biometricProof, AssociatedProofPreparation[] associatedProofPreparations = null)
        {
            (byte[] issuer, DocumentSignRequestInput requestInput) = GetRequestInput<DocumentSignRequestInput>(userAttributeTransfer, biometricProof);
            string[] extraInfo = userAttributeTransfer.ExtraInfo.Split('|');
            byte[] groupIssuer = extraInfo[0].HexStringToByteArray();
            byte[] groupAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_EMPLOYEEGROUP, extraInfo[0] + extraInfo[1], userAttributeTransfer.Target).ConfigureAwait(false);
            byte[] documentHash = extraInfo[2].HexStringToByteArray();
            ulong documentRecordHeight = ulong.Parse(extraInfo[3]);
            requestInput.GroupIssuer = groupIssuer;
            requestInput.GroupAssetId = groupAssetId;
            requestInput.DocumentHash = documentHash;
            requestInput.DocumentRecordHeight = documentRecordHeight;


            OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            byte[][] issuanceCommitments = await _gatewayService.GetIssuanceCommitments(issuer, _restApiConfiguration.RingSize + 1).ConfigureAwait(false);
            RequestResult requestResult = await transactionsService.SendDocumentSignRequest(requestInput, associatedProofPreparations, outputModels, issuanceCommitments).ConfigureAwait(false);
        }

        private async Task SendEmployeeRequest(long accountId, UserAttributeTransferDto userAttributeTransfer, IUtxoTransactionsService transactionsService, BiometricProof biometricProof, AssociatedProofPreparation[] associatedProofPreparations = null)
        {
            (byte[] issuer, EmployeeRequestInput requestInput) = GetRequestInput<EmployeeRequestInput>(userAttributeTransfer, biometricProof);

            string[] categoryEntries = userAttributeTransfer.ExtraInfo.Split("/");
            foreach (string categoryEntry in categoryEntries)
            {
                string groupName = categoryEntry.Split("|")[1];
                bool isRegistered = "true".Equals(categoryEntry.Split("|")[2], StringComparison.InvariantCultureIgnoreCase);

                //if (!isRegistered)
                {
                    byte[] groupAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_EMPLOYEEGROUP, userAttributeTransfer.Target + groupName, userAttributeTransfer.Target).ConfigureAwait(false);
                    requestInput.GroupAssetId = groupAssetId;

                    OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
                    byte[][] issuanceCommitments = await _gatewayService.GetIssuanceCommitments(issuer, _restApiConfiguration.RingSize + 1).ConfigureAwait(false);
                    RequestResult requestResult = await transactionsService.SendEmployeeRegistrationRequest(requestInput, associatedProofPreparations, outputModels, issuanceCommitments).ConfigureAwait(false);
                }
            }
        }

        [HttpGet("UserAssociatedAttributes")]
        public async Task<IActionResult> GetUserAssociatedAttributes(long accountId, string issuer)
        {
            List<(string schemeName, string alias)> associatedAttributeSchemes = await _assetsService.GetAssociatedAttributeSchemeNames(issuer).ConfigureAwait(false);
            List<(string schemeName, string content)> associatedAttributes = _dataAccessService.GetUserAssociatedAttributes(accountId, issuer).ToList();

            return Ok(associatedAttributeSchemes
                .Where(a => a.schemeName != AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD)
                .Select(
                    a => new UserAssociatedAttributeDto
                    {
                        SchemeName = a.schemeName,
                        Alias = a.alias,
                        Content = ResolveValue(associatedAttributes, a.schemeName, string.Empty)
                    }));
        }

        private static string ResolveValue(IEnumerable<(string key1, string value1)> items, string key2, string value2 = null)
        {
            foreach (var (key1, value1) in items)
            {
                if (key1 == key2)
                {
                    return value1;
                }
            }
            return value2 ?? key2;
        }

        [HttpPost("UserAssociatedAttributes")]
        public IActionResult UpdateUserAssociatedAttributes(long accountId, string issuer, [FromBody] UserAssociatedAttributeDto[] userAssociatedAttributeDtos)
        {
            _dataAccessService.UpdateUserAssociatedAttributes(accountId, issuer, userAssociatedAttributeDtos.Select(a => new Tuple<string, string>(a.SchemeName, a.Content)));

            return Ok();
        }

        [HttpPost("UserRootAttribute")]
        public IActionResult SetUserRootAttribute(long accountId, [FromBody] UserAttributeDto userAttribute)
        {
            return Ok(_dataAccessService.UpdateUserAttributeContent(userAttribute.UserAttributeId, userAttribute.Content));
        }

        private (byte[] issuer, T requestInput) GetRequestInput<T>(UserAttributeTransferDto userAttributeTransfer, BiometricProof biometricProof) where T : RequestInput, new()
        {
            UserRootAttribute userRootAttribute = _dataAccessService.GetUserRootAttribute(userAttributeTransfer.UserAttributeId);
            byte[] target = userAttributeTransfer.Target.HexStringToByteArray();
            byte[] target2 = userAttributeTransfer.Target2?.HexStringToByteArray();
            byte[] payload = userAttributeTransfer.Payload?.HexStringToByteArray();
            byte[] issuer = userRootAttribute.Source.HexStringToByteArray();
            byte[] assetId = userRootAttribute.AssetId;
            byte[] originalBlindingFactor = userRootAttribute.OriginalBlindingFactor;
            byte[] originalCommitment = userRootAttribute.OriginalCommitment;
            byte[] lastTransactionKey = userRootAttribute.LastTransactionKey;
            byte[] lastBlindingFactor = userRootAttribute.LastBlindingFactor;
            byte[] lastCommitment = userRootAttribute.LastCommitment;
            byte[] lastDestinationKey = userRootAttribute.LastDestinationKey;


            T requestInput = new T
            {
                AssetId = assetId,
                EligibilityBlindingFactor = originalBlindingFactor,
                EligibilityCommitment = originalCommitment,
                Issuer = issuer,
                PrevAssetCommitment = lastCommitment,
                PrevBlindingFactor = lastBlindingFactor,
                PrevDestinationKey = lastDestinationKey,
                PrevTransactionKey = lastTransactionKey,
                PublicSpendKey = target,
                PublicViewKey = target2,
                Payload = payload,
                BiometricProof = biometricProof
            };

            return (issuer, requestInput);
        }

        [HttpGet("UserDetails")]
        public IActionResult GetUserDetails(long accountId)
        {
            AccountDescriptor account = _accountsService.GetById(accountId);

            if (account != null)
            {
                return Ok(new
                {
                    Id = accountId.ToString(CultureInfo.InvariantCulture),
                    account.AccountInfo,
                    PublicSpendKey = account.PublicSpendKey.ToHexString(),
                    PublicViewKey = account.PublicViewKey.ToHexString(),
                    account.IsCompromised,
                    IsAutoTheftProtection = _dataAccessService.GetUserSettings(account.AccountId)?.IsAutoTheftProtection ?? false,
                    ConsentManagementHub = _restApiConfiguration.ConsentManagementUri.AppendPathSegment("consentHub").ToString()
                });
            }

            return BadRequest();
        }

        [HttpDelete("DeleteNonConfirmedRootAttribute")]
        public IActionResult DeleteNonConfirmedRootAttribute(long accountId, [FromQuery] string content)
        {
            string c = HttpUtility.HtmlDecode(content);
            if (_dataAccessService.DeleteNonConfirmedUserRootAttribute(accountId, c))
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost("IdentityRegistration")]
        public async Task<IActionResult> IdentityRegistration(long accountId, [FromBody] RequestForIdentityDto requestForIdentity)
        {
            IssuerActionDetails registrationDetails = null;

            await requestForIdentity.Target.DecodeFromString64().GetJsonAsync<IssuerActionDetails>().ContinueWith(t =>
            {
                if (t.IsCompleted && !t.IsFaulted)
                {
                    registrationDetails = t.Result;
                }
            }, TaskScheduler.Current).ConfigureAwait(false);

            if (registrationDetails == null)
            {
                return BadRequest();
            }

            AccountDescriptor account = _accountsService.GetById(accountId);
            string email = Uri.UnescapeDataString(requestForIdentity.IdCardContent);
            byte[] assetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_EMAIL, email, registrationDetails.Issuer).ConfigureAwait(false);
            byte[] sessionBlindingFactor = ConfidentialAssetsHelper.ReduceScalar32(ConfidentialAssetsHelper.FastHash256(Encoding.ASCII.GetBytes(requestForIdentity.Passphrase)));
            byte[] sessionCommitment = ConfidentialAssetsHelper.BlindAssetCommitment(ConfidentialAssetsHelper.GetNonblindedAssetCommitment(assetId), sessionBlindingFactor);

            _assetsService.GetBlindingPoint(ConfidentialAssetsHelper.PasswordHash(requestForIdentity.Password), assetId, out byte[] blindingPoint, out byte[] blindingFactor);

            string error = null;
            await registrationDetails.ActionUri.DecodeFromString64().PostJsonAsync(
                new
                {
                    Content = requestForIdentity.IdCardContent,
                    BlindingPoint = blindingPoint.ToHexString(),
                    SessionCommitment = sessionCommitment.ToHexString(),
                    requestForIdentity.ImageContent,
                    PublicSpendKey = account.PublicSpendKey.ToHexString(),
                    PublicViewKey = account.PublicViewKey.ToHexString()
                }).ContinueWith(t =>
                {
                    if (t.IsCompleted && !t.IsFaulted && t.Result.IsSuccessStatusCode)
                    {
                        _dataAccessService.AddNonConfirmedRootAttribute(accountId, requestForIdentity.IdCardContent, registrationDetails.Issuer, AttributesSchemes.ATTR_SCHEME_NAME_EMAIL, assetId);

                        _dataAccessService.UpdateUserAssociatedAttributes(accountId, registrationDetails.Issuer, new List<Tuple<string, string>> { new Tuple<string, string>(AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO, requestForIdentity.ImageContent) });
                    }
                    else
                    {
                        error = t.Result.Content.ReadAsStringAsync().Result;
                    }
                }, TaskScheduler.Current).ConfigureAwait(false);

            if (string.IsNullOrEmpty(error))
            {
                return Ok();
            }

            return BadRequest(error);
        }

        [HttpPost("AttributesIssuance")]
        public async Task<IActionResult> RequestForAttributesIssuance(long accountId, AttributesIssuanceRequestDto attributesIssuanceRequest)
        {
            var account = _accountsService.GetById(accountId);
            var persistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);
            var attributes = attributesIssuanceRequest.AttributeValues;
            var issuer = attributesIssuanceRequest.Issuer;

            (string rootScheme, string _) = await _assetsService.GetRootAttributeSchemeName(attributesIssuanceRequest.Issuer).ConfigureAwait(false);
            byte[] blindingPointRootToRoot = null;

            if (attributesIssuanceRequest.MasterRootAttributeId != null)
            {
                var rootAttributeMaster = _dataAccessService.GetUserRootAttribute(attributesIssuanceRequest.MasterRootAttributeId.Value);
                byte[] blindingPointRoot = _assetsService.GetBlindingPoint(await persistency.BindingKeySource.Task.ConfigureAwait(false), rootAttributeMaster.AssetId);
                blindingPointRootToRoot = _assetsService.GetCommitmentBlindedByPoint(rootAttributeMaster.AssetId, blindingPointRoot);
            }


            string rootAttributeContent = attributes.FirstOrDefault(a => a.Key == rootScheme).Value;
            byte[] rootAssetId = await _assetsService.GenerateAssetId(rootScheme, rootAttributeContent, issuer).ConfigureAwait(false);

            IssueAttributesRequestDTO request = new IssueAttributesRequestDTO
            {
                Attributes = await GenerateAttributeValuesAsync(attributes, rootAssetId, rootScheme, issuer, blindingPointRootToRoot).ConfigureAwait(false),
                PublicSpendKey = attributesIssuanceRequest.MasterRootAttributeId == null ? account.PublicSpendKey.ToHexString() : null,
                PublicViewKey = attributesIssuanceRequest.MasterRootAttributeId == null ? account.PublicViewKey.ToHexString() : null,
            };

            if (attributesIssuanceRequest.MasterRootAttributeId == null)
            {
                // Need only in case when _rootAttribute is null, i.e. BlinkID is the Root Attribute
                // =======================================================================================================================
                _assetsService.GetBlindingPoint(await persistency.BindingKeySource.Task.ConfigureAwait(false), rootAssetId, out byte[] blindingPoint, out byte[] blindingFactor);
                byte[] protectionAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, rootAssetId.ToHexString(), issuer).ConfigureAwait(false);
                byte[] protectionAssetNonBlindedCommitment = ConfidentialAssetsHelper.GetNonblindedAssetCommitment(protectionAssetId);
                byte[] protectionAssetCommitment = ConfidentialAssetsHelper.SumCommitments(protectionAssetNonBlindedCommitment, blindingPoint);
                byte[] sessionBlindingFactor = ConfidentialAssetsHelper.GetRandomSeed();
                byte[] sessionCommitment = ConfidentialAssetsHelper.GetAssetCommitment(sessionBlindingFactor, protectionAssetId);
                byte[] diffBlindingFactor = ConfidentialAssetsHelper.GetDifferentialBlindingFactor(sessionBlindingFactor, blindingFactor);
                SurjectionProof surjectionProof = ConfidentialAssetsHelper.CreateSurjectionProof(sessionCommitment, new byte[][] { protectionAssetCommitment }, 0, diffBlindingFactor);
                // =======================================================================================================================

                byte[] bindingKey = await persistency.BindingKeySource.Task.ConfigureAwait(false);
                byte[] blindingPointAssociatedToParent = _assetsService.GetBlindingPoint(bindingKey, rootAssetId);
                request.Attributes.Add(AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, new IssueAttributesRequestDTO.AttributeValue
                {
                    BlindingPointValue = blindingPoint,
                    BlindingPointRoot = blindingPointAssociatedToParent,
                    Value = rootAssetId.ToHexString()
                });
                request.SessionCommitment = sessionCommitment.ToHexString();
                request.SignatureE = surjectionProof.Rs.E.ToHexString();
                request.SignatureS = surjectionProof.Rs.S[0].ToHexString();
            }

            var attributeValues = 
                await _portalConfiguration
                .IdentityProviderUri
                .AppendPathSegments("IssueIdpAttributes", issuer)
                .PostJsonAsync(request)
                .ReceiveJson<IEnumerable<AttributeValue>>()
                .ConfigureAwait(false);

            return Ok(attributeValues);

            async Task<Dictionary<string, IssueAttributesRequestDTO.AttributeValue>> GenerateAttributeValuesAsync(Dictionary<string, string> attributes, byte[] rootAssetId, string rootSchemeName, string issuer, byte[] blindingPointRootToRoot)
            {
                byte[] bindingKey = await persistency.BindingKeySource.Task.ConfigureAwait(false);
                byte[] blindingPointAssociatedToParent = _assetsService.GetBlindingPoint(bindingKey, rootAssetId);
                return attributes
                        .Select(kv =>
                            new KeyValuePair<string, IssueAttributesRequestDTO.AttributeValue>(
                                kv.Key,
                                new IssueAttributesRequestDTO.AttributeValue
                                {
                                    Value = kv.Value,
                                    BlindingPointValue = _assetsService.GetBlindingPoint(bindingKey, rootAssetId, AsyncUtil.RunSync(async () => await _assetsService.GenerateAssetId(kv.Key, kv.Value, issuer).ConfigureAwait(false))),
                                    BlindingPointRoot = kv.Key == rootSchemeName ? blindingPointRootToRoot : blindingPointAssociatedToParent
                                }))
                        .ToDictionary(kv => kv.Key, kv => kv.Value);
            }
        }

        [HttpPost("RequestForIdentity")]
        public async Task<IActionResult> RequestForIdentity(long accountId, [FromBody] RequestForIdentityDto requestForIdentity)
        {
            try
            {
                string actionDetailsUri = requestForIdentity.Target.DecodeFromString64();
                IssuerActionDetails actionDetails = await GetActionDetails(actionDetailsUri).ConfigureAwait(false);

                if (actionDetails == null)
                {
                    _logger.Error($"[{accountId}]: request to {actionDetailsUri} failed");
                    return BadRequest();
                }

                AccountDescriptor account = _accountsService.GetById(accountId);

                (string rootSchemeName, string rootAlias) = await _assetsService.GetRootAttributeSchemeName(actionDetails.Issuer).ConfigureAwait(false);
                byte[] rootAssetId = await _assetsService.GenerateAssetId(rootSchemeName, Uri.UnescapeDataString(requestForIdentity.IdCardContent), actionDetails.Issuer).ConfigureAwait(false);
                byte[] protectionAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, rootAssetId.ToHexString(), actionDetails.Issuer).ConfigureAwait(false);

                _assetsService.GetBlindingPoint(ConfidentialAssetsHelper.PasswordHash(requestForIdentity.Password), protectionAssetId, out byte[] blindingPoint, out byte[] blindingFactor);

                byte[] protectionAssetNonBlindedCommitment = ConfidentialAssetsHelper.GetNonblindedAssetCommitment(protectionAssetId);
                byte[] protectionAssetCommitment = ConfidentialAssetsHelper.SumCommitments(protectionAssetNonBlindedCommitment, blindingPoint);
                byte[] sessionBlindingFactor = ConfidentialAssetsHelper.GetRandomSeed();
                byte[] sessionCommitment = ConfidentialAssetsHelper.GetAssetCommitment(sessionBlindingFactor, protectionAssetId);
                byte[] diffBlindingFactor = ConfidentialAssetsHelper.GetDifferentialBlindingFactor(sessionBlindingFactor, blindingFactor);
                SurjectionProof surjectionProof = ConfidentialAssetsHelper.CreateSurjectionProof(sessionCommitment, new byte[][] { protectionAssetCommitment }, 0, diffBlindingFactor);

                IdentityBaseData identityRequest = new IdentityBaseData
                {
                    PublicSpendKey = account.PublicSpendKey.ToHexString(),
                    PublicViewKey = account.PublicViewKey.ToHexString(),
                    Content = requestForIdentity.IdCardContent,
                    SessionCommitment = sessionCommitment.ToHexString(),
                    SignatureE = surjectionProof.Rs.E.ToHexString(),
                    SignatureS = surjectionProof.Rs.S[0].ToHexString(),
                    BlindingPoint = blindingPoint.ToHexString(),
                    ImageContent = requestForIdentity.ImageContent
                };

                string error = null;

                string uri = actionDetails.ActionUri.DecodeFromString64();
                try
                {
                    _logger.LogIfDebug(() => $"[{accountId}]: Requesting Identity with URI {uri} and session data {JsonConvert.SerializeObject(identityRequest, new ByteArrayJsonConverter())}");
                    await (await uri.PostJsonAsync(identityRequest).ContinueWith(async t =>
                    {
                        if (t.IsCompletedSuccessfully)
                        {
                            string rootAttributeScheme = (await _assetsService.GetRootAttributeSchemeName(actionDetails.Issuer).ConfigureAwait(false)).schemeName;
                            byte[] assetId = await _assetsService.GenerateAssetId(
                                rootAttributeScheme,
                                requestForIdentity.IdCardContent,
                                actionDetails.Issuer).ConfigureAwait(false);
                            _dataAccessService.AddNonConfirmedRootAttribute(accountId, requestForIdentity.IdCardContent, actionDetails.Issuer, rootAttributeScheme, assetId);

                            if (!string.IsNullOrEmpty(requestForIdentity.ImageContent))
                            {
                                _dataAccessService.UpdateUserAssociatedAttributes(accountId, actionDetails.Issuer, new List<Tuple<string, string>> { new Tuple<string, string>(AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO, requestForIdentity.ImageContent) });
                            }
                        }
                        else
                        {
                            error = t.ReceiveString().Result;
                            _logger.Error($"Failure during querying {actionDetails.ActionUri.DecodeFromString64()}, error: {(error ?? "NULL")}", t.Exception);
                        }
                    }, TaskScheduler.Current).ConfigureAwait(false)).ConfigureAwait(false);

                }
                catch (Exception ex)
                {
                    _logger.Error($"Failure during sending request to URI {uri} with body {JsonConvert.SerializeObject(identityRequest)}", ex);
                    throw;
                }
                if (string.IsNullOrEmpty(error))
                {
                    return Ok();
                }

                return BadRequest(error);

            }
            catch (Exception ex)
            {
                _logger.Error($"Failure in {nameof(RequestForIdentity)}", ex);
                throw;
            }
        }

        private async Task<IssuerActionDetails> GetActionDetails(string uri)
        {
            IssuerActionDetails actionDetails = null;

            //string[] authorizationValues = Request.Headers["Authorization"].ToString().Split(" ");

            await uri.GetJsonAsync<IssuerActionDetails>().ContinueWith(t =>
            {
                if (t.IsCompletedSuccessfully)
                {
                    actionDetails = t.Result;
                }
                else
                {
                    _logger.Error($"GetActionDetails, Request to {uri} failed", t.Exception);
                    foreach (var ex in t.Exception.InnerExceptions)
                    {
                        _logger.Error($"GetActionDetails, inner exception", ex);
                    }
                }
            }, TaskScheduler.Current).ConfigureAwait(false);
            return actionDetails;
        }

        [HttpGet("ActionType")]
        public IActionResult GetActionType(string actionInfo)
        {
            string actionDecoded = actionInfo.DecodeFromString64();

            if (actionDecoded.StartsWith("iss://"))
            {
                return Ok(new { Action = "12", ActionInfo = Convert.ToBase64String(Encoding.UTF8.GetBytes(actionDecoded.Replace("iss://", ""))) });
            }
            else if (actionDecoded.StartsWith("dis://"))
            {
                return Ok(new { Action = "11", ActionInfo = Convert.ToBase64String(Encoding.UTF8.GetBytes(actionDecoded.Replace("dis://", ""))) });
            }
            else if (actionDecoded.StartsWith("wreg://"))
            {
                return Ok(new { Action = "10", ActionInfo = Convert.ToBase64String(Encoding.UTF8.GetBytes(actionDecoded.Replace("wreg://", ""))) });
            }
            else if (actionDecoded.StartsWith("saml://"))
            {
                return Ok(new { Action = "2", ActionInfo = actionInfo });
            }
            else if (actionDecoded.StartsWith("prf://"))
            {
                return GetProofActionType(actionDecoded);
            }
            else if (actionDecoded.StartsWith("sig://"))
            {
                return GetSignatureValidationActionType(actionDecoded);
            }
            else if (actionDecoded.StartsWith("spp://"))
            {
                return Ok(new { Action = "2", ActionInfo = actionInfo });
            }
            else
            {
                if (actionDecoded.Contains("ProcessRootIdentityRequest", StringComparison.InvariantCultureIgnoreCase))
                {
                    return Ok(new { Action = "1", ActionInfo = actionInfo });
                }
            }

            return BadRequest();
        }

        private IActionResult GetProofActionType(string actionDecoded)
        {
            return Ok(new { Action = "8", ActionInfo = actionDecoded.Replace("prf://", "") });
        }

        private IActionResult GetSignatureValidationActionType(string actionDecoded)
        {
            return Ok(new { Action = "7", ActionInfo = actionDecoded.Replace("sig://", "") });
        }

        [HttpGet("ServiceProviderActionType")]
        public IActionResult GetServiceProviderActionType(string actionInfo)
        {
            string actionType = null;
            string actionDecoded = actionInfo.DecodeUnescapedFromString64();

            if (actionDecoded.StartsWith("spp://"))
            {
                UriBuilder uriBuilder = new UriBuilder(actionDecoded);
                actionType = HttpUtility.ParseQueryString(uriBuilder.Query)["t"];
            }
            else if (actionDecoded.StartsWith("saml://"))
            {
                actionType = "3";
            }
            else if (actionDecoded.StartsWith("cnsn://"))
            {
                actionType = "4";
            }

            return Ok(new { ActionType = actionType });
        }

        [HttpGet("ServiceProviderActionInfo")]
        public async Task<ActionResult<ServiceProviderActionAndValidationsDto>> GetServiceProviderActionInfo(long accountId, string actionInfo, string assetId, string attributeContent)
        {
            ServiceProviderActionAndValidationsDto serviceProviderActionAndValidations = null;
            UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);

            string actionDecoded = actionInfo.DecodeUnescapedFromString64();

            if (actionDecoded.StartsWith("cnsn://"))
            {
                actionDecoded = actionDecoded.Replace("cnsn://", "");
                TransactionConsentRequest consentRequest = JsonConvert.DeserializeObject<TransactionConsentRequest>(actionDecoded);

                byte[] confirm = _hashCalculation.CalculateHash(Encoding.UTF8.GetBytes(consentRequest.TransactionId));
                byte[] decline = _hashCalculation.CalculateHash(confirm);

                IEnumerable<UserRootAttribute> rootAttributes = _dataAccessService.GetUserAttributes(accountId);
                UserRootAttribute rootAttribute = rootAttributes.FirstOrDefault(a =>
                {
                    utxoPersistency.RelationsBindingService.GetBoundedCommitment(a.AssetId, consentRequest.PublicSpendKey.HexStringToByteArray(), out byte[] registrationBlindingFactor, out byte[] registrationCommitment);
                    return registrationCommitment.Equals32(consentRequest.RegistrationCommitment.HexStringToByteArray());
                });

                serviceProviderActionAndValidations = new ServiceProviderActionAndValidationsDto
                {
                    IsRegistered = false,
                    PublicKey = consentRequest.PublicSpendKey,
                    PublicKey2 = consentRequest.PublicViewKey,
                    IsBiometryRequired = consentRequest.WithBiometricProof,
                    ExtraInfo = $"{consentRequest.TransactionId}|{consentRequest.Description}",
                    Validations = new List<string>(),
                    SessionKey = $"{confirm.ToHexString()}|{decline.ToHexString()}",
                    PredefinedAttributeId = rootAttribute.UserAttributeId
                };

            }
            else if (actionDecoded.StartsWith("spp://"))
            {
                actionDecoded = actionDecoded.Replace("spp://", "");

                UriBuilder uriBuilder = new UriBuilder(actionDecoded);
                NameValueCollection queryParams = HttpUtility.ParseQueryString(uriBuilder.Query);
                string actionType = queryParams["t"];

                byte[] targetBytes = queryParams["pk"]?.HexStringToByteArray();

                if (actionType == "0") // Login and register
                {
                    utxoPersistency.RelationsBindingService.GetBoundedCommitment(assetId.HexStringToByteArray(), targetBytes, out byte[] blindingFactor, out byte[] assetCommitment);
                    queryParams["rk"] = assetId;
                    uriBuilder.Query = queryParams.ToString();
                }
                else if (actionType == "1") // employee registration
                {
                    queryParams["rk"] = attributeContent.EncodeToString64();
                    uriBuilder.Query = queryParams.ToString();
                }

                await uriBuilder.Uri.ToString()
                    .GetJsonAsync<ServiceProviderActionAndValidationsDto>()
                    .ContinueWith(t =>
                    {
                        if (t.IsCompleted && !t.IsFaulted)
                        {
                            serviceProviderActionAndValidations = t.Result;
                        }
                    }, TaskScheduler.Current).ConfigureAwait(false);

                if (actionType == "2") // document sign
                {
                    for (int i = 0; i < serviceProviderActionAndValidations.Validations.Count; i++)
                    {
                        string item = serviceProviderActionAndValidations.Validations[i];
                        string[] validationParts = item.Split(';');
                        (string groupOwnerName, string issuer, string relationAssetId) = _dataAccessService.GetRelationUserAttributes(accountId, validationParts[0], validationParts[1]);
                        if (!string.IsNullOrEmpty(groupOwnerName) && !string.IsNullOrEmpty(issuer) && !string.IsNullOrEmpty(relationAssetId))
                        {
                            serviceProviderActionAndValidations.Validations[i] += $"|Relation to group {validationParts[1]} of {groupOwnerName}|{issuer};{relationAssetId}";
                        }
                        else
                        {
                            serviceProviderActionAndValidations.Validations[i] = null;
                        }
                    }
                }
            }
            else if (actionDecoded.StartsWith("saml://"))
            {
                //utxoPersistency.ClientCryptoService.GetBoundedCommitment(rootAttribute.AssetId, targetBytes, out byte[] blindingFactor, out byte[] assetCommitment);
                //	registrationKey = assetCommitment.ToHexString();
                //	NameValueCollection queryParams = uriBuilder.Uri.ParseQueryString();
                //	queryParams["registrationKey"] = registrationKey;
                //	uriBuilder.Query = queryParams.ToString();

                string sessionInfo = actionDecoded.Replace("saml://", "");

                UriBuilder uriBuilder = new UriBuilder(_restApiConfiguration.SamlIdpUri);
                NameValueCollection queryParams = HttpUtility.ParseQueryString(uriBuilder.Query);
                queryParams["sessionInfo"] = sessionInfo;
                uriBuilder.Query = queryParams.ToString();

                SamlIdpSessionInfo samlIdpSessionInfo = uriBuilder.Uri.ToString().AppendPathSegments("SamlIdp", "GetSessionInfo").GetJsonAsync<SamlIdpSessionInfo>().Result;
                byte[] sessionKeyBytes = new Guid(samlIdpSessionInfo.SessionKey).ToByteArray();
                byte[] sessionKeyComplemented = sessionKeyBytes.ComplementTo32();

                string validationsExpression = string.Empty;

                //if ((samlIdpSessionInfo.IdentityAttributeValidationDefinitions?.IdentityAttributeValidationDefinitions?.Count ?? 0) > 0)
                //{
                //    IEnumerable<Tuple<AttributeType, string>> attributeDescriptions = _identityAttributesService.GetAssociatedAttributeTypes();
                //    IEnumerable<Tuple<ValidationType, string>> validationDescriptions = _identityAttributesService.GetAssociatedValidationTypes();

                //    List<string> validations = new List<string>();

                //    foreach (var idenitityValidation in samlIdpSessionInfo.IdentityAttributeValidationDefinitions.IdentityAttributeValidationDefinitions)
                //    {
                //        AttributeType attributeType = (AttributeType)uint.Parse(idenitityValidation.AttributeType);
                //        ValidationType validationType = (ValidationType)uint.Parse(idenitityValidation.ValidationType);

                //        if (attributeType != AttributeType.DateOfBirth)
                //        {
                //            validations.Add(attributeDescriptions.FirstOrDefault(d => d.Item1 == attributeType)?.Item2 ?? attributeType.ToString());
                //        }
                //        else
                //        {
                //            validations.Add(validationDescriptions.FirstOrDefault(d => d.Item1 == validationType)?.Item2 ?? validationType.ToString());
                //        }
                //    }

                //    validationsExpression = ":" + string.Join("|", validations);
                //}

                serviceProviderActionAndValidations = new ServiceProviderActionAndValidationsDto
                {
                    IsRegistered = false,
                    PublicKey = samlIdpSessionInfo.TargetPublicSpendKey,
                    PublicKey2 = samlIdpSessionInfo.TargetPublicViewKey,
                    IsBiometryRequired = false,
                    ExtraInfo = string.Empty,
                    Validations = samlIdpSessionInfo.Validations,
                    SessionKey = sessionKeyComplemented.ToHexString()
                };

                if ((samlIdpSessionInfo.Validations?.Count ?? 0) > 0)
                {
                    validationsExpression = ":" + string.Join("|", samlIdpSessionInfo.Validations);
                }

            }
            return serviceProviderActionAndValidations;
        }

        [HttpPost("ClearCompromised")]
        public IActionResult ClearCompromised(long accountId)
        {
            _dataAccessService.ClearAccountCompromised(accountId);

            return Ok();
        }

        [HttpGet("DocumentSignatureVerification")]
        public async Task<IActionResult> GetDocumentSignatureVerification([FromQuery] string documentCreator, [FromQuery] string documentHash, [FromQuery] ulong documentRecordHeight, [FromQuery] ulong signatureRecordBlockHeight)
        {
            DocumentSignatureVerification signatureVerification = await _documentSignatureVerifier.Verify(documentCreator.HexStringToByteArray(), documentHash.HexStringToByteArray(), documentRecordHeight, signatureRecordBlockHeight).ConfigureAwait(false);

            return Ok(signatureVerification);
        }

        [HttpGet("GroupRelations")]
        public IActionResult GetGroupRelations(long accountId)
        {
            return Ok(_dataAccessService.GetUserGroupRelations(accountId)?
                .Select(g =>
                new GroupRelationDto
                {
                    GroupRelationId = g.UserGroupRelationId,
                    GroupOwnerName = g.GroupOwnerName,
                    GroupOwnerKey = g.GroupOwnerKey,
                    GroupName = g.GroupName,
                    Issuer = g.Issuer,
                    AssetId = g.AssetId
                }) ?? Array.Empty<GroupRelationDto>());
        }

        [HttpGet("UserRegistrations")]
        public IActionResult GetUserRegistrations(long accountId)
        {
            return Ok(_dataAccessService.GetUserRegistrations(accountId)?
                .Select(g =>
                new UserRegistrationDto
                {
                    UserRegistrationId = g.UserRegistrationId.ToString(),
                    Commitment = g.Commitment,
                    Issuer = g.Issuer,
                    AssetId = g.AssetId
                }) ?? Array.Empty<UserRegistrationDto>());
        }

        [HttpDelete("GroupRelation/{grouprelationId}")]
        public IActionResult DeleteGroupRelation(long grouprelationId)
        {
            _dataAccessService.RemoveUserGroupRelation(grouprelationId);

            return Ok();
        }

        [HttpPost("RelationsProofs")]
        public async Task<IActionResult> SendRelationsProofs(long accountId, [FromBody] RelationsProofsDto relationsProofs)
        {
            _logger.LogIfDebug(() => $"[{accountId}]: {nameof(SendRelationsProofs)} with {nameof(relationsProofs)}={JsonConvert.SerializeObject(relationsProofs, new ByteArrayJsonConverter())}");

            try
            {
                UserRootAttribute userRootAttribute = _dataAccessService.GetUserRootAttribute(relationsProofs.UserAttributeId);
                string assetId = userRootAttribute.AssetId.ToHexString();
                UtxoPersistency utxoPersistency = _executionContextManager.ResolveUtxoExecutionServices(accountId);

                (bool proceed, BiometricProof biometricProof) = (true, null);// await CheckBiometrics(relationsProofs, accountId).ConfigureAwait(false);

                if (true)
                {
                    (byte[] issuer, RelationsProofsInput requestInput) = GetRequestInput<RelationsProofsInput>(relationsProofs, biometricProof);

                    byte[] imageHash;
                    if (!string.IsNullOrEmpty(relationsProofs.ImageContent))
                    {
                        byte[] imageContent = Convert.FromBase64String(relationsProofs.ImageContent);
                        imageHash = ConfidentialAssetsHelper.FastHash256(imageContent);
                    }
                    else
                    {
                        imageHash = new byte[Globals.DEFAULT_HASH_SIZE];
                    }

                    AssociatedProofPreparation[] associatedProofPreparations = null;

                    if (relationsProofs.WithKnowledgeProof)
                    {

                        _assetsService.GetBlindingPoint(ConfidentialAssetsHelper.PasswordHash(relationsProofs.Password), userRootAttribute.AssetId, out byte[] blindingPoint, out byte[] blindingFactor);
                        ;
                        byte[] rootOriginatingCommitment = _assetsService.GetCommitmentBlindedByPoint(userRootAttribute.AssetId, blindingPoint);
                        byte[] groupId = await _identityAttributesService.GetGroupId(AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, relationsProofs.Source).ConfigureAwait(false);
                        byte[] protectionAssetId = await _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_PASSWORD, assetId, relationsProofs.Source).ConfigureAwait(false);
                        byte[] protectionAssetNonBlindedCommitment = ConfidentialAssetsHelper.GetNonblindedAssetCommitment(protectionAssetId);
                        byte[] protectionAssetCommitment = ConfidentialAssetsHelper.SumCommitments(protectionAssetNonBlindedCommitment, blindingPoint);
                        byte[] associatedBlindingFactor = ConfidentialAssetsHelper.GetRandomSeed();
                        byte[] associatedCommitment = ConfidentialAssetsHelper.GetAssetCommitment(associatedBlindingFactor, protectionAssetId);
                        AssociatedProofPreparation associatedProofPreparation = new AssociatedProofPreparation
                        {
                            GroupId = groupId,
                            Commitment = associatedCommitment,
                            CommitmentBlindingFactor = associatedBlindingFactor,
                            OriginatingAssociatedCommitment = protectionAssetCommitment,
                            OriginatingBlindingFactor = blindingFactor,
                            OriginatingRootCommitment = rootOriginatingCommitment
                        };

                        associatedProofPreparations = new AssociatedProofPreparation[] { associatedProofPreparation };
                    }

                    string sessionKey = relationsProofs.Payload;
                    await _restApiConfiguration.ConsentManagementUri
                        .AppendPathSegments("ConsentManagement", "RelationProofsData")
                        .SetQueryParam("sessionKey", sessionKey)
                        .PostJsonAsync(new RelationProofsData
                        {
                            ImageContent = relationsProofs.ImageContent,
                            RelationEntries = relationsProofs.Relations.Select(r => new RelationEntry { RelatedAssetOwnerName = r.GroupOwnerName, RelatedAssetOwnerKey = r.GroupOwnerKey, RelatedAssetName = r.GroupName }).ToArray()
                        }).ConfigureAwait(false);


                    requestInput.Payload = sessionKey.HexStringToByteArray();
                    requestInput.ImageHash = imageHash;
                    requestInput.Relations =
                            (relationsProofs.Relations
                                .Select(r =>
                                new Relation
                                {
                                    RelatedAssetOwner = r.GroupOwnerKey.HexStringToByteArray(),
                                    RelatedAssetId = _assetsService.GenerateAssetId(AttributesSchemes.ATTR_SCHEME_NAME_EMPLOYEEGROUP, r.GroupOwnerKey + r.GroupName, relationsProofs.Source).Result
                                })).ToArray();


                    OutputModel[] outputModels = await _gatewayService.GetOutputs(_restApiConfiguration.RingSize + 1).ConfigureAwait(false);
                    byte[][] issuanceCommitments = await _gatewayService.GetIssuanceCommitments(issuer, _restApiConfiguration.RingSize + 1).ConfigureAwait(false);

                    await utxoPersistency.TransactionsService.SendRelationsProofs(requestInput, associatedProofPreparations, outputModels, issuanceCommitments).ConfigureAwait(false);

                    return Ok();
                }

            }
            catch (Exception ex)
            {
                _logger.Error($"[{accountId}]: failure during {nameof(SendRelationsProofs)}", ex);
                throw;
            }
        }

        private async Task<List<string>> GetRequiredValidations(List<Tuple<string, ValidationType>> validations, string issuer)
        {
            List<string> requiredValidations = new List<string>();
            IEnumerable<(string schemeName, string alias)> attributeDescriptions = await _identityAttributesService.GetAssociatedAttributeSchemes(issuer).ConfigureAwait(false);
            IEnumerable<(string validationType, string validationDescription)> validationDescriptions = _identityAttributesService.GetAssociatedValidationTypes();

            foreach (var validation in validations)
            {
                if (AttributesSchemes.ATTR_SCHEME_NAME_DATEOFBIRTH.Equals(validation.Item1))
                {
                    requiredValidations.Add(ResolveValue(validationDescriptions, validation.Item2.ToString()));
                }
                else
                {
                    requiredValidations.Add(ResolveValue(attributeDescriptions, validation.Item1));
                }
            }

            return requiredValidations;
        }

        [HttpGet("DiscloseSecrets")]
        public ActionResult<string> DiscloseSecrets(long accountId, string password)
        {
            AccountDescriptor account = _accountsService.GetById(accountId);

            Client.Common.Entities.AccountDescriptor accountDescriptor = _accountsService.Authenticate(accountId, password);

            if (accountDescriptor != null)
            {
                string qr = $"dis://{accountDescriptor.SecretSpendKey.ToHexString()}:{accountDescriptor.SecretViewKey.ToHexString()}:{account.LastRegistryCombinedBlock}";
                return Ok(new { qr = qr.EncodeToString64() });
            }

            return BadRequest();
        }

        [HttpPost("ChallengeProofs")]
        public async Task<IActionResult> ChallengeProofs(string key, [FromBody] ProofsRequest proofsRequest)
        {
            HttpResponseMessage httpResponse = await _restApiConfiguration.ConsentManagementUri
                .AppendPathSegments("ConsentManagement", "ChallengeProofs")
                .SetQueryParam("key", key)
                .PostJsonAsync(proofsRequest).ConfigureAwait(false);

            string response = await httpResponse.Content.ReadAsStringAsync().ConfigureAwait(false);
            return Ok(response);
        }

        [HttpGet("PhotoRequired")]
        public async Task<IActionResult> GetPhotoRequired(string target)
        {
            IssuerActionDetails actionDetails = await GetActionDetails(target.DecodeFromString64()).ConfigureAwait(false);

            var schemeNames = await _assetsService.GetAssociatedAttributeSchemeNames(actionDetails.Issuer).ConfigureAwait(false);

            return Ok(new { IsPhotoRequired = schemeNames.Any(s => s.schemeName == AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO) });
        }
    }
}