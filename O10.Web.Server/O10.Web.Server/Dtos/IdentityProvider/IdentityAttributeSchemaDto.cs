using System.Collections.Generic;

namespace O10.Web.Server.Dtos.IdentityProvider
{
    public class IdentityAttributeSchemaDto
    {
        public string Name { get; set; }

        public string SchemeName { get; set; }

        public List<IdentityAttributeValidationSchemaDto> AvailableValidations { get; set; }
    }
}
