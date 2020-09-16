using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using O10.Transactions.Core.DataModel.UtxoConfidential.Internal;
using O10.Client.DataLayer.Model;
using O10.Core.Architecture;
using O10.Core.ExtensionMethods;
using O10.Core.Architecture.Enums;
using O10.Crypto.ConfidentialAssets;
using O10.Client.Common.Interfaces;
using O10.Core.Cryptography;
using O10.Client.DataLayer.Services;
using O10.Client.DataLayer.AttributesScheme;
using System.Diagnostics.Contracts;
using O10.Core.Logging;
using O10.Client.Common.Dtos.UniversalProofs;
using O10.Web.Server.Exceptions;

namespace O10.Web.Server.Services
{
    [RegisterDefaultImplementation(typeof(ISpValidationsService), Lifetime = LifetimeManagement.Singleton)]
    public class SpValidationsService : ISpValidationsService
    {
        private readonly IIdentityAttributesService _identityAttributesService;
        private readonly IGatewayService _gatewayService;
        private readonly IAssetsService _assetsService;
        private readonly IDataAccessService _dataAccessService;
        private readonly ILogger _logger;

        public SpValidationsService(
            IIdentityAttributesService identityAttributesService,
            IGatewayService gatewayService,
            IAssetsService assetsService,
            ILoggerService loggerService,
            IDataAccessService dataAccessService)
        {
            _identityAttributesService = identityAttributesService;
            _gatewayService = gatewayService;
            _assetsService = assetsService;
            _dataAccessService = dataAccessService;
            _logger = loggerService.GetLogger(nameof(SpValidationsService));
        }

        public async Task<bool> CheckSpIdentityValidations(Memory<byte> commitment, AssociatedProofs[] associatedProofsList, IEnumerable<SpIdenitityValidation> spIdenitityValidations, string issuer)
        {
            if (spIdenitityValidations?.Any(v => v.SchemeName != AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO) ?? false)
            {
                if (associatedProofsList == null)
                {
                    throw new NoValidationProofsException();
                }

                foreach (var spIdentityValidation in spIdenitityValidations)
                {
                    await CheckSpIdentityValidation(commitment, associatedProofsList, spIdentityValidation, issuer).ConfigureAwait(false);
                }
            }

            return true;
        }

        public async Task CheckEligibilityProofs(Memory<byte> assetCommitment, SurjectionProof eligibilityProofs, Memory<byte> issuer)
        {
            Contract.Requires(eligibilityProofs != null);

            bool isCommitmentCorrect = ConfidentialAssetsHelper.VerifySurjectionProof(eligibilityProofs, assetCommitment.Span);

            if (!isCommitmentCorrect)
            {
                throw new CommitmentNotEligibleException();
            }

            bool res = await _gatewayService.AreRootAttributesValid(issuer, eligibilityProofs.AssetCommitments.Select(a => new Memory<byte>(a))).ConfigureAwait(false);

            if (!res)
            {
                throw new CommitmentNotEligibleException();
            }
        }

        public (long registrationId, bool isNew) HandleAccount(long accountId, Memory<byte> assetCommitment, SurjectionProof authenticationProof)
        {
            if (_dataAccessService.GetServiceProviderRegistrationId(accountId, authenticationProof.AssetCommitments[0], out long registrationId))
            {
                bool isAuthenticationProofValid = ConfidentialAssetsHelper.VerifySurjectionProof(authenticationProof, assetCommitment.Span);

                if (!isAuthenticationProofValid)
                {
                    throw new SpAuthenticationProofsFailedException();
                }

                return (registrationId, false);
            }
            else
            {
                long id = _dataAccessService.AddServiceProviderRegistration(accountId, authenticationProof.AssetCommitments[0]);
                return (id, true);
            }
        }

        public async Task<bool> CheckAssociatedProofs(Memory<byte> rootCommitment, IEnumerable<AttributesByIssuer> associatedAttributes, IEnumerable<SpIdenitityValidation> spIdenitityValidations)
        {
            if (spIdenitityValidations?.Any(v => v.SchemeName != AttributesSchemes.ATTR_SCHEME_NAME_PASSPORTPHOTO) ?? false)
            {
                if (!(associatedAttributes?.Any() ?? false))
                {
                    throw new NoValidationProofsException();
                }

                foreach (var spIdentityValidation in spIdenitityValidations)
                {
                    await CheckAssociatedProof(rootCommitment, associatedAttributes, spIdentityValidation.SchemeName).ConfigureAwait(false);
                }
            }

            return true;
        }

        private async Task CheckAssociatedProof(Memory<byte> rootCommitment, IEnumerable<AttributesByIssuer> associatedAttributes, string schemeName)
        {
            AttributesByIssuer associatedAttributesForCheck = associatedAttributes.FirstOrDefault(c => c.RootAttribute.SchemeName == schemeName || c.Attributes.Any(a => a.SchemeName == schemeName));
            if (associatedAttributesForCheck == null)
            {
                throw new ValidationProofsWereNotCompleteException(schemeName);
            }

            //_logger.LogIfDebug(() => $"{nameof(CheckAssociatedProof)}: \r\n{nameof(rootCommitment)}={rootCommitment.ToHexString()}, \r\n{nameof(associatedRootAttribute)}={{0}}");
            bool proofToRoot = ConfidentialAssetsHelper.VerifySurjectionProof(associatedAttributesForCheck.RootAttribute.BindingProof, rootCommitment.Span);
            if (!proofToRoot)
            {
                _logger.Error("Proof of binding to Root failed");
                throw new ValidationProofFailedException(schemeName);
            }

            AttributeProofs attributeForCheck;
            if (schemeName == associatedAttributesForCheck.RootAttribute.SchemeName)
            {
                attributeForCheck = associatedAttributesForCheck.RootAttribute;

                if (attributeForCheck == null)
                {
                    throw new ValidationProofsWereNotCompleteException(schemeName);
                }
            }
            else
            {
                attributeForCheck = associatedAttributesForCheck.Attributes.FirstOrDefault(a => a.SchemeName == schemeName);

                if (attributeForCheck == null)
                {
                    throw new ValidationProofsWereNotCompleteException(schemeName);
                }

                // Check binding to the Root Attribute
                bool proofToAssociatedRoot = ConfidentialAssetsHelper.VerifySurjectionProof(attributeForCheck.BindingProof, associatedAttributesForCheck.RootAttribute.Commitment.Value.Span);
                if (!proofToAssociatedRoot)
                {
                    _logger.Error("Proof of binding to Associated Root failed");
                    throw new ValidationProofFailedException(schemeName);
                }
            }

            if (attributeForCheck.CommitmentProof.Values?.Any() ?? false)
            {
                long schemeId = await _assetsService.GetSchemeId(schemeName, associatedAttributesForCheck.Issuer.ToString()).ConfigureAwait(false);

                byte[][] assetIds = attributeForCheck.CommitmentProof.Values.Select(v => _assetsService.GenerateAssetId(schemeId, v)).ToArray();

                bool proofOfValue = ConfidentialAssetsHelper.VerifyIssuanceSurjectionProof(attributeForCheck.CommitmentProof.SurjectionProof, attributeForCheck.Commitment.Value.Span, assetIds);
                if (!proofOfValue)
                {
                    _logger.Error("Proof of value failed");
                    throw new ValidationProofFailedException(schemeName);
                }
            }
            else
            {
                bool proofOfValueKnowledge = ConfidentialAssetsHelper.VerifySurjectionProof(attributeForCheck.CommitmentProof.SurjectionProof, attributeForCheck.Commitment.Value.Span);
                if (!proofOfValueKnowledge)
                {
                    _logger.Error("Proof of value knowledge failed");
                    throw new ValidationProofFailedException(schemeName);
                }
            }
        }

        private async Task CheckSpIdentityValidation(Memory<byte> commitment, AssociatedProofs[] associatedProofsList, SpIdenitityValidation spIdentityValidation, string issuer)
        {
            byte[] groupId = await _identityAttributesService.GetGroupId(spIdentityValidation.SchemeName, issuer).ConfigureAwait(false);

            AssociatedProofs associatedProofs = associatedProofsList.FirstOrDefault(P => P.AssociatedAssetGroupId.Equals32(groupId));
            if (associatedProofs == null)
            {
                throw new ValidationProofsWereNotCompleteException(spIdentityValidation);
            }

            bool associatedProofValid;

            if (associatedProofs is AssociatedAssetProofs associatedAssetProofs)
            {
                associatedProofValid = ConfidentialAssetsHelper.VerifySurjectionProof(associatedAssetProofs.AssociationProofs, associatedAssetProofs.AssociatedAssetCommitment);
            }
            else
            {
                associatedProofValid = ConfidentialAssetsHelper.VerifySurjectionProof(associatedProofs.AssociationProofs, commitment.Span);
            }

            bool rootProofValid = ConfidentialAssetsHelper.VerifySurjectionProof(associatedProofs.RootProofs, commitment.Span);

            if (!rootProofValid || !associatedProofValid)
            {
                throw new ValidationProofFailedException(spIdentityValidation);
            }

            //TODO: !!! adjust checking either against Gateway or against local database
            bool found = true; // associatedProofs.AssociationProofs.AssetCommitments.Any(a => associatedProofs.RootProofs.AssetCommitments.Any(r => _dataAccessService.CheckAssociatedAtributeExist(null, a, r)));

            if (!found)
            {
                throw new ValidationProofFailedException(spIdentityValidation);
            }
        }
    }
}
