namespace O10.Web.Server.Dtos
{
    public class UnauthorizedUseDto
    {
        public string KeyImage { get; set; }

        public string TransactionKey { get; set; }
        public string DestinationKey { get; set; }

        public string Target { get; set; }
    }
}
