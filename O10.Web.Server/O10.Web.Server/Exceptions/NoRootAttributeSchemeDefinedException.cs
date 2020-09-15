using System;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class NoRootAttributeSchemeDefinedException : Exception
    {
        public NoRootAttributeSchemeDefinedException() { }
        public NoRootAttributeSchemeDefinedException(string issuer) : base(string.Format(Resources.ERR_NO_ROOT_SCHEME_DEFINED, issuer)) { }
        public NoRootAttributeSchemeDefinedException(string issuer, Exception inner) : base(string.Format(Resources.ERR_NO_ROOT_SCHEME_DEFINED, issuer), inner) { }
        protected NoRootAttributeSchemeDefinedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
