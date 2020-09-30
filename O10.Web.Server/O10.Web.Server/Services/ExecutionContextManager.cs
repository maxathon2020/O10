using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks.Dataflow;
using O10.Transactions.Core.Parsers;
using O10.Client.Common.Communication;
using O10.Client.Common.Crypto;
using O10.Client.Common.Interfaces;
using O10.Client.DataLayer.Services;
using O10.Core.Architecture;
using O10.Core.Architecture.Enums;
using O10.Core.Configuration;
using O10.Core.Logging;
using Microsoft.Extensions.DependencyInjection;
using O10.Core.Tracking;
using O10.Crypto.ConfidentialAssets;
using O10.Client.Web.Common.Hubs;
using O10.Client.Web.Common.Services;
using Chaos.NaCl;
using O10.Core;
using O10.Client.Common.Configuration;
using System.Threading.Tasks;
using O10.Web.Server.Exceptions;

namespace O10.Web.Server.Services
{
    [RegisterDefaultImplementation(typeof(IExecutionContextManager), Lifetime = LifetimeManagement.Singleton)]
    public class ExecutionContextManager : IExecutionContextManager
    {
        private readonly Dictionary<long, StatePersistency> _statePersistencyItems = new Dictionary<long, StatePersistency>();
        private readonly Dictionary<long, UtxoPersistencyEx> _utxoPersistencyItems = new Dictionary<long, UtxoPersistencyEx>();
        private readonly Dictionary<long, ICollection<IDisposable>> _accountIdCancellationList;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<IdentitiesHub> _identitiesHubContext;
        private readonly IAssetsService _assetsService;
        private readonly IDataAccessService _dataAccessService;
        private readonly IIdentityAttributesService _identityAttributesService;
        private readonly IWitnessPackagesProviderRepository _witnessPackagesProviderRepository;
        private readonly IBlockParsersRepositoriesRepository _blockParsersRepositoriesRepository;
        private readonly IGatewayService _gatewayService;
        private readonly ITrackingService _trackingService;
        private readonly ILoggerService _loggerService;
        private readonly ISpValidationsService _spValidationsService;
        private readonly ILogger _logger;
        private readonly IRelationsProofsValidationService _relationsProofsValidationService;
        private readonly ISchemeResolverService _schemeResolverService;
        private readonly IUniversalProofsPool _universalProofsPool;
        private readonly IConsentManagementService _consentManagementService;
        private readonly IRestApiConfiguration _restApiConfiguration;


        public ExecutionContextManager(IServiceProvider serviceProvider,
                                 IHubContext<IdentitiesHub> identitiesHubContext,
                                 IAssetsService assetsService,
                                 IDataAccessService dataAccessService,
                                 IIdentityAttributesService identityAttributesService,
                                 IWitnessPackagesProviderRepository witnessPackagesProviderRepository,
                                 IBlockParsersRepositoriesRepository blockParsersRepositoriesRepository,
                                 IConfigurationService configurationService,
                                 IGatewayService gatewayService,
                                 ITrackingService trackingService,
                                 ILoggerService loggerService,
                                 ISpValidationsService spValidationsService,
                                 IRelationsProofsValidationService relationsProofsValidationService,
                                 ISchemeResolverService schemeResolverService,
                                 IUniversalProofsPool universalProofsPool,
                                 IConsentManagementService consentManagementService)
        {
            _accountIdCancellationList = new Dictionary<long, ICollection<IDisposable>>();
            _serviceProvider = serviceProvider;
            _identitiesHubContext = identitiesHubContext;
            _assetsService = assetsService;
            _dataAccessService = dataAccessService;
            _identityAttributesService = identityAttributesService;
            _witnessPackagesProviderRepository = witnessPackagesProviderRepository;
            _blockParsersRepositoriesRepository = blockParsersRepositoriesRepository;
            _gatewayService = gatewayService;
            _trackingService = trackingService;
            _loggerService = loggerService;
            _spValidationsService = spValidationsService;
            _logger = loggerService.GetLogger(nameof(ExecutionContextManager));
            _relationsProofsValidationService = relationsProofsValidationService;
            _schemeResolverService = schemeResolverService;
            _universalProofsPool = universalProofsPool;
            _consentManagementService = consentManagementService;
            _restApiConfiguration = configurationService.Get<IRestApiConfiguration>();
        }

        public void InitializeStateExecutionServices(long accountId, byte[] secretKey, Func<long, IStateTransactionsService, IStateClientCryptoService, CancellationToken, IUpdater> updaterFactory = null)
        {
            if (_statePersistencyItems.ContainsKey(accountId))
            {
                _logger.Info($"[{accountId}]: Account with id {accountId} already registered at StatePersistency");
                return;
            }

            _logger.Info($"[{accountId}]: {nameof(InitializeStateExecutionServices)} for account with id {accountId}");

            try
            {
                IWitnessPackagesProvider packetsProvider = _witnessPackagesProviderRepository.GetInstance(_restApiConfiguration.WitnessProviderName);
                IStateTransactionsService transactionsService = ActivatorUtilities.CreateInstance<StateTransactionsService>(_serviceProvider);
                IStateClientCryptoService clientCryptoService = ActivatorUtilities.CreateInstance<StateClientCryptoService>(_serviceProvider);
                IWalletSynchronizer walletSynchronizer = ActivatorUtilities.CreateInstance<StateWalletSynchronizer>(_serviceProvider);
                StatePacketsExtractor statePacketsExtractor = ActivatorUtilities.CreateInstance<StatePacketsExtractor>(_serviceProvider);

                CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();

                packetsProvider.Initialize(accountId, cancellationTokenSource.Token);
                clientCryptoService.Initialize(secretKey);
                transactionsService.AccountId = accountId;
                ulong lastBlockHeight = AsyncUtil.RunSync(() => _gatewayService.GetLastBlockHeight(ConfidentialAssetsHelper.GetPublicKey(Ed25519.SecretKeyFromSeed(secretKey))));
                transactionsService.Initialize(clientCryptoService, lastBlockHeight);
                transactionsService.PipeOutTransactions.LinkTo(_gatewayService.PipeInTransactions);
                statePacketsExtractor.Initialize(clientCryptoService);
                statePacketsExtractor.AccountId = accountId;

                IUpdater updater = updaterFactory != null ? updaterFactory(accountId, transactionsService, clientCryptoService, cancellationTokenSource.Token) : CreateStateUpdater(accountId, transactionsService, clientCryptoService, cancellationTokenSource.Token);

                walletSynchronizer.Initialize(accountId, clientCryptoService);

                packetsProvider.PipeOut.LinkTo(statePacketsExtractor.PipeIn);
                statePacketsExtractor.PipeOutPackets.LinkTo(walletSynchronizer.PipeInPackets);
                statePacketsExtractor.PipeOutProcessed.LinkTo(walletSynchronizer.PipeInPackage);
                walletSynchronizer.PipeOutPackets.LinkTo(updater.PipeIn);

                packetsProvider.Start();

                var state = new StatePersistency
                {
                    AccountId = accountId,
                    PacketsProvider = packetsProvider,
                    TransactionsService = transactionsService,
                    PacketsExtractor = statePacketsExtractor,
                    ClientCryptoService = clientCryptoService,
                    WalletSynchronizer = walletSynchronizer,
                    CancellationTokenSource = cancellationTokenSource
                };

                _statePersistencyItems.Add(accountId, state);
            }
            catch (Exception ex)
            {
                _logger.Error($"[{accountId}]: Failure during {nameof(InitializeStateExecutionServices)} for account with id {accountId}", ex);
                throw;
            }
        }

        private IUpdater CreateStateUpdater(long accountId, IStateTransactionsService transactionsService, IStateClientCryptoService clientCryptoService,
                                      CancellationToken cancellationToken)
            => new ServiceProviderUpdater(accountId, clientCryptoService, _assetsService, _dataAccessService, _identityAttributesService,
                                 _blockParsersRepositoriesRepository, _gatewayService, transactionsService, _spValidationsService,
                                 _identitiesHubContext, _loggerService, _consentManagementService, _universalProofsPool, cancellationToken);

        public void InitializeUtxoExecutionServices(long accountId, byte[] secretSpendKey, byte[] secretViewKey, byte[] pwdSecretKey, Func<long, IUtxoClientCryptoService, CancellationToken, IUpdater> updaterFactory = null)
        {
            if (_utxoPersistencyItems.ContainsKey(accountId))
            {
                _logger.Info($"[{accountId}]: account already registered at UtxoPersistency");
                return;
            }

            _logger.Info($"[{accountId}]: {nameof(InitializeUtxoExecutionServices)}");

            try
            {
                IWitnessPackagesProvider packetsProvider = _witnessPackagesProviderRepository.GetInstance(_restApiConfiguration.WitnessProviderName);
                IUtxoTransactionsService transactionsService = ActivatorUtilities.CreateInstance<UtxoTransactionsService>(_serviceProvider);
                IUtxoClientCryptoService clientCryptoService = ActivatorUtilities.CreateInstance<UtxoClientCryptoService>(_serviceProvider);
                IRelationsBindingService relationsBindingService = ActivatorUtilities.CreateInstance<RelationsBindingService>(_serviceProvider);
                UtxoWalletSynchronizer walletSynchronizer = ActivatorUtilities.CreateInstance<UtxoWalletSynchronizer>(_serviceProvider);
                UtxoWalletPacketsExtractor utxoWalletPacketsExtractor = ActivatorUtilities.CreateInstance<UtxoWalletPacketsExtractor>(_serviceProvider);

                CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();

                packetsProvider.Initialize(accountId, cancellationTokenSource.Token);
                clientCryptoService.Initialize(secretSpendKey, secretViewKey);
              
                TaskCompletionSource<byte[]> pwdSource = new TaskCompletionSource<byte[]>();
                if(pwdSecretKey != null)
                {
                    pwdSource.SetResult(pwdSecretKey);
                }
                relationsBindingService.Initialize(pwdSource);
              
                transactionsService.AccountId = accountId;
                transactionsService.Initialize(clientCryptoService, relationsBindingService);
                utxoWalletPacketsExtractor.AccountId = accountId;
                utxoWalletPacketsExtractor.Initialize(clientCryptoService);
                transactionsService.PipeOutTransactions.LinkTo(_gatewayService.PipeInTransactions);
                transactionsService.PipeOutKeyImages.LinkTo(utxoWalletPacketsExtractor.PipeInKeyImages);

                IUpdater userIdentitiesUpdater = updaterFactory != null ? updaterFactory(accountId, clientCryptoService, cancellationTokenSource.Token) : CreateUtxoUpdater(accountId, clientCryptoService, cancellationTokenSource.Token);

                walletSynchronizer.Initialize(accountId, clientCryptoService);

                packetsProvider.PipeOut.LinkTo(utxoWalletPacketsExtractor.PipeIn);
                utxoWalletPacketsExtractor.PipeOutPackets.LinkTo(walletSynchronizer.PipeInPackets);
                utxoWalletPacketsExtractor.PipeOutProcessed.LinkTo(walletSynchronizer.PipeInPackage);
                utxoWalletPacketsExtractor.PipeOutNotifications.LinkTo(userIdentitiesUpdater.PipInNotifications);

                walletSynchronizer.PipeOutPackets.LinkTo(userIdentitiesUpdater.PipeIn);
                walletSynchronizer.PipeOutNotifications.LinkTo(userIdentitiesUpdater.PipInNotifications);

                packetsProvider.Start();

                var state = new UtxoPersistencyEx
                {
                    AccountId = accountId,
                    PacketsProvider = packetsProvider,
                    TransactionsService = transactionsService,
                    ClientCryptoService = clientCryptoService,
                    RelationsBindingService = relationsBindingService,
                    PacketsExtractor = utxoWalletPacketsExtractor,
                    WalletSynchronizer = walletSynchronizer,
                    CancellationTokenSource = cancellationTokenSource,
                    BindingKeySource = pwdSource
                };
                _utxoPersistencyItems.Add(accountId, state);
            }
            catch (Exception ex)
            {
                _logger.Error($"[{accountId}]: Failure during {nameof(InitializeUtxoExecutionServices)}", ex);

                throw;
            }
        }

        private IUpdater CreateUtxoUpdater(long accountId, IUtxoClientCryptoService clientCryptoService, CancellationToken cancellationToken) => 
            new UserIdentitiesUpdater(accountId, clientCryptoService, _assetsService, _dataAccessService, _identitiesHubContext, _relationsProofsValidationService, _schemeResolverService, _loggerService, cancellationToken);

        public void Clean(long accountId)
        {
            if (_accountIdCancellationList.ContainsKey(accountId))
            {
                _accountIdCancellationList[accountId].ToList().ForEach(t => t.Dispose());

                if (_utxoPersistencyItems.ContainsKey(accountId))
                {
                    _utxoPersistencyItems.Remove(accountId);
                }
                if (_statePersistencyItems.ContainsKey(accountId))
                {
                    _statePersistencyItems.Remove(accountId);
                }
            }
        }

        public StatePersistency ResolveStateExecutionServices(long accountId)
        {
            if(!_statePersistencyItems.ContainsKey(accountId))
            {
                throw new ExecutionContextNotStartedException(accountId);
            }

            return _statePersistencyItems[accountId];
        }

        public UtxoPersistencyEx ResolveUtxoExecutionServices(long accountId)
        {
            if (!_utxoPersistencyItems.ContainsKey(accountId))
            {
                throw new ExecutionContextNotStartedException(accountId);
            }

            return _utxoPersistencyItems[accountId];
        }

        public void UnregisterExecutionServices(long accountId)
        {
            _logger.Info($"[{accountId}]: Stopping services for account");

            if (_statePersistencyItems.ContainsKey(accountId))
            {
                StatePersistency persistency = _statePersistencyItems[accountId];
                persistency.CancellationTokenSource.Cancel();
                persistency.WalletSynchronizer.Dispose();

                _statePersistencyItems.Remove(accountId);
                persistency.TransactionsService = null;
                persistency.WalletSynchronizer = null;
                persistency.ClientCryptoService = null;
            }
            else if (_utxoPersistencyItems.ContainsKey(accountId))
            {
                UtxoPersistency persistency = _utxoPersistencyItems[accountId];
                persistency.CancellationTokenSource.Cancel();
                persistency.WalletSynchronizer.Dispose();

                _utxoPersistencyItems.Remove(accountId);
                persistency.TransactionsService = null;
                persistency.WalletSynchronizer = null;
                persistency.ClientCryptoService = null;
            }

            Clean(accountId);
        }
    }
}
