import Axios from 'axios';

export default class AccountsAPI{
    constructor(private baseUri: string){}

    async getAll() {
        var accounts: AccountDTO[] = null; 
        await Axios.get<AccountDTO[]>(this.baseUri + "/api/accounts")
        .then(
            r => {
                accounts = r.data;
            },
            e => {
                console.error("Failed to obtain all accounts");
                console.error(e);
            }
        );

        return accounts;
    }

    async get(accountType: number) {
        var accounts: AccountDTO[] = null; 
        await Axios.get<AccountDTO[]>(this.baseUri + "/api/accounts?ofTypeOnly=" + accountType)
        .then(
            r => {
                accounts = r.data;
            },
            e => {
                console.error("Failed to obtain all accounts");
                console.error(e);
            }
        );

        return accounts;
    }

    register(accountType: number, accountInfo: string, password: string) {
        return Axios.post<AccountDTO>(this.baseUri + "/api/accounts/register", {accountType, accountInfo, password});
    }

    authenticate(accountId: number, password: string) {
        return Axios.post<AccountDTO>(this.baseUri + "/api/accounts/authenticate", {accountId, password});
    }

    storeMnemonic(accountId: number, mne: string) {
        return Axios.post<Map<string, string>>(this.baseUri + "/api/accounts/KeyValues?accountId=" + accountId, { mxwMnemonic: mne });
    }

    async getMnemonic(accountId: number) {
        var mne: string = null;
        await Axios.get<any>(this.baseUri + "/api/accounts/KeyValues?accountId=" + accountId).then(
            kvs => {
                mne = Reflect.get(kvs.data, "mxwMnemonic");
            },
            e => {
                console.error("Failed to obtain mnemonic for account with id " + accountId + ": " + e);
            }
        )

        return mne;
    }
}

export enum AccountType {
    IdentityProvider = 1,
    ServiceProvider,
    User
}

export interface AccountDTO{
    accountId: number, 
    accountType: number, 
    accountInfo: string, 
    password: string, 
    publicViewKey: string, 
    publicSpendKey: string
  }
  