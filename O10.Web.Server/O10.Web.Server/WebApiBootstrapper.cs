﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using O10.Client.Common;
using O10.Client.Common.Configuration;
using O10.Client.Common.Interfaces;
using O10.Core.Configuration;
using O10.Core.Logging;
using O10.Core.ExtensionMethods;

namespace O10.Web.Server
{
    public class WebApiBootstrapper : ClientBootstrapper
    {
        private readonly string[] _catalogItems = new string[] { "O10.Client.Web.Common.dll", "O10.Web.Server.dll" };

        protected override IEnumerable<string> EnumerateCatalogItems(string rootFolder)
        {
            return base.EnumerateCatalogItems(rootFolder)
                .Concat(_catalogItems)
                .Concat(Directory.EnumerateFiles(rootFolder, "O10.IdentityProvider.DataLayer*.dll").Select(f => new FileInfo(f).Name));
        }

        public override void RunInitializers(IServiceProvider serviceProvider, CancellationToken cancellationToken, ILogger logger)
        {
            IGatewayService gatewayService = (IGatewayService)serviceProvider.GetService(typeof(IGatewayService));
            IRestApiConfiguration configuration = ((IConfigurationService)serviceProvider.GetService(typeof(IConfigurationService))).Get<IRestApiConfiguration>();
            gatewayService.Initialize(configuration.GatewayUri, cancellationToken);

            base.RunInitializers(serviceProvider, cancellationToken, logger);
        }
    }
}
