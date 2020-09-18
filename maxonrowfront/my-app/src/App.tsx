import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import NFT from './pages/NFT';
import KYC from './pages/KYC';
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
  private _kyc_provider: string = "mxw126l5vx5s478khryv5l597lhdsfvnq9tmvmzfsl";
  private _kyc_issuer: string = "mxw1ktyq5damgnfqkj6qy2l8fqc54drnznlujckdnf";
  private _kyc_middleware: string = "mxw1y0j6xqc8dsafx2tfv4m8765mw7wrvlespzfyfq";

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
    // this.setState({data}, ()=>{ 
    //   console.log("after assigning wallets and data is: ", data);
    // });
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
            <div
              className="addresses"
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
                          padding: '5px'
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
            <Switch>
              <Route path="/nft">
                <NFT Wallets={this.state.data.Wallets}/>
              </Route>
              <Route path="/kyc">
                <KYC Wallets={this.state.data.Wallets}/>
              </Route>
              <Route path="/">
                <NFT Wallets={this.state.data.Wallets}/>
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }  
}

export default App;
