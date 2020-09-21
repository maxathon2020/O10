using System.Collections.Generic;

namespace O10.Web.Server.Dtos.IdentityProvider
{
    public class IdentityAttributeValidationSchemaDto
    {
        public ushort ValidationType { get; set; }

        public List<string> ValidationCriterionTypes { get; set; }
    }
}
