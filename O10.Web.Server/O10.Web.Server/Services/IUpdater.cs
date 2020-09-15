using System.Threading.Tasks.Dataflow;
using O10.Client.Common.Communication.SynchronizerNotifications;
using O10.Core.Models;

namespace O10.Web.Server.Services
{
    public interface IUpdater
    {
        ITargetBlock<PacketBase> PipeIn { get; set; }
        ITargetBlock<SynchronizerNotificationBase> PipInNotifications { get; }
    }
}
