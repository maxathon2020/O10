using O10.Web.Server.Properties;
using System;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class AccountAuthenticationFailedException : Exception
    {
        public AccountAuthenticationFailedException() { }
        public AccountAuthenticationFailedException(long accountId) : base(string.Format(Resources.ERR_ACCOUNT_AUTHENTICATION_FAILED, accountId)) { }
        public AccountAuthenticationFailedException(long accountId, Exception inner) : base(string.Format(Resources.ERR_ACCOUNT_AUTHENTICATION_FAILED, accountId), inner) { }
        protected AccountAuthenticationFailedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
