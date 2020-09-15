using System;
using System.Threading;
using O10.Client.Common.Interfaces;
using O10.Client.Web.Common.Services;
using O10.Core.Architecture;

namespace O10.Web.Server.Services
{
    [ServiceContract]
    public interface IExecutionContextManager
    {
        void InitializeStateExecutionServices(long accountId, byte[] secretKey, Func<long, IStateTransactionsService, IStateClientCryptoService, CancellationToken, IUpdater> updaterFactory = null);
        void InitializeUtxoExecutionServices(long accountId, byte[] secretSpendKey, byte[] secretViewKey, byte[] pwdSecretKey, Func<long, IUtxoClientCryptoService, CancellationToken, IUpdater> updaterFactory = null);
        StatePersistency ResolveStateExecutionServices(long accountId);
        UtxoPersistency ResolveUtxoExecutionServices(long accountId);
        void UnregisterExecutionServices(long accountId);
    }
}