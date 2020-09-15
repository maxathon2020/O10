using Newtonsoft.Json;
using System;
using O10.Client.DataLayer.Model;
using O10.Core.Logging;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class ValidationProofFailedException : Exception
    {
        public ValidationProofFailedException() { }
        public ValidationProofFailedException(SpIdenitityValidation idenitityValidation) : base(string.Format(Resources.ERR_VALIDATION_PROOF_FAILED, JsonConvert.SerializeObject(idenitityValidation, new ByteArrayJsonConverter()))) { }
        public ValidationProofFailedException(string schemeName) : base(string.Format(Resources.ERR_VALIDATION_PROOF_FAILED, schemeName)) { }
        public ValidationProofFailedException(SpIdenitityValidation idenitityValidation, Exception inner) : base(string.Format(Resources.ERR_VALIDATION_PROOF_FAILED, JsonConvert.SerializeObject(idenitityValidation, new ByteArrayJsonConverter())), inner) { }
        protected ValidationProofFailedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
