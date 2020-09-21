import React, {Component} from 'react';
import axios from 'axios';


class DataClass {
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
}

interface MyProps {

};
interface MyState {
  data: DataClass
}


class Service extends Component<MyProps, MyState>{
  constructor(props: MyProps){
    super(props);
      this.state = {
          data: new DataClass()
      }
    }


    loginHandler = () => {
      let data = this.state.data;
      axios.post("http://localhost:5003/api/accounts/register", {
        accountType: 2, 
        accountInfo: data.username, 
        password: data.password
      })
      .then(resolve=>{
        console.log("login request successful: and resolution: ", resolve);
      })
      .catch((error)=>{
        console.log("there was some error: ", error);
      });
    }

    registerHandler = () => {
      //how is login handled for previously registered account?
      //is there an option of linking a service to an identity provider? If so, does the identity provider have to approve this?
    }

    userNamePassword = () => {
      return(
        <>
          <div
            style={{
              margin: '20px', 
              color: 'white'
            }}
          >
            Username
          </div>  
          <div
            style={{
              margin: '20px'
            }}
          >
            <input value={this.state.data.username} onChange={e=>{
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
            Password
          </div>  
          <div
            style={{margin: '20px'}}
          >
            <input value={this.state.data.password} onChange={e=>{
              let data = this.state.data;
              data.password = e.target.value;
              this.setState({data});
            }}/>
          </div>
        </>
      );
    }

    render(){
      return(
        <>
          <div
            className="leftpanel"
            style={{
              textAlign: 'center'
            }}
          >
            <div
              style={{
                color: "white", 
                padding: '20px'
              }}
            >
              Welcome to the Service Provider Dashboard. If you would like to register a new service please provide the necessary information below.
            </div>
            {this.userNamePassword()}
          </div>
          <div
            className="pages"
          >
            <div
              style={{
                color: "white", 
                padding: '20px'
              }}
            >
              If you would like to log in to an existing Service Provider, please select from the provided list and enter a password.
            </div>
          </div>
        </>
      );
    }
}

export default Service;