﻿using System.Collections.Generic;

namespace O10.Web.Server.Dtos.ServiceProvider
{
    public class ServiceProviderRegistrationExDto : ServiceProviderRegistrationDto
    {
        public string Issuer { get; set; }
        public string IssuerName { get; set; }
        public string RootAttributeName { get; set; }
        public List<string> IssuanceCommitments { get; set; }
    }
}
