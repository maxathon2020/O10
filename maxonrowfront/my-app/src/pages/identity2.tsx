import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { timeStamp } from 'console';
import { queryAllByAttribute } from '@testing-library/react';
import NFT from './NFT';
import ProviderOrSignerRequest from '../shared/initialize';

class DataClass{
  private _loginRegisterErrorMessage = "";
  
  public set loginRegisterErrorMessage(value: string){
    this._loginRegisterErrorMessage = value;
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
};
interface MyState {
  data: DataClass;
};


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
    console.log("value of Wallets on ComponentDidMount: ", this.props.Wallets);
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
      this.setState({data});
    }else{
      axios.get<UserAccounts[]>("http://localhost:5003/api/accounts?ofTypeOnly=3")
      .then(resolve=>{
        console.log("value of resolve: ", resolve);
        resolve.data.forEach(account=>{
          if(account.accountInfo==data.username){
            axios.get<SchemeResolution[]>("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+account.publicViewKey)
            .then((resolve)=>{
              let usernameMatches = false;
              let passwordMatches = false;
              resolve.data.forEach(item=>{
                if(item.schemeName=="password" && item.description==data.password){
                  passwordMatches = true;
                }
                if(item.schemeName=="email" && item.description==data.username){
                  usernameMatches = true;
                }
              });
              if(usernameMatches && passwordMatches){
                data.loggedIn = true;
                data.publicViewKey = account.publicViewKey;
                data.publicSpendKey = account.publicSpendKey;
                data.loginRegisterErrorMessage="user successfully logged in";
                this.setState({data});  
              }else{
                data.loginRegisterErrorMessage="username or password is invalid";
                this.setState({data});
              }
            })
            .catch((error)=>{
              console.log("value of error: ", error);
            })
          }else{
            data.loginRegisterErrorMessage = "username or password is invalid";
            this.setState({data});
          }
        })
      })
      .catch(error=>{
        console.log("value of error: ", error);
      })
    }
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
  

  registerAccount = async() => {
    //http://localhost:5003/api/accounts
    let data = this.state.data;
    data.loginRegisterErrorMessage = "";
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
            axios.post<UserAccounts>("http://localhost:5003/api/accounts/start", {
              accountId: resolve.data.accountId
            })  
            .then(resolve=>{
              console.log("value of resolve from account start: ", resolve)
              data.loginRegisterErrorMessage = "user has been registered and logged in";
              data.loggedIn = true;
              this.setState({data});
              console.log("value of resolve.data.publicViewKey: ", resolve.data.publicViewKey);
              let username_password_data = [
                {
                  attributeName: "password",
                  schemeName: "password",
                  alias: "????",
                  description: data.password,
                  isActive: true,
                  isRoot: false
                },{
                  attributeName: "username",
                  schemeName: "email",
                  alias: "????",
                  description: data.username,
                  isActive: true,
                  isRoot: false
                } 
              ];
              let publicViewKey = resolve.data.publicViewKey;
              let publicSpendKey = resolve.data.publicSpendKey;
              axios.put("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+publicViewKey, username_password_data)
              .then(resolve=>{
                console.log('value of resolve of register /api/SchemeResolution/AttributeDefinitions?issuer=:', resolve);
                data.publicViewKey = publicViewKey;
                data.publicSpendKey = publicSpendKey; 
                this.setState({data}, ()=>{
                  console.log("after setting publicSpendKey and value is: ", data.publicSpendKey);
                });
              })
              .catch(error=>{
                console.log('value of error: ', error);
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
    axios.put<SchemeResolution[]>("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+data.publicSpendKey, data.attributesSelected)
    .then(resolve=>{
      console.log('value of resolve: ', resolve);
      data.attributesSelected.forEach(attribute=>{
        data.identityPayload.push({
          name: attribute.attributeName+"@"+data.username, 
          symbol: attribute.attributeName+"@"+data.username,
          property: (data.isRoot?"root":"associated")+"@"+attribute.schemeName,
          alias: attribute.alias
        })
      })
      data.attributesSelected = [];
      this.setState({data});
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

  identityCallback = () => {
    let data = this.state.data;
    data.fromIdentity = true;
    this.setState({data});
  }

  mintNFTAttributes = () => {
    let data = this.state.data;
    console.log("value of wallets: ", this.props.Wallets);
    if(data.identityPayload.length>0){
      return(
        <NFT 
          Wallets={this.props.Wallets}
          identityPayload={data.identityPayload}
          fromIdentity={true}
          identityCallback={()=>{this.identityCallback()}}
        />
      )
    }else{
      return(<div/>)
    }
  }

  render(){
    return(
      <>
        <div
          className="leftpanel"
        >
          {this.userNamePassword()}
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
              background: this.state.data.attributesSelected.length>0?'green':"", 
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
          {this.mintNFTAttributes()}
        </div>
      </>
    )
  }
}

export default Identity2;