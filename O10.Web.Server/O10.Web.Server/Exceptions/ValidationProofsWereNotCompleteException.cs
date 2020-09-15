using Newtonsoft.Json;
using System;
using O10.Client.DataLayer.Model;
using O10.Core.Logging;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class ValidationProofsWereNotCompleteException : Exception
    {
        public ValidationProofsWereNotCompleteException() { }
        public ValidationProofsWereNotCompleteException(SpIdenitityValidation idenitityValidation) : base(string.Format(Resources.ERR_VALIDATION_PROOFS_NOT_COMPLETE, JsonConvert.SerializeObject(idenitityValidation, new ByteArrayJsonConverter()))) { }
        public ValidationProofsWereNotCompleteException(string schemeName) : base(string.Format(Resources.ERR_VALIDATION_PROOFS_NOT_COMPLETE, schemeName)) { }
        public ValidationProofsWereNotCompleteException(SpIdenitityValidation idenitityValidation, Exception inner) : base(string.Format(Resources.ERR_VALIDATION_PROOFS_NOT_COMPLETE, JsonConvert.SerializeObject(idenitityValidation, new ByteArrayJsonConverter())), inner) { }
        protected ValidationProofsWereNotCompleteException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
