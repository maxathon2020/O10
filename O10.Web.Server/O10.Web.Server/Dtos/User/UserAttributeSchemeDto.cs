using System.Collections.Generic;

namespace O10.Web.Server.Dtos.User
{
    public class UserAttributeSchemeDto
    {
        public UserAttributeSchemeDto()
        {
            RootAttributes = new List<UserAttributeDto>();
        }

        public AttributeState State { get; set; }
        public string Issuer { get; set; }
        public string IssuerName { get; set; }
        public string RootAttributeContent { get; set; }
        public string RootAssetId { get; set; }
        public string SchemeName { get; set; }
        public List<UserAttributeDto> RootAttributes { get; set; }

    }
}
