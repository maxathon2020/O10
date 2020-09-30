namespace O10.Web.Server.Dtos.User
{
    public class UniversalProofsSendingRequest
    {
        public long RootAttributeId { get; set; }
        public string Target { get; set; }
        public string SessionKey { get; set; }
        public string ServiceProviderInfo { get; set; }
    }
}
