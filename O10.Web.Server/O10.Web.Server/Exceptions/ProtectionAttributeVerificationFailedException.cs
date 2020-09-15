﻿using System;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class ProtectionAttributeVerificationFailedException : Exception
    {
        public ProtectionAttributeVerificationFailedException() : base(Resources.ERR_PROTECTION_ATTR_VERIFICATION_FAILED) { }
        public ProtectionAttributeVerificationFailedException(Exception inner) : base(Resources.ERR_PROTECTION_ATTR_VERIFICATION_FAILED, inner) { }
        protected ProtectionAttributeVerificationFailedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
