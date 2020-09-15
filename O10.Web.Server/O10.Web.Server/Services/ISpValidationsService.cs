using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using O10.Transactions.Core.DataModel.UtxoConfidential.Internal;
using O10.Client.Common.Dtos.UniversalProofs;
using O10.Client.DataLayer.Model;
using O10.Core.Cryptography;
using O10.Core.Architecture;

namespace O10.Web.Server.Services
{
    [ServiceContract]
    public interface ISpValidationsService
    {
        Task<bool> CheckSpIdentityValidations(Memory<byte> commitment, AssociatedProofs[] associatedProofsList, IEnumerable<SpIdenitityValidation> spIdenitityValidations, string issuer);
        Task<bool> CheckAssociatedProofs(Memory<byte> rootCommitment, IEnumerable<AttributesByIssuer> associatedAttributes, IEnumerable<SpIdenitityValidation> spIdenitityValidations);
        Task CheckEligibilityProofs(Memory<byte> assetCommitment, SurjectionProof eligibilityProofs, Memory<byte> issuer);
        (long registrationId, bool isNew) HandleAccount(long accountId, Memory<byte> assetCommitment, SurjectionProof authenticationProof);
    }
}
