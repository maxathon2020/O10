namespace O10.Web.Server.Dtos.User
{
    public class RelationsProofsDto : UserAttributeTransferDto
    {
        public bool WithBiometricProof { get; set; }
        public bool WithKnowledgeProof { get; set; }
        public GroupRelationDto[] Relations { get; set; }
    }
}
