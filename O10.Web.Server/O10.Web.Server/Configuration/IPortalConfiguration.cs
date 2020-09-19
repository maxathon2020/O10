using O10.Core.Configuration;

namespace O10.Web.Server.Configuration
{
    public interface IPortalConfiguration : IConfigurationSection
    {
        string FacePersonGroupId { get; set; }
        bool DemoMode { get; set; }
    }
}
