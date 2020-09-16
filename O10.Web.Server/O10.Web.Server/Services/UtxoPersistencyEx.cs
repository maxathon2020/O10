using O10.Client.Web.Common.Services;
using System.Threading.Tasks;

namespace O10.Web.Server.Services
{
    public class UtxoPersistencyEx : UtxoPersistency
    {
        public TaskCompletionSource<byte[]> BindingKeySource { get; set; }
    }
}
