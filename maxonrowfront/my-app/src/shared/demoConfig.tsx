import { AccountDTO } from "./accountsAPI";

export class DemoAccount {
    accountType: number;
    accountName: string;
    account: AccountDTO 
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
            account: null
        }
    ],
    spAccounts: [
        {
            accountName: "Municipality",
            accountType: 2,
            account: null,
            validations: []
        }
    ]
}