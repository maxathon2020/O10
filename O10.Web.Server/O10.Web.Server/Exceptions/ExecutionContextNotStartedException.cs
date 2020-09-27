using O10.Web.Server.Properties;
using System;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class ExecutionContextNotStartedException : Exception
    {
        public ExecutionContextNotStartedException() { }
        public ExecutionContextNotStartedException(long accountId) : base(string.Format(Resources.ERR_EXECUTIONCONTEXT_NOTSTARTED, accountId)) { }
        public ExecutionContextNotStartedException(long accountId, Exception inner) : base(string.Format(Resources.ERR_EXECUTIONCONTEXT_NOTSTARTED, accountId), inner) { }
        protected ExecutionContextNotStartedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
