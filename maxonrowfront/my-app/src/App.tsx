import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import NFT from './pages/NFT';
import KYC from './pages/KYC';
import User3 from './pages/User3';
import Service from './pages/Service';
import Identity2 from './pages/identity2';
import SignalRClass from './shared/signalR';
import AccountsAPI from './shared/accountsAPI';
import SchemeResolutionAPI, { NewAttributeDefinition } from './shared/schemeResolutionAPI';
import ServiceProvidersAPI, { ValidationDefinitionsRequest } from './shared/serviceProvidersAPI';
import { DemoAccount, demoConfig, DemoIdpAccount, DemoSpAccount } from "./shared/demoConfig";

// import {ProviderOrSignerRequest} from './shared/initialize';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {mxw, nonFungibleToken as token, Wallet} from 'mxw-sdk-js/dist/index';
import {addressBook} from "./shared/addressBook";
import ProviderOrSignerRequest from './shared/initialize';
import { Provider } from 'mxw-sdk-js/dist/providers';
import './css/main.css';
import Axios from 'axios';
import { DemoIdPAccountState, DemoSpAccountState, DemoState } from './shared/demoAccountState';
import { debug } from 'console';
import { Subject } from '@microsoft/signalr';


class DataClass{
  public baseApiUri = "http://localhost:5003";
  public addressBook = addressBook;
  private _wallet: string = "mxw127sn3dxpr6880tjlwfk7u007cway5my4lpjl4z";
  private _issuer: string = "mxw1k9sxz0h3yeh0uzmxet2rmsj7xe5zg54eq7vhla";
  private _provider: string = "mxw1f8r0k5p7s85kv7jatwvmpartyy2j0s20y0p0yk";
  private _middleware: string = "mxw1md4u2zxz2ne5vsf9t4uun7q2k0nc3ly5g22dne";

  private _demoState: DemoState = new DemoState()
  public get demoState(): DemoState {
    return this._demoState;
  }
  public set demoState(value: DemoState) {
    this._demoState = value;
  }

  // //kyc-prov-1
  // private _kyc_provider: string = "mxw126l5vx5s478khryv5l597lhdsfvnq9tmvmzfsl";
  // //kyc-issuer-1
  // private _kyc_issuer: string = "mxw1ktyq5damgnfqkj6qy2l8fqc54drnznlujckdnf";
  // //kyc-auth-1
  // private _kyc_middleware: string = "mxw1y0j6xqc8dsafx2tfv4m8765mw7wrvlespzfyfq";

  //the above three kyc issuer/provider/auth addresses are used in the example here: https://github.com/maxonrow/maxathon/blob/master/ft-sample/src/node/node.ts and here https://github.com/maxonrow/maxathon/blob/master/kyc-sample/src/node/node.ts to whitelist an application. Instead it resolves to the following error:
  
  // there was an error on whitelistReceipt:  Error: signature verification failed (operation="sendTransaction", info={"code":4,"codespace":"sdk","message":"Not authorized to whitelist.","log":"{\"codespace\":\"sdk\",\"code\":4,\"message\":\"Not authorized to whitelist.\"}"}, response={"code":4,"data":"","log":"{\"codespace\":\"sdk\",\"code\":4,\"message\":\"Not authorized to whitelist.\"}","hash":"77CEC8DFE8CFFAD5B82F05F2B8EC429059E91FF9FCC88AB314E7A75E55BC4C21"}, params={}, version=1.0.2)
  //   at Object.createError (errors.ts:157)
  //   at checkResponseLog (json-rpc-provider.ts:511)
  //   at JsonRpcProvider.checkResponseLog (json-rpc-provider.ts:417)
  //   at json-rpc-provider.ts:129
  //   at async http:/localhost:3000/static/js/main.chunk.js:1240
  //   at async KYC.walletGenesis (KYC.tsx:171)

  //kyc-prov-2
  //kyc-issuer-2
  //kyc-auth-2 
  //has same issue

  //nft-kyc-prov-1
  //nft-kyc-issuer-1
  //nft-kyc-auth-1
  //has same issue


  //nft-kyc-prov-2
  //nft-kyc-issuer-2
  //nft-kyc-auth-2
  //has same issue

  //what are the whitelistable addresses and what qualifies an address to be able to 
  //whitelist?

  // nft-kyc-prov-2
  private _kyc_provider: string = "mxw1qht067z8s5e6fq5kx3k544kl554l6zkyz56l6l";
  // nft-kyc-issuer-2
  private _kyc_issuer: string = "mxw16s6z7ydpen30u9lpvxx0362wgeww2y9a9rz9mp";
  // nft-kyc-auth-2
  private _kyc_middleware: string = "mxw1yzvfp8ku2p378qh7hhejt73c99txvd5jfx4e5l";

  private _walletM: string;
  private _issuerM: string;
  private _providerM: string;
  private _middlewareM: string;
  private _kyc_providerM: string;
  private _kyc_issuerM: string;
  private _kyc_middlewareM: string;

  private _Wallets: ProviderOrSignerRequest;

  public get Wallets(): ProviderOrSignerRequest {
    return this._Wallets;
  }
  public set Wallets(value: ProviderOrSignerRequest) {
      this._Wallets = value;
  }

  public get wallet(): string {
    return this._wallet;
  }
  public set wallet(value: string) {
      this._wallet = value;
  }
  public get issuer(): string {
    return this._issuer;
  }
  public set issuer(value: string) {
      this._issuer = value;
  }
  public get provider(): string {
      return this._provider;
  }
  public set provider(value: string) {
      this._provider = value;
  }
  public set middleware(value: string) {
      this._middleware = value;
  }
  public get middleware(): string {
      return this._middleware;
  }
  public set kyc_provider(value: string) {
    this._kyc_provider = value;
  }
  public get kyc_provider(): string {
      return this._kyc_provider;
  }
  public set kyc_issuer(value: string) {
    this._kyc_issuer = value;
  }
  public get kyc_issuer(): string {
    return this._kyc_issuer;
  }
  public set kyc_middleware(value: string) {
    this._kyc_middleware = value;
  }
  public get kyc_middleware(): string {
    return this._kyc_middleware;
  }
  public get walletM(): string {
    return this._walletM;
  }
  public set walletM(value: string) {
      this._walletM = value;
  }
  public get issuerM(): string {
    return this._issuerM;
  }
  public set issuerM(value: string) {
      this._issuerM = value;
  }
  public get providerM(): string {
      return this._providerM;
  }
  public set providerM(value: string) {
      this._providerM = value;
  }
  public set middlewareM(value: string) {
      this._middlewareM = value;
  }
  public get middlewareM(): string {
      return this._middlewareM;
  }
  public set kyc_providerM(value: string) {
    this._kyc_providerM = value;
  }
  public get kyc_providerM(): string {
      return this._kyc_providerM;
  }
  public set kyc_issuerM(value: string) {
    this._kyc_issuerM = value;
  }
  public get kyc_issuerM(): string {
    return this._kyc_issuerM;
  }
  public set kyc_middlewareM(value: string) {
    this._kyc_middlewareM = value;
  }
  public get kyc_middlewareM(): string {
    return this._kyc_middlewareM;
  }

}

interface MyProps {};
interface MyState {
    data: DataClass
}


class App extends Component<MyProps, MyState>{
  accountsApi: AccountsAPI;
  schemeResolutionAPI: SchemeResolutionAPI;
  serviceProvidersAPI: ServiceProvidersAPI;

  constructor(props: MyProps){
    super(props);
    this.state = {
        data: new DataClass()
    }
    this.accountsApi = new AccountsAPI(this.state.data.baseApiUri);
    console.log("value of this.accountsApi: ", this.accountsApi);
    this.schemeResolutionAPI = new SchemeResolutionAPI(this.state.data.baseApiUri);
    this.serviceProvidersAPI = new ServiceProvidersAPI(this.state.data.baseApiUri);
  }

  componentDidMount(){
    let data = this.state.data;
    this.setState({data});
    this.initializeHandler();
    this.initializeAccounts();
  }

  async initializeAccounts() {
    console.info("Starting demo IdP accounts initialization");
    await this.accountsApi.get(1).then(r => {
      r.forEach(a => {        
        var demoIdpAccount = demoConfig.idpAccounts.find(v => v.accountName == a.accountInfo);
        if(demoIdpAccount) {  
          demoIdpAccount.account = a;
        }
      });
    })

    for (const d of demoConfig.idpAccounts) {
      await this.initializeDemoAccount(d);
      let data = this.state.data;

      const demoIdpAccountState = new DemoIdPAccountState();
      demoIdpAccountState.demoAccount = d;
      demoIdpAccountState.initializeSignalR();

      data.demoState.idpAccountStates.push(demoIdpAccountState);
      await this.setState({data});
      console.info("Initializing scheme for the Demo Account " + d.accountName);
      let scheme = await this.initializeScheme(d);
      console.log(scheme);
    }

    console.info("Starting demo SP accounts initialization");

    await this.accountsApi.get(2).then(r => {
      r.forEach(a => {        
        var demoSpAccount = demoConfig.spAccounts.find(v => v.accountName == a.accountInfo);
        if(demoSpAccount) {
          demoSpAccount.account = a;
        }
      });
    });

    for (const d of demoConfig.spAccounts) {
      await this.initializeDemoAccount(d);

      const demoSpAccountState = new DemoSpAccountState();
      demoSpAccountState.demoAccount = d;
      demoSpAccountState.initializeSignalR();

      this.state.data.demoState.spAccountStates.push(demoSpAccountState);

      await this.initializeAttributeValidation(d);
    }
}

  private async initializeDemoAccount(d: DemoAccount) {
    console.info("Initializing demo account " + d.accountName);

    if (!d.account) {
      console.info("Need to register O10 account " + d.accountName + "and whitelist MXW wallet");
      await this.accountsApi.register(d.accountType, d.accountName, "qqq").then(
        a => {
          d.account = a.data;
          console.info("Whitelisting MXW wallet of the demo account " + d.accountName);
          // this.whitelistWallet(null).then(
          //   w => {
          //     console.info("Storing mnemonic of the demo account " + d.accountName);
          //     this.accountsApi.storeMnemonic(d.account.accountId, w.mnemonic).then(kvs => console.log(kvs), e => console.log("Failed to store mnemonic: " + e));

          //     d.wallet = w;
          //   },
          //   e => {
          //     console.error("Failed to whitelist MSX wallet of the demo account " + d.accountName, e);
          //   }
          // );
        },
        e => { console.log("Failed to register account. " + e); }
      );
    } 
    
    console.info("Checking for whitelisted MXW wallet of " + d.accountName);
    let mne = await this.accountsApi.getMnemonic(d.account.accountId);

    let isMne: boolean = !!mne;

    if (isMne) {
      console.info(d.accountName + " has stored mnemonic");
      let wallet = this.getWallet(mne);
      if (await wallet.isWhitelisted()) {
        console.info("MXW wallet of " + d.accountName + " is already whitelisted");
        d.wallet = wallet;
      } else {
        console.info("MXW wallet of " + d.accountName + " exist but not whitelisted");
        await this.whitelistWallet(wallet).then(w => {
          d.wallet = w;
          console.info("Storing mnemonic of the demo account " + d.accountName);
          this.accountsApi.storeMnemonic(d.account.accountId, d.wallet.mnemonic).then(kvs => console.log(kvs), e => console.log("Failed to store mnemonic: " + e));
        },
        e => {
          console.error("Failed to whitelist MSX wallet of the demo account " + d.accountName, e);
        })
      }
    } else {
      console.info("No stored mnemonic found for " + d.accountName + ". Creating new MXW wallet.");
      d.wallet = await this.whitelistWallet(null);

      console.info("MXW wallet for the demo account " + d.accountName + " crated and whitelisted. Storing its mnemonic");
      this.accountsApi.storeMnemonic(d.account.accountId, d.wallet.mnemonic).then(
        kvs => {
          console.log("KeyValues are: " + kvs);
        },
        e => console.log("Failed to store mnemonic: " + e));
    }
    

    console.info("Authenticating demo account " + d.accountName);
    await this.accountsApi.authenticate(d.account.accountId, "qqq");
    console.info("Demo account " + d.accountName + " authenticated");
  }

  getWallet(mne: string) {
    return this.state.data.Wallets.getWallet(mne);
  }

  async whitelistWallet(wallet: mxw.Wallet) {
    if(wallet) {
      return this.state.data.Wallets.whitelistExistingWallet(demoConfig.mwxWalletMnes.providerMne, demoConfig.mwxWalletMnes.issuerMne, demoConfig.mwxWalletMnes.middlewareMne, wallet);
    } else {
      return this.state.data.Wallets.whitelistNewWallet(demoConfig.mwxWalletMnes.providerMne, demoConfig.mwxWalletMnes.issuerMne, demoConfig.mwxWalletMnes.middlewareMne);
    }
  }

  async initializeScheme(account: DemoIdpAccount) {
    var attributeDefinitions: NewAttributeDefinition[] = new Array();

    account.identityScheme.forEach(s => 
      {
        attributeDefinitions.push({
          attributeName: s.attributeName,
          schemeName: s.schemeName,
          alias: s.alias,
          isRoot: s.isRoot,
          description: ""
        });
      });
    
    return await this.schemeResolutionAPI.PutAttributeDefinitions(account.account.publicSpendKey, attributeDefinitions);
  }

  async initializeAttributeValidation(account: DemoSpAccount) {
    if(account.validations.length == 0) {
      console.info("No validations for the Demo Account " + account.accountName);
      return; 
    }

    console.info("Setting validations for the Demo Account " + account.accountName);

    var attributeValidations: ValidationDefinitionsRequest = {
      identityAttributeValidationDefinitions: new Array()
    }

    account.validations.forEach(v => {
      attributeValidations.identityAttributeValidationDefinitions.push({
        schemeName: v.schemeName,
        validationType: v.validationType.toString(),
        criterionValue: null
      });
    });

    await this.serviceProvidersAPI.PutAttributeDefinitions(account.account.accountId, attributeValidations).then(
      r => {
        console.info("Validation set successfully");
      },
      e => {
        console.error("Failed to set validations for the Demo Account " + account.accountName, e);
      }
    );
  }

  // Request for attributes issuance
  // Method name: 
  // RequestForIssuance
  // Argument
  // {
  //   “rootAttribute”: {
  //     “attributeName”: string,
  //     “originatingCommitment”: 64-chars hex-string,
  //     “assetCommitment”: 64-chars hex-string,
  //     “surjectionProof”: 192-chars hex-string
  //   },
  //   “associatedAttributes”: [
  //     {
  //       “attributeName”: string,
  //       “assetCommitment”: 64-chars hex-string,
  //       “bindingToRootCommitment”: 64-chars hex-string
  //     }
  //   ]
  // }
  // 5f3ae2b02affea74c2ee6e6d53a2d6ded319c9905dea7f0b4bb9273819c76b65
  // 4e2c16a6499dafab98da9e5a2c3d7ff418aead18fec0e074e61f1cdfa2c84a9c
  // 204b9505556c687e3d8a491d1850054ac848896303fafaf18af2d3e933f97d88
  // b4bbe17841ria25c144209eda794599eb632491842d5afb7f0eabcd9cd0bcecc8


  initializeHandler = () => {
    let data = this.state.data;

    console.log('data.addressBook: ', data.addressBook);
    data.addressBook.forEach(element => {
      if(element.Address==data.wallet){
        data.walletM = element.Mnemonic;
      }
      if(element.Address==data.issuer){
        data.issuerM = element.Mnemonic;
      }
      if(element.Address==data.provider){
        data.providerM = element.Mnemonic;
      }
      if(element.Address==data.middleware){
        data.middlewareM = element.Mnemonic;
      }
      if(element.Address==data.kyc_issuer){
        data.kyc_issuerM = element.Mnemonic;
      }
      if(element.Address==data.kyc_middleware){
        data.kyc_middlewareM = element.Mnemonic;
      }
      if(element.Address==data.kyc_provider){
        data.kyc_providerM = element.Mnemonic;
      }
    });

    console.log("value of data after address assignment, ", data);

    let Wallets = new ProviderOrSignerRequest(data.walletM, data.providerM, data.issuerM, data.middlewareM, data.kyc_providerM, data.kyc_issuerM, data.middlewareM);

    data.Wallets = Wallets;

    this.setState({data});
  }

  addressesNFTKYC = () => {
    return(
      <div
        className="leftpanel"
      >
        <div
          style={{
            padding: '20px', 
            color: 'white', 
            height: '100%'
          }}
        >
          <div
            style={{
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%'
            }}
          >
            <div
              style={{
                flex: 1
              }}
            >
              <h2>
                Initialize Connection for KYC/NFT
              </h2>
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              <h3>
                NFT Wallets
              </h3> 
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              NFT Wallet Receiever
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              <input 
                placeholder={this.state.data.wallet}
                value={this.state.data.wallet} onChange={(e)=>{
                let data = this.state.data;
                data.wallet = e.target.value;
              }}/>
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              NFT Wallet Issuer
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input
                placeholder={this.state.data.issuer}
                value={this.state.data.issuer} onChange={(e)=>{
                let data = this.state.data;
                data.issuer = e.target.value;
              }}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              NFT Wallet Provider
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input             
                placeholder={this.state.data.provider}
                value={this.state.data.provider} onChange={(e)=>{
                let data = this.state.data;
                data.provider = e.target.value;
              }}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              NFT Wallet Middleware
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input 
                placeholder={this.state.data.middleware}
                value={this.state.data.middleware} onChange={(e)=>{
                let data = this.state.data;
                data.middleware = e.target.value;
              }}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <hr style={{width: '80%'}}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <h3>
                KYC Wallets
              </h3>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
                KYC Wallet Issuer  
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input 
                placeholder={this.state.data.kyc_issuer}
                value={this.state.data.kyc_issuer} onChange={(e)=>{
                let data = this.state.data;
                data.kyc_issuer = e.target.value;
              }}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              KYC Wallet Middleware
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input 
                placeholder={this.state.data.kyc_middleware}
                value={this.state.data.kyc_middleware} onChange={(e)=>{
                let data = this.state.data;
                data.kyc_middleware = e.target.value;
              }}/>
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              KYC Wallet Provider
            </div>
            <div 
              style={{
                flex: 1
              }}
            >
              <input 
                placeholder={this.state.data.kyc_provider}
                value={this.state.data.kyc_provider} onChange={(e)=>{
                let data = this.state.data;
                data.kyc_provider = e.target.value;
              }}/>
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              <div
                onClick={()=>{
                    this.initializeHandler();
                }}
                style={{
                    display: 'inline-block',
                    background: "white", 
                    color: "black", 
                    width: "20rem", 
                    textAlign: 'center', 
                    padding: '5px', 
                    cursor: 'pointer'
                }}
              >
                  Initialize
              </div>
            </div>
            <div
              style={{
                flex: 5
              }}
            >
            </div>
          </div>      
        </div>
      </div>
    );
  }
  
  render(){
    return (
      <div
        style={{
          overflowX: 'hidden'
        }}
      >
        <Router>
          <div className="wrapper">
            <div className="header">
              <nav>
                <ul
                  style={{
                    listStyle: "none", 
                    display: "inline-block"
                  }}
                >
                  <li
                    style={{
                      display: 'inline', 
                      marginRight: '20px',
                      background: "black", 
                      color: "white", 
                      padding: '5px'
                    }}
                  >
                    <Link to="/nft"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      NFT
                    </Link>
                  </li>
                  <li 
                    style={{
                      display: 'inline', 
                      background: "black", 
                      color: "white", 
                      marginRight: '20px',
                      padding: '5px'
                    }}
                  >
                    <Link to="/kyc"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      KYC
                    </Link>
                  </li> 
                  <li 
                    style={{
                      display: 'inline', 
                      background: "black", 
                      color: "white", 
                      marginRight: '20px',
                      padding: '5px'
                    }}
                  >
                    <Link to="/user"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      User
                    </Link>
                  </li>
                  <li 
                    style={{
                      display: 'inline', 
                      background: "black", 
                      color: "white", 
                      padding: '5px', 
                      marginRight: '20px'
                    }} 
                  >
                    <Link to="/service"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      Service Provider
                    </Link>
                  </li>
                  <li 
                    style={{
                      display: 'inline', 
                      background: "black", 
                      color: "white", 
                      padding: '5px', 
                      marginRight: '20px'
                    }}
                  >
                    <Link to="/identity"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      Identity Provider
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div
              className="leftsidebar"
            >
            </div>
            <div
              className="rightsidebar"
            >
            </div>
            <div
              className="footer"
            >
            </div>
            <Switch>
              <Route path="/nft">
                {this.addressesNFTKYC()}
                <NFT 
                  Wallets={this.state.data.Wallets} 
                  fromIdentity={false}
                  identityPayload={[]}
                  identityCallback={()=>{}}
                />
              </Route>
              <Route path="/kyc">
                {this.addressesNFTKYC()}
                <KYC Wallets={this.state.data.Wallets}/>
              </Route>
              <Route path="/user">
                <User3
                  addToGroup={(accountId: string)=>{
                  }}
                  requestForIssuance={(accountId:string, packageObj:{[key: string]:any}[])=>{
                  }}
                />
                </Route>
              <Route path="/service">
                <Service 
                Wallets={this.state.data.Wallets}
                />
              </Route>
              <Route path="/identity">
                <Identity2
                  Wallets={this.state.data.Wallets}
                  DemoState={this.state.data.demoState}
                />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }  

}

export default App;
