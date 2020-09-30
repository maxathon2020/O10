using System.Collections.Generic;

namespace O10.Web.Server.Dtos.IdentityProvider
{
    public class IdentityAttributesSchemaDto
    {
        public IdentityAttributeSchemaDto RootAttribute { get; set; }

        public List<IdentityAttributeSchemaDto> AssociatedAttributes { get; set; }
    }
}
