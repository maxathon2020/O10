﻿using O10.Core.Architecture;
using O10.Core.Architecture.Enums;
using O10.Core.Configuration;

namespace O10.Web.Server.Configuration
{
    [RegisterExtension(typeof(IConfigurationSection), Lifetime = LifetimeManagement.Singleton)]
    public class PortalConfiguration : ConfigurationSectionBase, IPortalConfiguration
    {
        public const string SECTION_NAME = "AppSettings";

        public PortalConfiguration(IAppConfig appConfig) : base(appConfig, SECTION_NAME)
        {

        }

        public string FacePersonGroupId { get; set; }
        public bool DemoMode { get; set; }
        public string DemoPassword { get; set; }

        public string IdentityProviderUri { get; set; }
    }
}
