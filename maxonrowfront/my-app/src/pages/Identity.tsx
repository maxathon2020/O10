import React, {Component} from 'react';
import axios from 'axios';


class DataClass {
  private _username: string = "";
  private _password: string = "";
  private _rootIdentityState: number = 0;
  private _rootFieldNames: string[] = [];
  private _rootIdentities: string[] = [
    "Transportation Department", 
    "Ministry of Interior",
    "Health Department"
  ]//test for now, will change with api call
  private _registrationFields: string[] = [];
  private _rootIdentitySelected: string = ""

  public set rootFieldNames(value: string[]){
    this._rootFieldNames = value;
  }

  public get rootFieldNames(): string[]{
    return this._rootFieldNames;
  }

  public set rootIdentitySelected(value: string){
    this._rootIdentitySelected = value;
  }

  public get rootIdentitySelected(): string{
    return this._rootIdentitySelected;
  }

  public set rootIdentities(value: string[]) {
    this._rootIdentities = value;
  }

  public get rootIdentities(): string[]{
    return this._rootIdentities
  }

  public set registrationFields(value: string[]){
    this._registrationFields = value;
  }

  public get registrationFields(): string[]{
    return this._registrationFields;
  }
  
  public set rootIdentityState(value: number) {
    this._rootIdentityState = value;
  }

  public get rootIdentityState(): number{
    return this._rootIdentityState
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
}

interface MyProps {

};
interface MyState {
  data: DataClass
}


class Identity extends Component<MyProps, MyState>{
  constructor(props: MyProps){
    super(props);
      this.state = {
          data: new DataClass()
      }
    }

    rootIdentitySelect = () => {
        let data = this.state.data;
        let rootIdentities = data.rootIdentities.map((identity, key)=>{

            const showPassword = (showPass: Boolean) => {
                if(showPass){
                    return(
                        <>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <input
                                className="input"
                                style={{
                                    width: 'calc(100% - 35px)', 
                                }}
                            />
                        </div>
                        <div
                            style={{
                                flex: 1
                            }}
                        >
                            <div
                                className="button"
                                style={{
                                    width: 'calc(100% - 10px)'
                                }}
                            >
                                Confirm Password
                            </div>
                        </div>
                        </>
                    );
                }else{
                    return(
                        <>
                            <div
                                style={{
                                    flex: 2
                                }}
                            >
                            </div>
                        </>
                    );
                }
            }

            return(
                <div
                    key={key}
                    style={{
                        marginTop: '5px', 
                        marginBottom: '5px'
                    }}  
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row', 
                            width: '80%',
                            marginLeft: '10%'
                        }}
                    >
                        <div
                            className='button'
                            onClick={(e)=>{
                                let data = this.state.data;
                                data.rootIdentitySelected = identity.toString();
                                this.setState({data})
                            }}
                            style={{
                                flex: 1,
                                width: 'calc(100% - 10px)',
                                "background": this.state.data.rootIdentitySelected==identity?"green":"black"
                              }}
                        >
                            {identity}
                        </div>
                        {showPassword(this.state.data.rootIdentitySelected==identity.toString())}
                    </div>
                </div>
            )
        })
        return(
            <div>
                {rootIdentities}
            </div>
        )
    }

    loginHandler = () => {
      let data = this.state.data;
      data.rootIdentityState = 1;
      this.setState({data});
      axios.post("http://localhost:5003/api/accounts/register", {
        accountType: 2, 
        accountInfo: data.username, 
        password: data.password
      })
      .then(resolve=>{
        console.log("login request successful: and resolution: ", resolve);
        data.rootIdentityState = 1;
      })
      .catch((error)=>{
        console.log("there was some error: ", error);
      });
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

    addFieldHandler = () => {
        let data = this.state.data;
        let fields = data.rootFieldNames.map((name, key)=>{
            return(
                <div 
                    key={key}
                    style={{
                        display: 'flex', 
                        flexDirection: 'row', 
                        marginBottom: '5px'
                    }}
                >
                    <div style={{flex: 1}}/>
                    <div
                        style={{
                            flex: '1'
                        }}
                    >
                        <input
                            className='input'
                            placeholder={name}
                            value={name}
                            onChange={(e)=>{
                                let data = this.state.data;
                                data.rootFieldNames[key] = e.target.value;
                                this.setState({data});
                            }}
                        />
                    </div>
                    <div style={{flex: 1}}/>
                    <div
                        className="button"
                        style={{
                            flex: '1'
                        }}
                        onClick={()=>{
                            let data = this.state.data;
                            data.rootFieldNames.splice(key, 1);
                            this.setState({data});
                        }}
                    >
                        Delete Field
                    </div>
                    <div style={{flex: 1}}/>
                </div>
            );
        })
        return(
            <>
                <div>
                    {fields}
                </div>
                <div
                    className="button"
                    onClick={()=>{
                        let data = this.state.data;
                        data.rootFieldNames.push("");
                        this.setState({data});
                    }}
                    style={{
                        flex: 1
                    }}
                >
                    Add Field
                </div>
            </>
        );
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
              Authority Name
            </div>  
            <div
              style={{
                margin: '20px'
              }}
            >
              <input 
                className = 'input'
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
              Password
            </div>  
            <div
              style={{margin: '20px'}}
            >
              <input 
                className = 'input'
                value={this.state.data.password} onChange={e=>{
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
              Welcome to the Identity Provider Dashboard. If you would like to register a new identity please provide the necessary information below.
            </div>
            {this.addFieldHandler()}
            {this.userNamePassword()}
            <div
                className="button"
                onClick={()=>{
                    this.registerHandler();
                }}
            >
                Register Identity
            </div>
          </div>
          <div
            className="pages"
          >
            <div
                style={{
                    color: 'white',
                    padding: '20px'
                }}
            >
                If you would like to log in to an existing Identity Provider, please select from the provided list. You will be prompted for a password on selection.
            </div>
            {this.rootIdentitySelect()}
          </div>
        </>
      );
    }
}

export default Identity;