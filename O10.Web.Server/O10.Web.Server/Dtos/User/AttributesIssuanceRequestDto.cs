using System.Collections.Generic;

namespace O10.Web.Server.Dtos.User
{
    public class AttributesIssuanceRequestDto
    {
        public long? MasterRootAttributeId { get; set; }
        public string Issuer { get; set; }

        /// <summary>
        /// The key is schemeName
        /// </summary>
        public Dictionary<string, string> AttributeValues { get; set; }

    }
}
