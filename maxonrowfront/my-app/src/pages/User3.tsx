import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { timeStamp } from 'console';
import { register } from '../serviceWorker';
import { queryAllByAttribute } from '@testing-library/react';
import * as crypto from "crypto";

class DataClass {
  private _publicSpendKey: string;
  private _inputSchematics: {[key: string]: any}[] = [];
  private _issuerPublicKey: string;
  private _pulledIdentity: boolean;

  private _providerSelectedName: string = "";
  private _masterRootSelected: number = -1;

  public get masterRootSelected():number{
    return this._masterRootSelected;
  }

  public set masterRootSelected(value: number){
    this._masterRootSelected = value;
  }

  public get providerSelectedName():string{
    return this._providerSelectedName;
  }

  public set providerSelectedName(value: string){
    this._providerSelectedName = value;
  }

  public set publicSpendKey(value: string){
    this._publicSpendKey = value;
  }

  public get publicSpendKey(): string{
    return this._publicSpendKey;
  }

  private _username: string = "";
  private _password: string = "";
  private _attributeModalOpen: boolean = false;
  private _loggedIn: boolean = false;
  private _loginRegisterErrorMessage = "";
  private _accountId: string = null;
  private _addMultipleErrorMessage = "";
  private _activeRoot: {[key: string]: any}=[
    {
      name: "null",
      index: 0
    }
  ];
  private _publicViewKey: string;

  public get issuerPublicKey(): string{
    return this._issuerPublicKey;
  }

  public set issuerPublicKey(value: string){
    this._issuerPublicKey = value;
  }

  private _identityAccounts: {[key: string]: any}[] = [];

  public get inputSchematics(): {[key: string]: any}[]{
    return this._inputSchematics;
  }

  public set inputSchematics(value: {[key: string]:any}[]){
    this._inputSchematics = value;
  }

  public get pulledIdentity(): boolean{
    return this._pulledIdentity;
  }

  public set pulledIdentity(value: boolean){
    this._pulledIdentity = value;
  }

  public get identityAccounts(): {[key: string]: any}[]{
    return this._identityAccounts;
  }

  public set identityAccounts(value: {[key: string]: any}[]){
    this._identityAccounts = value;
  }

  private _rootAttributesTest: {[key: string]:any}[] = [
    // {name:"Email",description:"Email",valueType:"Email",allowMultiple:false},
    // {name:"Password",description:"Password",valueType:"Password",allowMultiple:false},
    {name:"Misc",description:"Miscellaneous",valueType:"Any",allowMultiple:true},
    {name:"DrivingLicense",description:"Driving License",valueType:"Any",allowMultiple:false},{name:"IdCard",description:"Id Card",valueType:"Any",allowMultiple:false},
    {name:"Passport",description:"Passport",valueType:"Any",allowMultiple:false}
  ]
  
  private _associateAttributesTest: {[key: string]:any}[] = [
    {name:"Misc",description:"Miscellaneous",valueType:"Any",allowMultiple:false,
    roots: ["Misc"]
    },
    {name:"EmployeeGroup",description:"Employee Group",valueType:"Any",allowMultiple:false,
    roots: ["IdCard"]
    },
    {name:"FirstName",description:"First Name",valueType:"Any",allowMultiple:false,
    roots: ["IdCard", "DrivingLicense", "Passport"]
    },
    {name:"LastName",description:"Last Name",valueType:"Any",allowMultiple:false, 
    roots: ["IdCard", "DrivingLicense", "Passport"]
    },
    {name:"Issuer",description:"Issuer",valueType:"Any",allowMultiple:false,
    roots: ["IdCard", "DrivingLicense", "Passport"]
    },
    {name:"IssuanceDate",description:"Issuance Date",valueType:"Date",allowMultiple:false,
    roots: ["IdCard", "DrivingLicense", "Passport"]
    },
    {name:"ExpirationDate",description:"Expiration Date",valueType:"Date",allowMultiple:false, 
    roots: ["IdCard", "DrivingLicense", "Passport"]
    },
    {name:"DlVehicleType",description:"Driving License Vehicle Type",valueType:"Any",allowMultiple:false, 
    roots: ["DrivingLicense"]
    },
    {name:"PassportPhoto",description:"Passport Photo",valueType:"Image",allowMultiple:false,
    roots: ["Passport"]
    },
    {name:"Nationality",description:"Nationality",valueType:"Any",allowMultiple:false, 
    roots: ["Passport"]
    },
    {name:"PlaceOfBirth",description:"Place Of Birth",valueType:"Any",allowMultiple:false, 
    roots: ["Passport"]
    },
    {name:"DateOfBirth",description:"Date Of Birth",valueType:"Date",allowMultiple:false, 
    roots: ["DrivingLicense", "Passport"]
    }
  ]

  private _rootAttributes: {[key: string]:any}[] = [
    {
      name: "default", 
      description: "default", 
      valueType: "default", 
      allowMultiple: "default"
    }
  ];  

  private _rootAttributesSelected: {[key: string]:any}[] = [{}];  


  public get accountId(): string{
    return this._accountId;
  }

  public set accountId(value: string){
    this._accountId = value;
  }

  public set activeRoot(value: {[key: string]: any}){
    this._activeRoot = value;
  }

  public get activeRoot():{[key: string]: any}{
    return this._activeRoot;
  }

  
  public get attributeModalOpen(): boolean {
    return this._attributeModalOpen;
  }

  public set attributeModalOpen(value: boolean){
    this._attributeModalOpen = value;
  }
  
  public get rootAttributesSelected(): {[key: string]: any}[]{
    return this._rootAttributesSelected;
  }

  public set rootAttributesSelected(value: {[key: string]: any}[]){
    this._rootAttributesSelected = value;
  } 

  public get rootAttributesTest(): {[key: string]: any}[]{
    return this._rootAttributesTest;
  }

  public set rootAttributesTest(value: {[key: string]: any}[]){
    this._rootAttributesTest = value;
  } 

  public get associateAttributesTest(): {[key: string]: any}[]{
    return this._associateAttributesTest;
  }

  public set associateAttributesTest(value: {[key: string]: any}[]){
    this._associateAttributesTest = value;
  } 

  public get rootAttributes(): {[key: string]: string}[]{
    return this._rootAttributes;
  }

  public set rootAttributes(value: {[key: string]: string}[]){
    this._rootAttributes = value;
  } 

  public set loginRegisterErrorMessage(value: string){
    this._loginRegisterErrorMessage = value;
  }

  public get loginRegisterErrorMessage(): string{
    return this._loginRegisterErrorMessage;
  }

  public set addMultipleErrorMessage(value: string){
    this._addMultipleErrorMessage = value;
  }

  public get addMultipleErrorMessage(): string{
    return this._addMultipleErrorMessage;
  }

  public set publicViewKey(value: string){
    this._publicViewKey = value;
  }

  public get publicViewKey(): string{
    return this._publicViewKey;
  }

  public set username(value: string){
    this._username = value;
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

  public get loggedIn(): boolean{
    return this._loggedIn;
  }

  public set loggedIn(value:boolean){
    this._loggedIn = value;
  }

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

interface IdentityAccounts{
  accountId: number, 
  accountType: number, 
  accountInfo: string, 
  password: null, 
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
  publicSpendKey: string, 
  publicViewKey: string
}

// POST /api/User/AttributesIssuance?accountId=<number, user accountId>
// {
// 	“issuer”: 32-chars hex-string, issuer’s public key,
// 	“masterRootAttributeId”: numeric, optional,
// 	“attributeValues”: [
// 		“<attributeName>”: string,
// 		...
// 		“<attributeName>”: string,
// 	]
// }

  // GET /api/User/UserAttributes?accountId=<number>
  {/* [
    {
    “state”: 0 - not confirmed, 1 - confirmed, 2 - disabled,
    “issuer”: 64-chars hex-string,
    “issuerName”: string,
    “rootAttributeContent”: string,
    “rootAssetId”: 64-chars hex-string,
    “schemeName”: string,
    “rootAttributes”: [
      {
        “userAttributeId”: numeric,
        “schemeName”: string,
        “source”: 64-chars hex-string,
        “issuerName”: string,
        “validated”: true|false
        “content”: string,
        “isOverriden”: true|false
      }
    ]
    },...
] */}

interface UserAttributes{

}

// {
//   rootAttribute: {
//     “attributeName”: free string expression
//     “alias”: free string expression
//   },
//   associatedAttributes: [
//     {
//       “attributeName”: free string expression
//       “alias”: free string expression
//     },
//     ...
//   ]
// }

interface SchematicAttribute{
  attributeName: string, 
  alias: string
}

interface Schematics{
  rootAttribute: SchematicAttribute,
  associatedAttributes: SchematicAttribute[]
}

interface MyProps {
  requestForIssuance: (arg0: string, arg1: {[key: string]: any}[])=>void,
  addToGroup: (arg0: string)=>void
};

interface MyState {
  data: DataClass;
};

class User3 extends Component<MyProps, MyState>{
  constructor(props: MyProps){
    super(props);
    this.state = {
      data: new DataClass()
    }
  }

  toggleAttributeModal = async() => { 
    let data = this.state.data;
    data.attributeModalOpen = !data.attributeModalOpen;
    await this.setState({data});
    if(data.attributeModalOpen){
      data.addMultipleErrorMessage = "";
      await this.setState({data});
    }
  }

  AddAttributeModal = () => {
    let data = this.state.data;
    if(data.attributeModalOpen){
      let rootAttributes = data.rootAttributesTest.map((attribute, key)=>{
        return(
          <div
            key={key}
            className="button"
            onClick={()=>{
              this.addRootAttribute(attribute, key);
            }}
            style={{
              margin: '5px', 
              width: '90%'
            }}
          >
            {attribute.description}
          </div>
        );
      })
      return(
        <div
          style={{
            width: '100%', 
            height: '100%', 
            position: 'absolute', 
            textAlign: 'center', 
            zIndex: 2,
            background: 'rgba(100,100,100,0.75)'
          }}
        >
          <div
            style={{
              margin: '10%',
              height: '80%',
              background: 'green', 
              color: 'white',
              padding: '20px'
            }}
          >
            <div>
              <p>
                Please Select A Root Attribute To Add:
              </p>
            </div>
            <div
              style={{
                background: "rgba(200,200,200,1)",
                display: 'inline-block',
                textAlign: 'center',
                borderRadius: '5px',  
                marginTop: '5px',
                padding: '5px', 
                maxHeight: '75%',
                overflow: 'auto'
              }}
            >
              {rootAttributes}
            </div>
            <div
              style={{
                margin: '20px',
                float: 'left', 
                display: 'inline-block', 
                color: 'red'
              }}
            >
              {this.state.data.addMultipleErrorMessage}
            </div>
            <div
              className="button"
              style={{
                margin: '20px',
                float: 'right', 
                display: 'inline-block', 
                color: 'red'
              }}
              onClick={()=>{
                this.toggleAttributeModal();
              }}
            >
              Exit Without Adding
            </div>
          </div>
        </div>
      );
    }else{
      return(
        <div/>
      );
    }
  }

  componentWillMount(){
    this.getRootAtributes();
  }

  componentDidMount(){
    console.log("crypto.randomBytes(16).toString('hex');", crypto.randomBytes(16).toString('hex'))
    // crypto
    // var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    // var mystr = mykey.update('abc', 'utf8', 'hex')
    // mystr += mykey.final('hex');

    // console.log(mystr);
  }



  componentDidUpdate(prevState:any, prevProps:any){
    // if(this.state.data!=undefined && prevState.data!=undefined){
    //   console.log("value of this.state.data: ", this.state.data);
    //   if(this.state.data.accountId!=null && prevState.data.accountId==null){
    //     console.log("accountId has changed in state");
    //   }
    // }
    //   if(prevState!=this.state){
  //     if(this.state.data.accountId!=null && prevState.data.accountId==null){
  //       // {
  //       //   “rootAttribute”: {
  //       //     “attributeName”: string,
  //       //     “originatingCommitment”: 64-chars hex-string,
  //       //     “assetCommitment”: 64-chars hex-string,
  //       //     “surjectionProof”: 192-chars hex-string
  //       //   },
  //       //   “associatedAttributes”: [
  //       //     {
  //       //       “attributeName”: string,
  //       //       “assetCommitment”: 64-chars hex-string,
  //       //       “bindingToRootCommitment”: 64-chars hex-string
  //       //     }
  //       //   ]
  //       // }
  
  //       // let packageObj = {
  //       //   rootAttribute: {
  //       //     attributeName: "teststring",
  //       //     originatingCommitment: "teststring",
  //       //     assetCommitment: "teststring",
  //       //     surjectionProof: "teststring"
  //       //   },
  //       //   associatedAttributes: [
  //       //     {
  //       //       attributeName: "teststring",
  //       //       assetCommitment: "teststring",
  //       //       bindingToRootCommitment: "teststring"
  //       //     }, 
  //       //     {
  //       //       attributeName: "teststring",
  //       //       assetCommitment: "teststring",
  //       //       bindingToRootCommitment: "teststring"
  //       //     }
  //       //   ]
  //       // }  
  //       // let packageObj = [];
  //       let packageObj:{[key: string]: any}[] = [];    
  //       this.props.clientIdHandler(this.state.data.accountId, packageObj);
  //     }
  //   }
  }

  requestForIssuance = () => {
    let packageObj:{[key: string]: any}[] = [];    
    this.props.requestForIssuance(this.state.data.accountId, packageObj);
  }

  addToGroup = () => {
    this.props.addToGroup(this.state.data.accountId);
  }

  getRootAtributes = () => { 

    // attributes are currently not organized by 
    // root and associated attributes - using a test sample instead.

    // axios.get<SchemeItems[]>("http://localhost:5003/api/SchemeResolution/SchemeItems")
    // .then((resolve)=>{
    //   console.log("value of resolution: ", resolve);
    //   console.log("typeof resolve: ", typeof resolve);
    //   console.log("typeof this.state.data.rootAttributes; ", typeof this.state.data.rootAttributes)
    //   let rootAtributes: {[key: string]:string}[] = [];
    //   resolve.data.forEach(item=>{
    //     console.log("value of item: ", item);
    //     let rootAttribute = {
    //       name: item.name,
    //       description: item.description, 
    //       valueType: item.valueType,
    //       allowMultiple: item.allowMultiple
    //     }
    //     rootAtributes.push(rootAttribute);
    //   })
    //   let data = this.state.data;
    //   data.rootAttributes = rootAtributes;
    //   this.setState({data});
    // })
    // .catch(error=>{
    //   console.log("value of error: ", error);
    // })
    
  }

  //USE API HERE

  addRootAttribute = async(attribute: {[key: string]: any}, key: number) => {
    let data = this.state.data;

    console.log("value of attribute in addRootAttribute: ", attribute);

    //here is the code for using without api

    // console.log("inside addRootAttribute");
    // console.log("value of attribute: ", attribute);
    // console.log("value of data.rootAttributesSelected: ", data.rootAttributesSelected);
    // if(attribute.allowMultiple==false){
    //   let multipleExists = false;
    //   await data.rootAttributesSelected.forEach(selectedAttribute=>{
    //     if(selectedAttribute==attribute){
    //       multipleExists = true;
    //       data.addMultipleErrorMessage = "May not add multiple of this field";
    //       this.setState({data});
    //     }
    //   })
    //   if(multipleExists==false){
    //     attribute.index = key;
    //     data.rootAttributesSelected.push(attribute);
    //     await this.setState({data})
    //     this.toggleAttributeModal()
    //   }
    // }else{
    //   attribute.index = key;
    //   data.rootAttributesSelected.push(attribute);
    //   await this.setState({data});
    //   this.toggleAttributeModal();
    // }


    let currentData = await this.getAttributesValues();

    const pushData = () => {
      let pushValue: SchemeResolution = {
        schemeId: null,
        attributeName: attribute.name,
        schemeName: attribute.name,
        alias: attribute.name, 
        description: attribute.description, 
        isActive: true, 
        isRoot: true
      }
      currentData.push(pushValue);
      this.putAttributesValues(currentData, true);  
    }

    if(attribute.allowMultiple == false){
      let multipleExists = false;
      currentData.forEach(currentAttribute=>{
        if(currentAttribute.attributeName==attribute.name){
          multipleExists = true
          data.addMultipleErrorMessage = "May not add multiple of this field";
          this.setState({data});
        }
      })
      if(multipleExists==false){
        pushData();
        this.toggleAttributeModal();
      }
    }else{
      pushData();
      this.toggleAttributeModal();
    }

  }

  putAttributesValues = (currentData: {[key: string]: any}, isRoot: boolean) => {
    let data = this.state.data;
    let returnData: SchemeResolution[];
    let currentDataClean = currentData.map((item: any)=>{
      delete item.schemeId;
      return item;
    })
    console.log("value of currentDataClean: ", currentDataClean);
    axios.put<SchemeResolution[]>('http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer='+data.publicViewKey, currentDataClean)
    .then(resolve=>{
      //Can only retrieve a limited number here, why is that the case?
      console.log("++++++++++++++++++++++++++++++++++");
      returnData = resolve.data;
      console.log("value of returnData: ", returnData);
      let rootArray: {[key: string]: any}[] = []  ;
      resolve.data.forEach(item=>{
        console.log("value of item: ", item);
        console.log("value of item.isRoot: ", item.isRoot);
        if(isRoot && item.attributeName!="password" && item.attributeName!="username"){
          let tempItem =   
            { 
              schemeId: item.schemeId,
              attributeName: item.attributeName,
              schemeName: item.schemeName,
              alias: item.alias, 
              description: item.description, 
              isActive: item.isActive, 
              isRoot: isRoot
            }
          rootArray.push(tempItem);
        }
      })
      data.rootAttributesSelected = rootArray;
      this.setState({data}, ()=>{
        console.log("value of data.rootAttributesSelected after setting putAttributesValues: ", data.rootAttributesSelected );
      });
      console.log("++++++++++++++++++++++++++++++++++");
    })
    .catch(error=>{
      console.log("value of error: ", error);
    })
  }

  getAttributesValues = async() => { 
    let data = this.state.data;
    let returnData: SchemeResolution[];
    console.log("value of data.publicViewKey: ", data.publicViewKey);
    await axios.get<SchemeResolution[]>("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+data.publicViewKey+"&activeOnly=true")
    .then(resolve=>{
      returnData = resolve.data;
    })  
    .catch(error=>{
      console.log('value of error: IN ASSOCIATEDATTRIBUTESLIST', error);
    })
    console.log("value of returnData in func: ", returnData);
    return returnData;
  }


  loginAccount = async() => {
    let data = this.state.data;
    data.loginRegisterErrorMessage = "";
    if(data.username==""||data.password==""){
      data.loginRegisterErrorMessage = "neither username nor password may be blank";
      this.setState({data});
    }else{
      axios.get<UserAccounts[]>("http://localhost:5003/api/accounts?ofTypeOnly=3")
      .then(resolve=>{
        let accountId = "";
        let accountIdNumber = 0;
        resolve.data.forEach(account=>{
          console.log("value of account: ", account);
          if(account.accountInfo==data.username){
            accountId = account.accountId.toString();
            accountIdNumber = account.accountId;
          }
        })
        console.log("value of accountIdNumber: ", accountIdNumber);
        console.log("value of data.password: ", data.password);
        axios.post<Authenticate>('http://localhost:5003/api/accounts/authenticate', 
        {
          accountId: accountIdNumber, 
          password: data.password
        })
        .then(resolve=>{
          let data = this.state.data;
          data.accountId = accountId;
          data.publicSpendKey = resolve.data.publicSpendKey
          data.publicViewKey = resolve.data.publicViewKey;
          data.loginRegisterErrorMessage = "user successfully logged in";
          data.loggedIn = true;
          this.setState({data});
          this.addToGroup();
        })
        .catch(error=>{
          console.log("value of error: ", error);
          let data = this.state.data;
          data.loginRegisterErrorMessage = "username or message is invalid";
          this.setState({data});
        })
      })
      .catch(error=>{
        console.log("there was an error: ", error); 
      })
    }
  }

  addRootAttributeButton = () => {
    if(this.state.data.loggedIn==true){
      return(
        <div>
          <div
            style={{
              color: 'white', 
              textAlign: 'center'
            }}
          >
            <p>
              Click the button below to add a root attribute to the account
            </p>
          </div>
          <div
            className="button"
            style={{
              marginLeft: '20%', 
              marginRight: '20%', 
              width: '60%', 
              marginTop: '2.5vh'
            }}
            onClick={()=>{
              this.toggleAttributeModal();
            }}
          >
            Add Root Attribute
          </div>
          <div
            style={{
              color: 'white', 
              textAlign: 'center'
            }}
          >
            <p>
              Here is the list of currently added root attributes. Click each to add it's associative properties.
            </p>
          </div>
        </div>
      );
    }else{
      return <div/>;
    }
  }

  //currently cannot register
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
            accountType: 3, //user
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
              axios.post<Authenticate>("http://localhost:5003/api/accounts/authenticate",{
                accountId, 
                password: data.password
              })
              .then(resolve=>{
                data.loginRegisterErrorMessage = "user has been registered and logged in";
                data.loggedIn = true;
                data.accountId = accountId.toString();
                data.publicSpendKey = resolve.data.publicSpendKey;
                data.publicViewKey = resolve.data.publicViewKey;
                this.setState({data});
                this.addToGroup();
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
          data.loggedIn = false;
          data.loginRegisterErrorMessage = "username already exists, please choose another";
          this.setState({data});
        }
      })
      .catch(error=>{
        console.log("there was an error retrieving accounts: ", error);
      });
    }
  } 

 

  associatedAttributesList = () => {
    let data = this.state.data;
    let associatedAttributes = data.associateAttributesTest;
    let rootAttributesSelected = data.rootAttributesSelected;
    let activeRoot = data.activeRoot;
    let associatedDisplay = data.associateAttributesTest.map(item=>{
      console.log("value of item.roots: ", item.roots);
      console.log("value of activeRoot: ", activeRoot);
      console.log("value of item.roots.includes(activeRoot): ", item.roots.includes(activeRoot));
      if(item.roots.includes(activeRoot.name)){
        console.log("here is an item in associatedAttributesList that should be included: ", item.roots);
        return(
          <div
            style={{
              marginTop: '20px'
            }}
          >
            <div
              style={{
                display: 'flex', 
                flexDirection: 'row'
              }}
            >
              <div
                style={{
                  flex: 1
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  flex: 1
                }}
              >
                <input
                  className="input"
                />
              </div>
            </div>
          </div>
        )
      }else{
        return(<div/>);
      }
    })
    return(
      <>
        {associatedDisplay}
      </>
    );
  }

  rootAttributeList = () => {
    let data = this.state.data;
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    console.log("++++ inside rootAttributeList and value of data: ", data);
    console.log("++++ value of rootAttributesSelected: ", data.rootAttributesSelected);
    let rootAttributesList = data.rootAttributesSelected.map((attribute, key)=>{
      console.log("++++ value of attribute: ", attribute.description);
      if(attribute.description!=undefined){
        return(
          <>
            <div
              key={key}
              style={{
                display: 'inline-block',
                marginTop: '5px',
                marginBottom: '5px',
                color: data.activeRoot!=undefined?(data.activeRoot.name==attribute.attributeName&&data.activeRoot.index==key?"green":"white"):"white"
              }}
              className="button"
              onClick={()=>{
                let data=this.state.data;
                console.log("++++ value of attribute onclick: ", attribute)
                data.activeRoot = {
                  name: attribute.attributeName, 
                  index: key
                };
                this.setState({data}, ()=>{
                  console.log("++++ value of this.state.data.activeRoot: ", this.state.data.activeRoot);
                });
              }}
            >
              {attribute.description}
            </div>
            <br/>
          </>
        );
      }  
    })
    return(
      <div
        style={{
          textAlign: 'center'
        }}
      >
        {rootAttributesList}
      </div>
    )
  }

  // requestUserAttributes = () => {
  //   let data = this.state.data;
  //   if(data.loggedIn){
  //     axios.get("http://localhost:5003/api/User/UserAttributes?accountId="+data.accountId)
  //     .then(resolve=>{
  //       console.log('value of resolve: ', resolve);
  //     })
  //     .catch(error=>{
  //       console.log('value of error: ', error);
  //     })
  //   }
  // } 

  userNamePassword = () => {
    let data = this.state.data;
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
              data.accountId = null;
              data.username = "";
              data.password = "";
              data.pulledIdentity = false;
              data.publicViewKey = "";
              data.providerSelectedName = ""
              data.identityAccounts = [];
              this.setState({data});
            }}
          >
            Log Out
          </div>
        );
      }
    }

    const registerButtonHandler = () => {
      if(this.state.data.loggedIn){
        return(
          <div/>
        )
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
              this.registerAccount();
            }}
          >
              Register Account
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
        {registerButtonHandler()}
        {loginLogOutButton()}
      </>
    );
  }

  // POST /api/User/AttributesIssuance?accountId=<number, user accountId>
  // {
  //   "issuer": 32-chars hex-string, issuer's public key,
  //   "masterRootAttributeId": numeric, optional,
  //   "attributeValues": [
  //     "<attributeName>": string,
  //     ...
  //     "<attributeName>": string,
  //   ]
  // }

  schematicList = () => {
    let data = this.state.data;
    const sendData = () => {
      let packageObj = {};
      let attributeValues: {[key: string]: any};
      data.inputSchematics.forEach((attribute, key)=>{
        if(attribute.attributeName!="Password"){
          let attributeObj = {
            [attribute.attributeName]: attribute.input.toString()
          }
          attributeValues = {...attributeValues, ...attributeObj}
        }
      })
      if(data.masterRootSelected==-1){
        packageObj = {
          issuer: data.issuerPublicKey, 
          attributeValues
        }
      }else{
        packageObj = {
          issuer: data.issuerPublicKey, 
          attributeValues, 
          masterRootAttributeId: data.masterRootSelected
        }
      }
      console.log("value of packageObj: ", packageObj);
      axios.post("http://localhost:5003/api/User/AttributesIssuance?accountId="+data.accountId.toString(), packageObj)
      .then(resolve=>{
        console.log('value of resolve: ', resolve);
      })
      .catch(error=>{
        console.log("value of error: ", error);
      })
    }

    if(data.inputSchematics.length>0){

      const checkRoot=(type: string, key: number)=>{
        if(type=='root'){
          return(
            <div>
              Root Attribute
            </div>
          )
        }else{
          return(
            <div>
              Associated Attribute
            </div>
          )
        }
      }

      let schematicList = data.inputSchematics.map((schematic, key)=>{
        if(schematic.attributeName!="Password"){
          return(
            <div
              key={key}
              style={{
                color: 'white', 
                marginTop: '5px', 
                marginBottom: '5px'
              }}
            >
              {checkRoot(schematic.type, key)}
              <div
                style={{
                  color: 'white'
                }}
              > 
                Attribute Name - {schematic.attributeName}
              </div>
              <div>
                <div
                  style={{
                    display: 'flex', 
                    flexDirection: 'row'
                  }}
                >
                  <div
                    style={{
                      flex: 1, 
                      color: "white"
                    }}
                  >
                    Alias - {schematic.alias}
                  </div>
                  <div
                    style={{
                      flex: 1
                    }}
                  >
                    <input
                      className='input'
                      onChange={(e)=>{
                        data.inputSchematics[key].input = e.target.value;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })
      return(
        <div
          style={{
            textAlign: 'center'
          }}
        >
          <div
            style={{
              textDecoration: 'underline', 
              marginTop: '5px', 
              marginBottom: '5px', 
              color: 'white', 
              fontSize: '1.5rem'
            }}
          >
            {this.state.data.providerSelectedName}
          </div>
          {schematicList}
          <div
            className='button'
            style={{
              marginTop: '10px', 
              textAlign: 'center'
            }}
            onClick={()=>{
              sendData();
            }}
          >
            Send Data
          </div>
        </div>
      );
    }else{
      return(
        <div/>
      );
    }
  }

  retrieveAttributesFromIdentity = (key: number) => {
    let data = this.state.data;
    axios.get<Schematics>("http://localhost:5003/api/IdentityProvider/AttributesScheme?accountId="+key)
    .then(resolve=>{
      console.log("value of resolve: ", resolve.data);
      if(resolve.data.rootAttribute!=undefined){
        data.inputSchematics.push({
          type: "root",
          attributeName: resolve.data.rootAttribute.attributeName, 
          alias: resolve.data.rootAttribute.alias, 
          input: ""
        })
      }
      if(resolve.data.associatedAttributes!=undefined){
        resolve.data.associatedAttributes.forEach(attribute=>{
          data.inputSchematics.push({
            type: "associated",
            attributeName: attribute.attributeName,
            alias: attribute.alias, 
            input: ""
          })
        });
      }
      this.setState({data});
    })
    .catch(error=>{
      console.log("value of error: ", error);
    })
  }

  masterIDList = () => {
    let data = this.state.data;

    if(data.identityAccounts!=[]){
      let idlist = data.identityAccounts.map((item, key)=>{
        if(item.accountInfo!=data.providerSelectedName){
          return(
            <div
              key={key}
              className="button"
              style={{
                background: this.state.data.masterRootSelected==item.accountId?"green":"", 
                marginBottom: '5px'
              }}  
              onClick={()=>{
                let data = this.state.data;
                if(data.masterRootSelected==-1){
                  data.masterRootSelected = item.accountId
                }else{
                  data.masterRootSelected = -1
                }
                this.setState({data})
              }}
            >
              {item.accountInfo}
            </div>
          );
        }
      })
  
      if(data.providerSelectedName!=""){
        return(
          <div
            style={{
              marginTop: '5px', 
              marginBottom: '5px', 
              background: 'blue', 
              textAlign: 'center'
            }}
          >
            <div
              style={{
                color: 'white'
              }}
            >
              (Optional) Select a Master Root Attribute ID
            </div>
            {idlist}
          </div>
        )
      }else{
        return(
          <div></div>
        )
      }
    }
  }

  availableIdentityProviders = () => {
    let data = this.state.data;
    // console.log("**** in availableIdentityProviders and data: ", this.state.data);
    if(data.loggedIn && data.identityAccounts.length==0 && !data.pulledIdentity){
      axios.get<IdentityAccounts[]>("http://localhost:5003/api/accounts?ofTypeOnly=1")
      .then(resolve=>{
        console.log("**** value of resolve: ", resolve.data);
        data.identityAccounts = resolve.data;
        data.pulledIdentity = true;
        this.setState({data}, ()=>{
          console.log("**** value of identityaccounts: ", this.state.data.identityAccounts);
        });
      })
      .catch(error=>{
        console.log("value of error: ", error);
      })
    }
    if(data.identityAccounts.length>0){
      console.log("inside data.identityAccounts.length>0")
      let identityList = data.identityAccounts.map((account, key)=>{
        return(
          <div>
            <div
              key={key}
              className="button"
              style={{
                marginTop: '5px'
              }}
              onClick={async()=>{
                let data = this.state.data;
                data.inputSchematics = [];
                await this.setState({data});
                console.log("value of account and publicKey: ", account)
                data.issuerPublicKey = account.publicSpendKey;
                data.providerSelectedName = account.accountInfo;
                this.retrieveAttributesFromIdentity(account.accountId);
              }}
            >
              {account.accountInfo}
            </div>
            <br/>
          </div>
        );
      })
      return(
        <div
          style={{
            textAlign: 'center', 
            background: 'blue',
            maxHeight: '50vh', 
            overflow: 'auto', 
            marginTop: '5px', 
            paddingTop: '5px', 
            paddingBottom: '5px'
          }}
        >
          <div
            style={{
              marginBottom: "5px",
              marginTop: '5px', 
              color: "white"
            }}
          >
            Here is the list of available identity providers
          </div>
          {identityList}
        </div>
      ); 
    }
  }

  render(){
    return(
      <>
        <div
          className="leftpanel"
          style={{
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute', 
              zIndex: 1, 
              height: '100%', 
              width: "100%"
            }}
          >
            {this.userNamePassword()}
            {/* {this.requestUserAttributes()} */}
            {this.availableIdentityProviders()}
            {/* {this.addRootAttributeButton()}
            {this.rootAttributeList()} */}
          </div>
            {/* {this.AddAttributeModal()} */}
        </div>
        <div
          className="pages"
        > 
          {this.schematicList()}
          {this.masterIDList()}
        </div>
      </>
    );
  }
} 

export default User3;