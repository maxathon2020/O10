﻿using System;
using O10.Web.Server.Properties;

namespace O10.Web.Server.Exceptions
{

    [Serializable]
    public class InherenceCrossMatchingFailedException : Exception
    {
        public InherenceCrossMatchingFailedException() { }
        public InherenceCrossMatchingFailedException(string registrationKey) : base(string.Format(Resources.ERR_INHERENCE_MATCHING_FAILED, registrationKey)) { }
        public InherenceCrossMatchingFailedException(string registrationKey, Exception inner) : base(string.Format(Resources.ERR_INHERENCE_MATCHING_FAILED, registrationKey), inner) { }
        protected InherenceCrossMatchingFailedException(
          System.Runtime.Serialization.SerializationInfo info,
          System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
    }
}
