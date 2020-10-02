import { inherits } from "util";
import { DemoAccount, DemoIdpAccount } from "./demoConfig";
import SignalRClass from "./signalR";

export class DemoAccountState {
    private _demoAccount: DemoAccount;
    public get demoAccount(): DemoAccount {
        return this._demoAccount;
    }
    public set demoAccount(value: DemoAccount) {
        this._demoAccount = value;
    }

    private _signalR: SignalRClass;
    public get signalR(): SignalRClass {
        return this._signalR;
    }
    public set signalR(value: SignalRClass) {
        this._signalR = value;
    }

    protected async initializeSignalRHub() {
        this._signalR = new SignalRClass(); 
        return await this._signalR.initializeHub(this._demoAccount.account.accountId);
    }
}

export class DemoIdPAccountState extends DemoAccountState {

    private _idenitityIssuances: IdentityIssuance[] = new Array();
    public get idenitityIssuances(): IdentityIssuance[] {
        return this._idenitityIssuances;
    }
    public set idenitityIssuances(value: IdentityIssuance[]) {
        this._idenitityIssuances = value;
    }

    initializeSignalR() {
        this.initializeSignalRHub().then(
            h => {
                h.on("RequestForIssuance", (i) => {
                    console.info("RequestForIssuance");
                    console.info(i);

                    var identityIssuance  = i as IdentityIssuance;
                    this._idenitityIssuances.push(identityIssuance);
                });
            }, 
            e => console.error("Failed to initialize SignalR hub", e));
    }
}

export interface AttributeIssuance {
    assetCommitment: string;
    attributeName: string;
}

export interface RootAttributeIssuance extends AttributeIssuance {
    originatingCommitment: string;
    surjectionProof: string;
}

export interface AssociatedAttributeIssuance extends AttributeIssuance {
    bindingToRootCommitment: string;
}

export interface IdentityIssuance {
    rootAttribute: RootAttributeIssuance;
    associatedAttributes: AssociatedAttributeIssuance[];
}

export class DemoState {
    private _idpAccountStates: DemoIdPAccountState[] = new Array();
    public get idpAccountStates(): DemoIdPAccountState[] {
        return this._idpAccountStates;
    }
    public set idpAccountStates(value: DemoIdPAccountState[]) {
        this._idpAccountStates = value;
    }
}