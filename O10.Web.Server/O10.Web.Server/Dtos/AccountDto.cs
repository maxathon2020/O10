namespace O10.Web.Server.Dtos
{
    public class AccountDto
    {
        public long AccountId { get; set; }
        public byte AccountType { get; set; }
        public string AccountInfo { get; set; }
        public string Password { get; set; }
        public string PublicViewKey { get; set; }
        public string PublicSpendKey { get; set; }
    }
}
