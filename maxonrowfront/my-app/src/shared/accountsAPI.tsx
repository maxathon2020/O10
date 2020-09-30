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
  