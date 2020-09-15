namespace O10.Web.Server.Dtos.User
{
    public class GroupRelationDto
    {
        public long GroupRelationId { get; set; }

        public string GroupOwnerName { get; set; }
        public string GroupOwnerKey { get; set; }
        public string GroupName { get; set; }
        public string Issuer { get; set; }
        public string AssetId { get; set; }
    }
}
