namespace O10.Web.Server.Dtos.User
{
    public class AccountOverrideDto
    {
        public string Password { get; set; }
        public string SecretSpendKey { get; set; }
        public string SecretViewKey { get; set; }
        public ulong LastCombinedBlockHeight { get; set; }
    }
}
