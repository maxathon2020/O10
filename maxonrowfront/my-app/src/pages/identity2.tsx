import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { TransactionReceipt } from 'mxw-sdk-js/dist/providers/abstract-provider';
import { timeStamp } from 'console';
import { queryAllByAttribute } from '@testing-library/react';
import NFT from './NFT';
import ProviderOrSignerRequest from '../shared/initialize';
import { mxw ,nonFungibleToken as token} from 'mxw-sdk-js/dist/index';
import TokenCreator from '../nft/createnft';
import Approver from '../nft/approver';
import Util from "../nft/util";
import Minter from '../nft/minter';
import * as crypto from "crypto";
import { DemoIdPAccountState, DemoState } from '../shared/demoAccountState';

async function asyncForEach(array:any, callback:any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class DataClass{

  private _afterToken: string = "";
  private _afterApproval: string = "";
  private _accArray:{[key:string]:any}[] = []

  private _userMintReceipts: {[key:string]:any}[] = [];

  public set userMintReceipts(value:{[key:string]:any}[]){
    this.userMintReceipts = value;
  }
  
  public get userMintReceipts():{[key: string]: any}[]{
    return this._userMintReceipts;
  }

  private _renderMintHandler:boolean;

  public set renderMintHandler(value: boolean){
    this._renderMintHandler=value;
  } 

  public get renderMintHandler():boolean{
    return this._renderMintHandler
  }

  public set accArray(value:{[key:string]:any}[]){
    this._accArray = value;
  }

  public get accArray():{[key:string]:any}[]{
    return this._accArray;
  }

  public set afterToken(value:string){
    this._afterToken = value;
  }

  public get afterToken():string{
    return this._afterToken;
  }

  public set afterApproval(value:string){
    this._afterApproval = value;
  }

  public get afterApproval():string{
    return this._afterApproval;
  }

  private _selectedDemoIdpAccount: DemoIdPAccountState = null;
  public get selectedDemoIdpAccount(): DemoIdPAccountState {
    return this._selectedDemoIdpAccount;
  }
  public set selectedDemoIdpAccount(value: DemoIdPAccountState) {
    this._selectedDemoIdpAccount = value;
  }


  public _accountArray:{[key:string]:any}[] = [];

  public set accountArray(value: {[key: string]: any}[]){
    this._accountArray = value;
  }

  public get accountArray():{[key: string]: any}[]{
    return this._accountArray;
  }

  private _loginRegisterErrorMessage = "";
  private _trxReceipt: TransactionReceipt = null;
  private _symbol: string;
  private _walletDefined: boolean;
  private _middleware: mxw.Wallet;
  public feeCollector = "mxw1md4u2zxz2ne5vsf9t4uun7q2k0nc3ly5g22dne";

  private _nft: token.NonFungibleToken;
  private _issuerNft: token.NonFungibleToken;

  public set middleware(value: mxw.Wallet) {
    this._middleware = value;
  }
  public get middleware(): mxw.Wallet {
      return this._middleware;
  }

  public get nft(): token.NonFungibleToken {
    return this._nft;
  }
  public set nft(value: token.NonFungibleToken) {
      this._nft = value;
  }
  public get issuerNft(): token.NonFungibleToken {
      return this._issuerNft;
  }
  public set issuerNft(value: token.NonFungibleToken) {
      this._issuerNft = value;
  }


  private _wallet: mxw.Wallet;

  public set wallet(value: mxw.Wallet) {
    this._wallet = value;
  }
  public get wallet(): mxw.Wallet {
      return this._wallet;
  }

  private _issuer: mxw.Wallet;

  public set issuer(value: mxw.Wallet) {
    this._issuer = value;
  }
  public get issuer(): mxw.Wallet {
      return this._issuer;
  }

  private _provider: mxw.Wallet;

  public set provider(value: mxw.Wallet) {
    this._provider = value;
  }
  public get provider(): mxw.Wallet {
      return this._provider;
  }

  public set walletDefined(value: boolean) {
    this._walletDefined = value;
  }
  public get walletDefined(): boolean {
      return this._walletDefined;
  }

  public set symbol(value: string){
    this._symbol = value;
  }

  public get symbol(): string{
    return this._symbol;
  }

  private _itemProperties: string;

  public set itemProperties(value: string){
    this._itemProperties = value;
  }

  public get itemProperties(): string{
    return this._itemProperties;
  }

  private _itemMetadata: string;

  public set itemMetadata(value: string){
    this._itemMetadata = value;
  }

  public get itemMetadata(): string{
    return this._itemMetadata;
  }


  public set loginRegisterErrorMessage(value: string){
    this._loginRegisterErrorMessage = value;
  }

  public set trxReceipt(value: TransactionReceipt) {
    this._trxReceipt = value;
  }
  public get trxReceipt(): TransactionReceipt {
      return this._trxReceipt;
  }

  private _identityPayload: {[key: string]: any}[] = [];

  private _fromIdentity: boolean = false;

  private _errorMessageSelect: string = "";

  public get loginRegisterErrorMessage(): string{
    return this._loginRegisterErrorMessage;
  }
  private _username: string = "";
  private _password: string = "";
  private _attributeModalOpen: boolean = false;
  private _optionSelected: {[key: string]:any} = [
    {
      name: 'default', 
      allowMultiple: false
    }
  ];
  private _attributesSelected: {[key: string]:any}[] = []

  private _isRoot: boolean = false;

  public set errorMessageSelect(value: string){
    this._errorMessageSelect = value;
  }

  public get errorMessageSelect(): string{
    return this._errorMessageSelect;
  }

  public set isRoot(value:boolean){
    this._isRoot = value;
  }

  public get isRoot(): boolean{
    return this._isRoot;
  }

  public set optionSelected(value: {[key: string]: any}){
    this._optionSelected = value;
  } 

  public get optionSelected(): {[key: string]: any} {
    return this._optionSelected;
  }

  public set attributesSelected(value: {[key: string]:any}[]){
    this._attributesSelected = value;
  }

  public get attributesSelected(): {[key: string]:any}[] {
    return this._attributesSelected;
  }

  public set identityPayload(value: {[key: string]:any}[]){
    this._identityPayload = value;
  }

  public get identityPayload(): {[key: string]:any}[] {
    return this._identityPayload;
  }

  private _attributes: {[key: string]:any}[] = []

  public set attributes(value: {[key: string]:any}[]){
    this._attributes = value;
  }

  public get attributes(): {[key: string]:any}[] {
    return this._attributes;
  }

  public set username(value: string){
    this._username = value;
  }

  public get attributeModalOpen(): boolean {
    return this._attributeModalOpen;
  }

  public set attributeModalOpen(value: boolean){
    this._attributeModalOpen = value;
  }

  public get username(): string{
    return this._username;
  }

  public set password(value: string){
    this._password = value;
  }

  public get password(): string{
    return this._password;
  }

  private _loggedIn: boolean = false;

  public get loggedIn(): boolean{
    return this._loggedIn;
  }

  public set loggedIn(value:boolean){
    this._loggedIn = value;
  }

  private _publicViewKey: string;

  public set publicViewKey(value: string){
    this._publicViewKey = value;
  }

  public get publicViewKey(): string{
    return this._publicViewKey;
  }

  private _publicSpendKey: string;

  public set publicSpendKey(value: string){
    this._publicSpendKey = value;
  }

  public get publicSpendKey(): string{
    return this._publicSpendKey;
  }

  public set fromIdentity(value: boolean) {
    this._fromIdentity = value;
  }
  public get fromIdentity(): boolean {
      return this._fromIdentity;
  }

}

interface MyProps {
  Wallets: ProviderOrSignerRequest,
  DemoState: DemoState;
};
interface MyState {
  data: DataClass;
};

interface AssociatedMint{
  assetCommitment: string,
  attributeName: string,
  bindingToRootCommitment: string
}

interface RootMint{
  assetCommitment: string
  attributeName: string
  originatingCommitment: string
  surjectionProof: string
}

interface SchemeItems{
  name: string,
	description: string,
	valueType: string,
	allowMultiple: string
}

interface UserAccounts{
  accountId: number, 
  accountType: number, 
  accountInfo: string, 
  password: null, 
  publicViewKey: string, 
  publicSpendKey: string
}

interface SchemeResolution{
  schemeId: number,
  attributeName: string,
  schemeName: string,
  alias: string, 
  description: string, 
  isActive: boolean, 
  isRoot: boolean
}

interface Authenticate{
  accountId: number,
  accountType: number,
  accountInfo: string, 
  publicSpendKey: string
}

// Attribute Scheme Item Name - this is, in fact, the role that this particular attribute will play (i.e. - FirstName, ExpirationDate, IDCardNumber, etc)
// Attribute name - what is the internal identifier for this attribute in the scope of a particular authority
// Alias - how this attribute is called in the scope of a particular authority
// Description
// IsRoot - defines whether this attribute is the root or associated one in the scope of the particular authority. Every authority must have one root attribute regardless of authority issues Root Identity or Associated Identity.

// function typeConverstionFromAny(<>){}

class Identity2 extends Component<MyProps, MyState>{

  constructor(props: MyProps){
    super(props);
    this.state = {
      data: new DataClass()
    }
  }

  componentWillMount(){
    let data = this.state.data;
    // http://localhost:5003/api/SchemeResolution/SchemeItems
    axios.get<SchemeItems[]>("http://localhost:5003/api/SchemeResolution/SchemeItems")
    .then((resolve)=>{
      data.attributes = resolve.data;
      this.setState({data}, ()=>{
        console.log("after setting data is: ", data);
      });
    })
    .catch(error=>{
      console.log("value of error: ", error);
    })
  }

  

  componentDidMount(){

    let data = this.state.data;

    console.log("value of Wallets on ComponentDidMount: ", this.props.Wallets);
    console.log("demoAccountState: ", this.props.DemoState.idpAccountStates);

    console.log("value of identity issuance from demoState: ", this.props.DemoState.idpAccountStates)


    this.props.DemoState.idpAccountStates.forEach((d)=>{
      data.accArray.push({
        name: d.demoAccount.accountName,
        wallet: d.demoAccount.wallet,
        identityIssuance: d.identityIssuances
      })
    })

    this.setState({data})
    // var accArray:{[key:string]:any} = []

    // attribute.attributeName+"@"+data.username,
    // itemId: 

    // this.props.DemoState.idpAccountStates.forEach((acc, key)=>{
    //   accArray[key].accountId = acc.demoAccount.account.accountId;
    //   accArray[key].accountInfo = acc.demoAccount.account.accountInfo;
    //   acc.identityIssuances
    // })
  }

  // http://localhost:5003/api/SchemeResolution/SchemeItems

  // modalSelection = () => {

  // }

  // toggleModalSelection = async() => { 
  //   let data = this.state.data;
  //   data.attributeModalOpen = !data.attributeModalOpen;
  //   await this.setState({data});
  //   if(data.attributeModalOpen){
  //     data.addMultipleErrorMessage = "";
  //     await this.setState({data});
  //   }
  // }

  loginAccount = async() => {
    let data = this.state.data;
    data.loginRegisterErrorMessage = "";
    if(data.username==""||data.password==""){
      data.loginRegisterErrorMessage = "neither username nor password may be blank";
    }else{
      const demoAccount = this.props.DemoState.idpAccountStates.find(a => a.demoAccount.accountName == data.username);
      data.selectedDemoIdpAccount = demoAccount;
      data.publicSpendKey = demoAccount.demoAccount.account.publicSpendKey
      data.loginRegisterErrorMessage = "user successfully logged in";
      data.loggedIn = true;
      // axios.get<UserAccounts[]>("http://localhost:5003/api/accounts?ofTypeOnly=1")
      // .then(resolve=>{
      //   let accountId = "";
      //   resolve.data.forEach(account=>{
      //     if(account.accountInfo==data.username){
      //       accountId = account.accountId.toString();
      //     }
      //   })
      //   axios.post<Authenticate>('http://localhost:5003/api/accounts/authenticate', {
      //     accountId, 
      //     password: data.password
      //   })
      //   .then(resolve=>{
      //     let data = this.state.data;
      //     data.publicSpendKey = resolve.data.publicSpendKey
      //     data.loginRegisterErrorMessage = "user successfully logged in";
      //     data.loggedIn = true;
      //     this.setState({data});
      //     //this.props.addToGroup(accountId);
      //     this.getUserAttributes(accountId);
      //   })
      //   .catch(error=>{
      //     let data = this.state.data;
      //     data.loginRegisterErrorMessage = "username or message is invalid";
      //   })
      //})
      this.setState({data});
    }
  }

  getUserAttributes = (accountId: string) => {
    axios.get("http://localhost:5003/api/User/UserAttribtutes?accountId:"+accountId)
    .then(resolve=>{
      console.log("value of resolve: ", resolve)
    })
    .catch(error=>{
      console.log("value of error: ", error);
    })
  }

  listOfAccounts = () => {
    let data = this.state.data;

    // console.log("value of data.publicViewKey: ", data.publicViewKey);
    // console.log("value of data.publicSpendKey: ", data.publicSpendKey);
    // console.log("value of data.attributesSelected: ", data.attributesSelected);

    // console.log("value of this.props.DemoState.idpAccountStates: ", this.props.DemoState.idpAccountStates);

    return this.props.DemoState.idpAccountStates.map(a => {
      return(
        <div
            className="button"
            style={{
              background: data.selectedDemoIdpAccount==a?"green":"black",
              marginLeft: '20%', 
              marginRight: '20%', 
              width: '60%', 
              marginTop: '20px'
            }}
            onClick={async()=>{
              let data = this.state.data;
              data.afterToken = "";
              data.afterApproval = "";
              await this.setState({data})
              this.selectDemoIdpAccount(a);
            }}
          >
            {a.demoAccount.accountName}
          </div>  
      )
    })
  }

  userNamePassword = () => {
    let data = this.state.data;

    const registerAccountButton=()=>{
      if(this.state.data.loggedIn == false){
        return(        
          <div
            className="button"
            style={{
              marginLeft: '20%', 
              marginRight: '20%', 
              width: '60%', 
              marginTop: '20px'
            }}
            onClick={()=>{
              this.registerAccount();
            }}
          >
            Register Account
          </div>  
        )
      }else{
        return <div/>
      }
    }
    const loginLogOutButton = () => {
      if(this.state.data.loggedIn==false){
        return(
          <div
            className="button"
            style={{
              marginLeft: '20%', 
              marginRight: '20%', 
              width: '60%', 
              marginTop: '20px'
            }}
            onClick={()=>{
              this.loginAccount();
            }}
          >
            Login Account
          </div>
        );
      }else{
        return(
          <div
            className="button"
            style={{
              marginLeft: '20%', 
              marginRight: '20%', 
              width: '60%', 
              marginTop: '20px'
            }}
            onClick={()=>{
              let data = this.state.data;
              data.loggedIn = false;
              data.loginRegisterErrorMessage = ""; 
              data.username = "";
              data.password = "";
              data.publicViewKey = "";
              data.trxReceipt = null;
              data.attributesSelected = [];
              this.setState({data});
            }}
          >
            Log Out
          </div>
        );
      }
    }

    return(
      <>
        <div
          style={{
            margin: '20px', 
            color: 'white', 
          }}
        >
          <h3>
            Username
          </h3>
        </div>  
        <div
          style={{
            margin: '20px'
          }}
        >
          <input
            className='input'
            value={this.state.data.username} onChange={e=>{
            let data = this.state.data;
            data.username = e.target.value;
            this.setState({data});
          }}/>
        </div>
        <div
          style={{
            margin: '20px', 
            color: 'white'
          }}
        >
          <h3>
            Password
          </h3>
        </div>  
        <div
          style={{margin: '20px'}}
        >
          <input
            className='input'
            value={this.state.data.password} onChange={e=>{
            let data = this.state.data;
            data.password = e.target.value;
            this.setState({data});
          }}/>
        </div>
        <div
          style={{
            color: 'black', 
            height: '20px', 
            textAlign: 'center', 
            width: '100%'
          }}
        >
          {data.loginRegisterErrorMessage}
        </div>
        {registerAccountButton()}
        {loginLogOutButton()}
      </>
    );
  }
  
  selectDemoIdpAccount(d: DemoIdPAccountState) {
    let data = this.state.data;
    data.loggedIn = true;
    data.username = d.demoAccount.accountName;
    data.selectedDemoIdpAccount = d;
    this.setState({data});
  }

  showRequestIssuance = () => {
    let data = this.state.data;
    if(data.accArray!=[]){
      if(data.selectedDemoIdpAccount!=null && data.accArray!=[]){
        const assocParse =(assoc: {[key: string]: any}[])=>{
          let returnstring = "";
          assoc.forEach(item=>{
            returnstring = returnstring + " " + item.attributeName;
          })
          return(returnstring);
        }
        let listShow = this.props.DemoState.idpAccountStates.map((d, key)=>{
          console.log("value of d: ", d)
          console.log("value of accArray: ", data.accArray);
          if(d.demoAccount.accountName==data.selectedDemoIdpAccount.demoAccount.accountName && data.accArray[key]!=undefined && data.selectedDemoIdpAccount.identityIssuances[key]!=undefined){
            return(
              <div
                style={{
                  color: 'white',
                  marginBottom: '5px', 
                  marginTop: '5px',
                  wordWrap: 'break-word'
                }}
              >
                Request for issuance from public key "{data.accArray[key].wallet.signingKey.compressedPublicKey}" for root attribute token "{data.selectedDemoIdpAccount.identityIssuances[key].rootAttribute.attributeName}" with field tokens {assocParse(data.selectedDemoIdpAccount.identityIssuances[key].associatedAttributes)}
              </div>
            )
          }else{      
            return(<div></div>)
          } 
        })

        const listShowFunc = () => {
          if(data.accArray.length!=0){
            return(
              <div
                style={{
                  marginTop: '5px', 
                  textAlign: 'center', 
                  background: 'rgb(52,79,142)' 
                }}
              >
                <div
                  style={{
                    color: 'white', 
                    marginTop: '5px'
                  }}
                >
                  Here are the tokens to be minted
                </div>
                <br/>
                {listShow}
                <br/>
                <div
                  className="button"
                  style={{
                    marginBottom: '5px'
                  }}
                  onClick={()=>{
                    this.mintTokenHandler();
                  }}
                > 
                  Mint Tokens
                </div>
              </div>
            )
          }else{
            return(<div/>)
          }
        }
        return(listShowFunc());
      }else{
        return(<div/>)
      }
    }
  }

  registerAccount = async() => {
    //http://localhost:5003/api/accounts
    let data = this.state.data;
    data.loginRegisterErrorMessage = "";
    data.trxReceipt = null;
    await this.setState({data});
    if(data.username==""||data.password==""){
      data.loginRegisterErrorMessage = "neither username nor password may be blank";
      this.setState({data})
    }else{
      axios.get<UserAccounts[]>("http://localhost:5003/api/accounts")
      .then(resolve=>{
        console.log("value of resolve: ", resolve);
        let usernameExists = false;
        resolve.data.forEach(entry=>{
          if (entry.accountInfo == data.username){
            usernameExists = true;
          }
        })
        if(!usernameExists){
          axios.post<UserAccounts>("http://localhost:5003/api/accounts/register", {
            accountType: 1, //identity
            accountInfo: this.state.data.username, 
            password: this.state.data.password
          })
          .then(resolve=>{
            let accountId = resolve.data.accountId;
            axios.post<UserAccounts>("http://localhost:5003/api/accounts/start", {
              accountId
            })  
            .then(resolve=>{
              console.log("value of resolve from account start: ", resolve)
              axios.post<Authenticate>("http://localhost:5003/api/accounts/authenticate", {
                accountId, 
                password: data.password
              })
              .then(resolve=>{
                data.publicSpendKey = resolve.data.publicSpendKey;
                data.loginRegisterErrorMessage = "user has been registered and logged in";
                data.loggedIn = true;
                this.setState({data});
              })
              .catch(error=>{
                data.loginRegisterErrorMessage = "username or password not authenticated";
              })

            })
            .catch(error=>{
              console.log("value of error: ", error);
            })
          })
          .catch(error=>{
            console.log("value of error: ", error);
          }); 
        }else{
          data.loginRegisterErrorMessage = "username already exists, please choose another";
          this.setState({data});
        }
      })
      .catch(error=>{
        console.log("there was an error retrieving accounts: ", error);
      });
    }
  }

  createPackage = () => {
    let data = this.state.data;
    console.log("value of optionSelected: ", data.optionSelected);
    console.log("value of attributes: ", data.attributes);
    let optionList = data.attributes.map((attribute,key)=>{
      return(
        <option
          key={key}
          value={attribute.name}
        >
          {attribute.description}
        </option>
      );
    })
    if(data.loggedIn){
      return(
        <>
          <div
            style={{
              display: 'flex', 
              flexDirection: 'row', 
              marginLeft: '2.5%', 
              marginRight: '2.5%', 
              width: '95%', 
              alignItems: 'center', 
              alignContent: 'center'
            }}
          >
            <div
              style={{
                flex: 1
              }}
            >
              <select
                className="input"
                style={{
                  marginTop: '0px', 
                  background: 'white'
                }}
                value={data.optionSelected.name} 
                onChange={(e)=>{
                  data.errorMessageSelect="";
                  data.attributes.forEach(attribute=>{
                    if(attribute.name == e.target.value){
                      data.optionSelected = attribute;
                    }
                  })
                  this.setState({data})            
                }}
              >
                <option selected={true}>
                  Select an attribute from the list to add.
                </option>
                {optionList}
              </select>
            </div>
            <div
              style={{
                flex: 1, 
                // background: 'green'
              }}
            >
              <div
                style={{
                  display:'inline-block'
                }}
              >
                Root?
              </div>
              <div
                style={{
                  display: 'inline-block'
                }}
              >
                <input className="input"
                  style={{
                    cursor: 'pointer'
                  }}
                  type="checkbox"
                  checked={this.state.data.isRoot}
                  onChange={(e)=>{
                    let data = this.state.data;
                    data.isRoot = !data.isRoot;
                    this.setState({data});
                  }}
                />
              </div>
            </div>
            <div
              style={{
                flex: 1
              }}
            >
              {/* 
                interface SchemeResolution{
                  schemeId: number,
                  attributeName: string,
                  schemeName: string,
                  alias: string, 
                  description: string, 
                  isActive: boolean, 
                  isRoot: boolean
                } 
              */}
              {/* interface SchemeItems{
                name: string,
                description: string,
                valueType: string,
                allowMultiple: string
              } */}
              <div
                className='button'
                onClick={()=>{
                  let data = this.state.data;
                  data.trxReceipt = null;
                  let attributeToAdd: {[key: string]:any};
                  data.attributes.map(attribute=>{
                    console.log("value of attribute.name: ", attribute.name);
                    console.log("value of data.optionSelected.name: ", data.optionSelected.name);
                    if(attribute.name==data.optionSelected.name){
                      attributeToAdd = {
                        attributeName: "",
                        schemeName: attribute.name,
                        alias: "", 
                        description: "", 
                        isRoot: data.isRoot
                      };
                    } 
                  })
                  if(data.optionSelected.allowMultiple){
                    data.attributesSelected.push(attributeToAdd);
                  }else{
                    let foundInstance = false;
                    data.attributesSelected.forEach(attribute=>{
                      if(attribute.schemeName==data.optionSelected.name){
                        foundInstance = true;
                        data.errorMessageSelect = "cannot use multiple of this item"
                      }
                    })
                    if(!foundInstance){
                      data.attributesSelected.push(attributeToAdd);
                    }
                  }
                  this.setState({data});
                }}
              > 
                Add Element
              </div>
            </div>
          </div>
        </>
      );
    }else{
      return(
        <div>
          <div
            style={{
              margin: '20px', 
              color: 'white'
            }}
          >
            Register or login to create a package from available attributes.
          </div> 
        </div>
      );
    }
  }

  attributesSelectedList = () => {
    let data = this.state.data;
    let attributesList = data.attributesSelected.map((attribute, key)=>{
      console.log("******************************************");
      console.log("value of attribute: ", attribute);
      console.log("******************************************");
      return(
        <div key={key}> 
          <div>
            {attribute.schemeName}
          </div>
          <div>
            <div
              style={{
                display: 'inline-block', 
                textDecoration: 'underline'
              }}
            >
              Attribute Name: 
            </div>
            <input
              className="input"
              onChange={(e)=>{
                let data = this.state.data;
                data.attributesSelected[key]["attributeName"] = e.target.value;
                this.setState({data}, ()=>{
                  console.log("value of data after setting attributeName: ", data);
                })
              }}
            >
            </input>      
          </div>
          <div>
            <div
              style={{
                display: 'inline-block', 
                textDecoration: 'underline'
              }}
            >
              Alias: 
            </div>
            <input
              className="input"
              onChange={(e)=>{
                let data = this.state.data;
                data.attributesSelected[key]["alias"] = e.target.value;
                this.setState({data}, ()=>{
                  console.log("value of data after setting attributeName: ", data);
                })
              }}
            >
            </input>      
          </div>
          <div>
            <div
              style={{
                display: 'inline-block', 
                textDecoration: 'underline'
              }}
            >
              Description: 
            </div>
            <input
              className="input"
              onChange={(e)=>{
                let data = this.state.data;
                data.attributesSelected[key]["attributeName"] = e.target.value;
                this.setState({data}, ()=>{
                  console.log("value of data after setting attributeName: ", data);
                })
              }}
            >
            </input>      
          </div>
          <div>
            <div
              style={{
                display: 'inline-block', 
                textDecoration: 'underline'
              }}
            >
              isRoot: <span style={{textDecoration: 'none'}}>{attribute.isRoot.toString()}</span>
            </div>      
          </div>
        </div>
      );
    });
    return(
      <div
        style={{
          textAlign: 'center', 
          marginTop: '5px'
        }}
      >
        {attributesList}
      </div>
    );
  }

  storeAttributes = () => {
    let data = this.state.data;
    console.log("value of data.publicViewKey: ", data.publicViewKey);
    console.log("value of data.publicSpendKey: ", data.publicSpendKey);
    console.log("value of data.attributesSelected: ", data.attributesSelected);
    axios.put<SchemeResolution[]>("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+data.selectedDemoIdpAccount.demoAccount.account.publicSpendKey, data.attributesSelected)
    .then(resolve=>{
      console.log('value of resolve ***&&&***: ', resolve);
      data.attributesSelected.forEach(attribute=>{
        data.identityPayload.push({
          name: attribute.attributeName+"@"+data.username, 
          symbol: attribute.attributeName+"@"+data.username,
          property: (data.isRoot?"root":"associated")+"@"+attribute.schemeName,
          alias: attribute.alias
        })
      })
      console.log("value of data.identityPayload: ", data.identityPayload);
      data.attributesSelected = [];
      this.setState({data}, ()=>{
        console.log("after setting identityPayload and value: ", this.state.data.identityPayload);
        this.NFTAttributes();
        // this.identityProviderFlow()
      });
    })
    .catch(error=>{
      console.log('value of error: ', error);
    })
  }

  storeAttributesButton = () => {
    if(this.state.data.attributesSelected.length>0){
      return(
        <div
          className="button"
          onClick={()=>{
            this.storeAttributes();
          }}
        >
          Store Attributes
        </div>
      )
    }else{
      return(<div/>)
    }
  }

  // Name - {attribute name} @ {issuer name}
  // Symbol - {attribute name} @ {issuer name}
  // Property - root|associated @ {attribute scheme name}
  // Metadata - {alias}

  //open question - how do i know what wallet to use here? 

  identityCallback = (trxReceipt: TransactionReceipt) => {
    let data = this.state.data;
    data.trxReceipt = trxReceipt;
    data.identityPayload = [];
    this.setState({data});
  }

  createWalletsHandler = async () => {
    let data = this.state.data;
    data.walletDefined = true;

    let wallets = this.props.Wallets.createNFTWallets();
    data.wallet = (await wallets).wallet;
    data.provider = (await wallets).provider;
    data.issuer = (await wallets).issuer;
    data.middleware = (await wallets).middleware;
    
    this.setState({data});
  }

  createTokenHandler = async() => {
    let data = this.state.data;
    console.log("value of symbol: ", data.symbol);
    try{
      const tokencreator = new TokenCreator(data.symbol, data.feeCollector, data.issuer, data.wallet, data.itemMetadata, data.itemProperties);
      await tokencreator.create();
      const nonFungibleToken = await tokencreator.reload(data.symbol, data.wallet);
      const issuerNonFungibleToken = await tokencreator.reload(data.symbol, data.issuer);
      data.nft = nonFungibleToken;
      data.issuerNft = issuerNonFungibleToken;
      data.afterToken = "Here is the data after token creation: nft: "+JSON.stringify(data.nft)+" issuerNft: "+JSON.stringify(data.issuerNft);
      this.setState({data}, ()=>{console.log("DATA AFTER TOKEN CREATION: ", this.state.data.afterToken)});
      try{
          const receipt = await new Approver(data.symbol, data.provider, data.issuer, data.middleware).approve();
          data.nft = await Util.reload(data.symbol, data.wallet);
          data.issuerNft = await Util.reload(data.symbol, data.issuer);
          data.afterApproval = "Here is the data after token approval: nft: "+JSON.stringify(data.nft)+" issuerNft: "+JSON.stringify(data.issuerNft)+" receipt value: "+JSON.stringify(receipt)
          this.setState({data}, ()=>{console.log("DATA AFTER APPROVAL: ", this.state.data.afterApproval)});
      }
      catch(e){
          console.log("there was an error: ", e);
      }
    }
    catch(e){
        console.log("there was an error: ", e);
    }
  }

  mintAssociated = async(associated: AssociatedMint[]) => { 
    let data = this.state.data;
    associated.forEach(assoc=>{
      let packageObj = {
        symbol: assoc.attributeName+"@"+data.username,
        itemID: assoc.assetCommitment, 
        property: assoc.bindingToRootCommitment
      }
      try{
          const minter = new Minter(packageObj.symbol, crypto.randomBytes(16).toString('hex'), packageObj.itemID, packageObj.property);
          const trxFunc = async() =>{ 
            let trxRec = await minter.mint(data.wallet, data.wallet.address); 
            return trxRec;
          }
          let trxRec = trxFunc();
          data.userMintReceipts.push(
            {
              symbol: packageObj.symbol,
              type: 'associated',
              trxRec,
            }  
          );
      }
      catch(e){
          console.log("there was an error: ", e)
      }
    })
    this.setState({data}, ()=>{
      console.log("value after minting associated items", this.state.data.userMintReceipts)
    })
  }

  mintRoot = async(root: RootMint) => {
    let data = this.state.data;
    let packageObj = {
      symbol: root.attributeName+"@"+data.username, 
      itemID: root.assetCommitment,
      property: root.originatingCommitment+root.surjectionProof
    }
    try{
      const minter = new Minter(packageObj.symbol, crypto.randomBytes(16).toString('hex'),packageObj.itemID, packageObj.property);
      const trxFunc = async() =>{ 
        let trxRec = await minter.mint(data.wallet, data.wallet.address); 
        return trxRec;
      }
      let trxRec = trxFunc();
      data.userMintReceipts.push(
        {
          symbol: packageObj.symbol,
          type: 'root',
          trxRec,
        }  
      );
    }
    catch(e){
        console.log("there was an error: ", e)
    }
  }

  mintTokenHandler = async() => {
    try{
      let data = this.state.data;
      console.log("")
      data.accArray.forEach(acc=>{
        if(data.username==acc.accountName){
          this.mintAssociated(acc.identityIssuances[0].associatedAttributes);
          this.mintRoot(acc.identityIssuance[0].rootAttribute)      
        }
      });
    }catch(e){
      console.log("there was an error: ", e);
    }
  }

pullAccounts = () => {
  console.log("inside pullaccounts");
  let data = this.state.data;
  
  const authenticate = (accountId: number) => {
    axios.post<Authenticate>('http://localhost:5003/api/accounts/authenticate', {
        accountId: accountId.toString(), 
        password: null
      })
      .then(resolve=>{
        let data = this.state.data;
        data.publicSpendKey = resolve.data.publicSpendKey
        // data.loginRegisterErrorMessage = "user successfully logged in";
        data.loggedIn = true;
        this.setState({data});
        // this.props.addToGroup(accountId.toString());
        this.getUserAttributes(accountId.toString());
      })
      .catch(error=>{
        let data = this.state.data;
        data.loginRegisterErrorMessage = "username or message is invalid";
      })
  }
  
  
  if(data.accountArray.length==0){
    console.log("inside if statement 1")
    axios.get<UserAccounts[]>("http://localhost:5003/api/accounts?ofTypeOnly=1")
    .then(resolve=>{
      console.log("value of resolve in pullAccounts: ", resolve);
      data.accountArray = resolve.data;
      this.setState({data}) 
    })
    .catch(error=>{
      console.log("value of error: ", error);
    })
  }
  if(data.accountArray.length!=0){
    console.log("value of accountArray: ", data.accountArray);
    let accountButtons = data.accountArray.map((acc, key)=>{
      return(
        <div>
          <div
            key={key}
            className="button"
            style={{
              marginBottom: '5px'
            }}
            onClick={async()=>{
              data.publicSpendKey = acc.publicSpendKey;    
              await this.setState({data})
              await authenticate(acc.accountId);
            }}
          >
            {acc.accountInfo}
          </div>
        <br/>
        </div>
      )
    })
    
    return(
      <div
        style={{
          marginTop: '10px', 
          textAlign: 'center'
        }}
      >
        <div
          style={{
            color: 'white', 
            fontSize: '1.2rem'
          }}
        >
          Here is the list of available Providers
        </div>
        <br/>
        {accountButtons}
      </div>
    )
  }else{
    return(<div/>)
  }
}

afterTokenCreation = () => {
  if(this.state.data.afterToken!=""){
    return(
      <div
        style={{
          marginTop: '5px', 
          background: 'rgb(52,79,142)',
          marginBottom: '5px', 
          color: 'white', 
          maxHeight: '20vh', 
          overflowY: 'scroll',
          wordWrap: 'break-word',
          width: '100%'
        }}
      >
        <h3>Here is the token information after creation:</h3>
        <br/>
        <hr/>
        <br/>
        <p>{this.state.data.afterToken}</p>
      </div>
    )
  }else{
    return(<div/>)
  }
}


afterTokenApproval = () => {
  if(this.state.data.afterToken!=""){
    return(
      <div
        style={{
          marginTop: '5px', 
          background: 'rgb(52,79,142)',
          marginBottom: '5px', 
          color: 'white', 
          maxHeight: '20vh', 
          overflow: 'scroll', 
          overflowY: 'scroll',
          wordWrap: 'break-word',
          width: '100%'
        }}
      >
        <h3>Here is the token information after approval:</h3>
        <br/>
        <hr/>
        <br/>
        <p>{this.state.data.afterApproval}</p>
      </div>
    )
  }else{
    return(<div/>)
  }
}


//   identityProviderFlow = async() =>{
//     await this.createWalletsHandler();
//     await this.createTokenHandler();
//     //this.mintTokenHandler();
//   }

  NFTAttributes = async() => {
    let data = this.state.data;
    await this.createWalletsHandler();
    // console.log("value of wallets: ", this.props.Wallets);
    console.log("value of data.identityPayload.length: ", data.identityPayload.length);
    console.log("value of data.identityPayload; ", data.identityPayload);
    if(data.identityPayload.length>0){
      asyncForEach(data.identityPayload, async(payload:any)=>{
        data.symbol = payload.symbol;
        data.itemProperties = payload.properties;
        data.itemMetadata = payload.name + "@@@" + payload.alias;
        await this.setState({data}, async()=>{
          await this.createWalletsHandler();
          await this.createTokenHandler();
          await sleep(1000);
        })
      })
      this.identityCallback(data.trxReceipt);
    }
  }

  render(){
    return(
      <>
        <div
          className="leftpanel"
        >
          {this.listOfAccounts()}
          {this.showRequestIssuance()}
          {/* {this.loginAccount} */}
          {/* {this.userNamePassword()} */}
          {/* {this.pullAccounts()} */}
        </div>
        <div
          className="pages"
          style={{
            color: 'white'
          }}
        > 
          <div
            style={{
              margin: '20px', 
              color: 'white'
            }}
          >
            <p>
              This is the account creation page. Select account values to add, with a root and several associated attributes. 
            </p>
          </div>
          {this.createPackage()}
          <div
            style={{
              color: 'red', 
              textAlign: 'center', 
              marginTop: "10px", 
              marginBottom: "10px"
            }}
          > 
            {this.state.data.errorMessageSelect}
          </div>
          <div
            style={{
              width: '80%', 
              marginLeft: '10%',
              background: this.state.data.attributesSelected.length>0?'rgb(52,79,142)':"", 
              maxHeight: '60vh', 
              overflowY: 'auto'
            }}
          >
            {this.attributesSelectedList()}
          </div>   
          <div
            style={{
              marginTop: '20px', 
              float: 'right', 
              marginRight: '5px'
            }}
          >
            {this.storeAttributesButton()}
          </div> 
          {this.afterTokenCreation()}
          {this.afterTokenApproval()}    
          {/* {this.NFTAttributes()} */}
          {/* {this.showMintValues()} */}
        </div>
      </>
    )
  }
}

export default Identity2;