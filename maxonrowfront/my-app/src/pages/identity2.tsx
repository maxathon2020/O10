import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { timeStamp } from 'console';

class DataClass{
  private _loginRegisterErrorMessage = "";
  
  public set loginRegisterErrorMessage(value: string){
    this._loginRegisterErrorMessage = value;
  }

  public get loginRegisterErrorMessage(): string{
    return this._loginRegisterErrorMessage;
  }
  private _username: string = "";
  private _password: string = "";

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


}

interface MyProps {

};
interface MyState {
  data: DataClass;
};

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

class Identity2 extends Component<MyProps, MyState>{

  constructor(props: MyProps){
    super(props);
    this.state = {
      data: new DataClass()
    }
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
        ></div>
      </>
    )
  }
}

export default Identity2;