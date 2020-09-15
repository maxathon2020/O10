using System;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class SpAuthenticationProofsFailedException : Exception
    {
        public SpAuthenticationProofsFailedException() : base(Resources.ERR_SP_AUTHENTICATION_FAILED) { }
        public SpAuthenticationProofsFailedException(Exception inner) : base(Resources.ERR_SP_AUTHENTICATION_FAILED, inner) { }
        protected SpAuthenticationProofsFailedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
