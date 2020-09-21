import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import NFT from './pages/NFT';
import KYC from './pages/KYC';
import User1 from './pages/User1';
import User2 from './pages/User2';
import Service from './pages/Service';
import Identity from './pages/Identity';

// import {ProviderOrSignerRequest} from './shared/initialize';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {mxw, nonFungibleToken as token} from 'mxw-sdk-js/dist/index';
import {addressBook} from "./shared/addressBook";
import ProviderOrSignerRequest from './shared/initialize';
import { Provider } from 'mxw-sdk-js/dist/providers';
import './css/main.css';


class DataClass{
  public addressBook = addressBook;
  private _wallet: string = "mxw127sn3dxpr6880tjlwfk7u007cway5my4lpjl4z";
  private _issuer: string = "mxw1k9sxz0h3yeh0uzmxet2rmsj7xe5zg54eq7vhla";
  private _provider: string = "mxw1f8r0k5p7s85kv7jatwvmpartyy2j0s20y0p0yk";
  private _middleware: string = "mxw1md4u2zxz2ne5vsf9t4uun7q2k0nc3ly5g22dne";


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
  
  constructor(props: MyProps){
    super(props);
    this.state = {
        data: new DataClass()
    }
  }

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
                    <Link to="/user1"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      User1
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
                    <Link to="/user2"
                      style={{
                        textDecoration: 'none',
                        color: 'white'
                      }}
                    >
                      User2
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
                <NFT Wallets={this.state.data.Wallets}/>
              </Route>
              <Route path="/kyc">
                {this.addressesNFTKYC()}
                <KYC Wallets={this.state.data.Wallets}/>
              </Route>
              <Route path="/user1">
                <User1/>
              </Route>
              <Route path="/user2">
                <User2/>
              </Route>
              <Route path="/service">
                <Service/>
              </Route>
              <Route path="/identity">
                <Identity/>
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }  
}

export default App;
