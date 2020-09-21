import React, {Component} from 'react';
import '../css/main.css';
import axios from 'axios';
import { timeStamp } from 'console';

class DataClass {
  private _username: string = "";
  private _password: string = "";
  private _rootIdentityState: number = 0;
  private _rootIdentities: string[] = [
    "Transportation Department", 
    "Ministry of Interior",
    "Health Department"
  ]//test for now, will change with api call
  private _rootIdentitySelected: string = ""
  private _rootServices: string[] = [
    "Service 1", 
    "Service 2",
    "Service 3"
  ]//test for now, will change with api call

  public set rootIdentitySelected(value: string){
    this._rootIdentitySelected = value;
  }

  public get rootIdentitySelected(): string{
    return this._rootIdentitySelected;
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

  public set rootIdentityState(value: number) {
    this._rootIdentityState = value;
  }

  public get rootIdentityState(): number{
    return this._rootIdentityState
  }

  public set rootIdentities(value: string[]) {
    this._rootIdentities = value;
  }

  public get rootIdentities(): string[]{
    return this._rootIdentities
  }
  
  public set rootServices(value: string[]) {
    this._rootServices = value;
  }

  public get rootServices(): string[]{
    return this._rootServices
  }

}

interface MyProps {

};
interface MyState {
  data: DataClass
};

class User1 extends Component<MyProps, MyState>{
  constructor(props: MyProps){
    super(props);
    this.state = {
      data: new DataClass()
    }
  }

  orderRootIdentityHandler = () => {
    let data = this.state.data;
    //this will be api call to backend
    //call to the backend api and await a response and then set data
    //before setting state on the rootIdentityState.
    data.rootIdentityState = 1;
    this.setState({data});
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

  rootIdentityInitial = () => {
    let data = this.state.data;
    if(data.rootIdentityState == 0){
      return(
        <div
          style={{
            color: 'white', 
            margin: '20px', 
            fontSize: '1rem', 
            width: "80%"
          }}
        >
          <p>
            This page is for the ordering of a root identity by a user. 
            Our records currently indicate that you do not have a root identity. 
            Click on "Order Root Identity" in order to initiate the ordering of a root identity which will be sent and authorized by an approved root identity provider.
          </p>
        </div>
      );
    }else{
      return <div/>
    }
  }

  rootIdentitiesArray = () => {

  }

  rootIdentitySelect = () => {
    let data = this.state.data;
    let rootIdenties = data.rootIdentities.map((identity)=>{
      return(
      <div
        style={{
          marginTop: '20px', 
          marginBottom: '20px'
        }}
      >
        <div className="button"
          onClick={(e)=>{
            let data = this.state.data;
            data.rootIdentitySelected = identity.toString();
            this.setState({data})
          }}
          style={{
            "background": this.state.data.rootIdentitySelected==identity?"green":"black"
          }}
        >
          {identity}
        </div>
      </div>
      );
    }) 
    if(data.rootIdentityState == 1){
      return(
        <div
          style={{
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              color: 'white'
            }}
          >
            Select the provider of the root identity
          </h2>
          <div>
            {rootIdenties}
          </div>
          <br/><br/>
          {this.userNamePassword()}
          <div
            className="button"
            onClick={()=>{
              this.registerHandler();
            }}
          >
            Register to Access Services.
          </div>
        </div>
      );
    }else{
      return <div/>
    }
  }

  rootIdentityForm = () => {
    let data = this.state.data;
    if(data.rootIdentityState == 2){
      return(
        <div></div>
      );
    }else{
      return <div/>
    }
  }

  rootIdentityServices = () => {
    let data = this.state.data;
    if(data.rootIdentityState == 3){
      return(
        <div>
        
        </div>
      );
    }else{
      return(<div></div>);
    }
  }

  registerHandler = () => {
    //make api call to backend to call available services 
    //set services in state as options and then set the state of 
    //rootIdentityState to 3) rootIdentityServices

    //must also register with what root identity the user is registered with
    //where is this in the api?

    let data = this.state.data;
    axios.post("http://localhost:5003/api/accounts/register", {
      accountType: 3,
      accountInfo: data.username,
      password: data.password,
    })
    .then((resolve)=>{
      console.log("the user has been registered: ", resolve);
      data.rootIdentityState = 3;
      this.setState({data});
    })
    .catch((error)=>{
      console.log("there was an error registering the user: ", error);
    })
  }

  loginHandler = () => {
    //how is log in handled for a previously registered account?
  }

  initialLogin= () => {
    console.log("value of this.state.data.rootIdentityState: ", this.state.data.rootIdentityState);
    console.log("is equal to 0: ", this.state.data.rootIdentityState == 0);
    if(this.state.data.rootIdentityState==0){
      return(
        <>        
          <div
            style={{
              margin: '20px', 
              color: 'white'
            }}
          >
            If you have previously created a Root Identity please log in to retrieve it. This will allow you to access services provided by all service providers that your identity provider has authorized. 
          </div>
          {this.userNamePassword()}
          <div
            className="button"
            onClick={()=>{
              this.loginHandler();
            }}
          >
            Log-In to Access Services.
          </div>
        </>
      );
    }else{
      return(<div/>);
    }
  }

  render(){
    return(
      <>
        <div className="leftpanel"
          style={{
            textAlign: "center", 
            width: "100%"
          }}
        >
          <div
            style={{
              margin: '20px', 
              color: 'white'
            }}
          >
            If you are a new user please order a New Root Identity. This will allow you to create a certificate with a number of different service providers. After root identity creation you will be able to use the root identity to access services offered by your root identity provider.
          </div>
          <div
            className="button"
            onClick={()=>{
              this.orderRootIdentityHandler();
            }}
          >
            Order Root Identity
          </div>
          {this.initialLogin()}
        </div>
        <div className="pages">
          {this.rootIdentityInitial()}        
          {this.rootIdentityForm()}
          {this.rootIdentitySelect()}  
          {this.rootIdentityServices()}  
        </div>  
      </>
    );
  }
}

export default User1;