import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { timeStamp } from 'console';


class DataClass {
  private _username: string = "";
  private _password: string = "";
  private _attributeModalOpen: boolean = false;
  private _loggedIn: boolean = false;
  private _loginRegisterErrorMessage = "";
  private _addMultipleErrorMessage = "";
  private _activeRoot: {[key: string]: any}=[
    {
      name: "null",
      index: 0
    }
  ];
  private _publicViewKey: string;

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

interface SchemeResolution{
  schemeId: number,
  attributeName: string,
  schemeName: string,
  alias: string, 
  description: string, 
  isActive: boolean, 
  isRoot: boolean
}

interface MyProps {

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


  //currently cannot register a user so login is on hold
  //currently have no way to check passwords from the database; so all passwords work.
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
              let publicViewKey = resolve.data.publicViewKey
              axios.put("http://localhost:5003/api/SchemeResolution/AttributeDefinitions?issuer="+publicViewKey, username_password_data)
              .then(resolve=>{
                console.log('value of resolve of register /api/SchemeResolution/AttributeDefinitions?issuer=:', resolve);
                data.publicViewKey = publicViewKey;
                this.setState({data}, ()=>{
                  console.log("after setting publicViewKey and value is: ", data.publicViewKey);
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
              data.username = "";
              data.password = "";
              data.publicViewKey = "";
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
          {loginLogOutButton()}
      </>
    );
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
            {this.addRootAttributeButton()}
            {this.rootAttributeList()}
          </div>
            {this.AddAttributeModal()}
        </div>
        <div
          className="pages"
        > 
          {this.associatedAttributesList()}
        </div>
      </>
    );
  }
}

export default User3;