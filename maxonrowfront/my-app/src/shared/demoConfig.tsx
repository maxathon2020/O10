import { mxw } from "mxw-sdk-js";
import { AccountDTO } from "./accountsAPI";

export class DemoAccount {
    accountType: number;
    accountName: string;
    account: AccountDTO;
    wallet: mxw.Wallet;
}

export class DemoIdpAccount extends DemoAccount {
    identityScheme: AttributeDefinition[];
}

export class DemoSpAccount extends DemoAccount {
    validations: RequiredValidation[];
}

export class AttributeDefinition {
    attributeName: string;
    schemeName: string;
    alias: string;
    isRoot: boolean;
} 

export class RequiredValidation {
    schemeName: string;
    validationType: number; // 1 - match value, 2 - check for age, 3 - check for inclusion into group
}

export class DemoConfig {
    idpAccounts: DemoIdpAccount[];
    spAccounts: DemoSpAccount[];
    mwxWalletMnes: MwxWalletMnes;
}

export class MwxWalletMnes {
    issuerMne: string;
    providerMne: string;
    middlewareMne: string;
}

export const demoConfig: DemoConfig = {
    idpAccounts: [
        {
            accountName: "Ministry of Interior",
            accountType: 1,
            identityScheme: [
                {
                    isRoot: true,
                    attributeName: "IDCard",
                    alias: "ID Card",
                    schemeName: "IdCard"
                },
                {
                    isRoot: false,
                    attributeName: "FirstName",
                    alias: "First Name",
                    schemeName: "FirstName"
                },
                {
                    isRoot: false,
                    attributeName: "LastName",
                    alias: "Last Name",
                    schemeName: "LastName"
                }
            ],
            account: null,
            wallet: null
        }
    ],
    spAccounts: [
        {
            accountName: "Municipality",
            accountType: 2,
            account: null,
            validations: [],
            wallet: null
        }
    ],
    mwxWalletMnes: {
        providerMne: "foot increase such wave plunge athlete gentle figure hub reunion transfer marriage rude license champion monkey fan balcony position birth onion circle hint cool",
        middlewareMne: "belt world purchase stick spare one music suggest dentist kit globe save snack sauce liquid face undo select ethics choose august rhythm cycle crucial",
        issuerMne: "brisk barrel dose panther slice album family math cup cute awesome mechanic pattern rack erupt enforce alcohol wolf boil autumn family avoid brother legal"
    }
}