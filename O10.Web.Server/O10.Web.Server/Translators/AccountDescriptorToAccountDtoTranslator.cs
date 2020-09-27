using O10.Client.Common.Entities;
using O10.Core.Architecture;
using O10.Core.Architecture.Enums;
using O10.Core.ExtensionMethods;
using O10.Core.Translators;
using O10.Web.Server.Dtos;

namespace O10.Web.Server.Translators
{
    [RegisterExtension(typeof(ITranslator), Lifetime = LifetimeManagement.Singleton)]
    public class AccountDescriptorToAccountDtoTranslator : TranslatorBase<AccountDescriptor, AccountDto>
    {
        public override AccountDto Translate(AccountDescriptor account)
        {
            if(account == null)
            {
                return null;
            }

            return new AccountDto
            {
                AccountId = account.AccountId,
                AccountType = (byte)account.AccountType,
                AccountInfo = account.AccountInfo,
                PublicSpendKey = account.PublicSpendKey?.ToHexString(),
                PublicViewKey = account.PublicViewKey?.ToHexString()
            };
        }
    }
}
