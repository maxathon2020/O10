import React, {Component} from 'react';
import '../css/main.css';


class DataClass {

  private _username: string = "";
  private _password: string = "";
  private _selectedService: string = "";
  private _selectedIdentity: string = "";
  [key: string]: any

  // private _fillableFields: {[key: string]: string}[] = [
  //   {
  //     _serviceFieldName: "default", 
  //     _serviceFieldValue: "default"     
  //   }
  // ]

  private _serviceFields: {[key: string]: string}[] = [
    {
      _serviceFieldName: "default", 
      _serviceFieldValue: "default"     
    }
  ]

  private _services: object[] = [
    {
      _serviceName: "default", 
      _serviceFields: this._serviceFields
    }
  ]

  private _providers: string[];

  public constructor(){
    this._providers = ["provider1", "provider2"];
    this._serviceFields =  [
      {
        fieldName: "fieldName1", 
        fieldValue: "fieldValue1"
      },
      {
        fieldName: "fieldName1", 
        fieldValue: "fieldValue1"
      }
    ];
    this._services = [
      {
        serviceName: "service1",
        serviceFields: [
          {
            fieldName: "fieldName1", 
            fieldValue: "fieldValue1"
          }, 
          {
            fieldName: "fieldName2", 
            fieldValue: "fieldValue2"
          }
        ],
      },
      {
        serviceName: "service2",
        serviceFields: [
          {
            fieldName: "fieldName3", 
            fieldValue: "fieldValue3"
          }, 
          {
            fieldName: "fieldName4", 
            fieldValue: "fieldValue4"
          }
        ],
      }
    ]
    this._selectedService = "service1"
    this._selectedIdentity = "provider1"
  }

  public get serviceFields(): {[key: string]: string}[]{
    return this._serviceFields;
  }

  public set serviceFields(value: {[key: string]: string}[]){
    this._serviceFields = value;
  } 

  public get providers(): string[]{
    return this._providers;
  }

  public set providers(value: string[]){
    this._providers = value;
  } 

  public get selectedService(): string{
    return this._selectedService;
  }

  public set selectedService(value: string){
    this._selectedService = value;
  }
  
  public get selectedIdentity(): string{
    return this._selectedIdentity;
  }

  public set selectedIdentity(value: string){
    this._selectedIdentity = value;
  }

  public get services(): object[]{
    return this._services;
  }

  public set services(value: object[]){
    this._services = value;
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
  data: DataClass;
};

// function getProperty<T, K extends keyof T>(obj: T, key: K) {
//   return obj[key]; // Inferred type is T[K]
// }

// function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
//   obj[key] = value;
// }


class User2 extends Component<MyProps, MyState>{
  constructor(props: MyProps){
    super(props);
    this.state = {
      data: new DataClass()
    }
  }


  componentWillMount(){
    console.log("inside componentWillMount and value of this.state.data: ", this.state.data);
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

  selectIdentity = () => {
    let data = this.state.data;
    let options = data.providers.map((providers, key)=>{
      return(
        <option 
          key={key}
          value={providers}
        >
          {providers}
        </option>
      );
    });
    return(
      <select
        style={{
          width: '80%', 
          marginLeft: '10%', 
          marginRight: '10%', 
          padding: '5px'
        }}
        onChange={(e)=>{
          let data = this.state.data;
          data.selectedIdentity = e.target.value;
          this.setState({data}, ()=>{
            console.log("value of data after select: ", data);
          });
        }}
        value={this.state.data.selectedIdentity}
      >
        {options}
      </select>
    );  
  }

  selectService = () => {
    let data = this.state.data;
    let options = data.services.map((services, key)=>{   
      let serviceName: string;
      for (const [key, value] of Object.entries(services)) {
        console.log("value of key, value: ", key, value);
        if(key=='serviceName'){
          serviceName = value;
          break;
        }
      }
      return(
        <option 
          key={key}
          value={serviceName}
        >
          {serviceName}
        </option>
      );
    });
    return(
      <select
      style={{
        width: '80%', 
        marginLeft: '10%', 
        marginRight: '10%', 
        padding: '5px'
      }}
      onChange={(e)=>{
        let data = this.state.data;
        data.selectedService = e.target.value;
        // data.serviceFields = 
        this.setState({data}, ()=>{
          console.log("value of data after select: ", data);
        });
      }}
      value={this.state.data.selectedService}
      >
        {options}
      </select>
    );
  }

  showServiceFields = () => {
    let data = this.state.data;
    let fillableFields = data.serviceFields.map((field:any, key)=>{
      let data = this.state.data;
      let fieldName = data.serviceFields[key]['fieldName'];
      let fieldValue = data.serviceFields[key]['fieldValue'];
      console.log("value of fieldName: ", fieldName);
      console.log("value of fieldValue: ", fieldValue);
      return(
        <div
          style={{
            padding: '20px'
          }}
        >
          <div
            style={{
              color: 'white', 
              marginBottom: '5px',
              marginTop: '5px'
            }}
          >
            {fieldName}
          </div>
          <input className='input'
            value={fieldValue}
            placeholder={fieldValue.toString()}
            onChange={(e)=>{
              let data = this.state.data;
              data.serviceFields[key]['fieldValue'] = e.target.value;
              this.setState({data});
            }}
          />
        </div>
      );
    })
    return(
      <div>
        {fillableFields}
      </div>
    )
  }

  loginHandler = () => {

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
              color: 'white', 
              padding: '20px'
            }}
          >
            <h3>
              Select Identity Provider and Provide a Username and Password. 
            </h3>
          </div>
          <div>
            {this.selectIdentity()}
            {this.userNamePassword()}
            <div
              className='button'
              onClick={()=>{
                this.loginHandler();
              }}
            >
              Log-In to Identity Provider
            </div>
          </div>
        </div>
        <div
          className="pages"
          style={{
            textAlign: 'center'
          }}
        >
          <div
            style={{
              color: 'white', 
              padding: '20px'
            }}
          >
            <h3>
              After Logging into Identity Provider Select the Appropriate Service Provider and Fill in the Information.
            </h3>
          </div>
          {this.selectService()}
          {this.showServiceFields()}
          <div
            className='button'
            style={{
              marginLeft: '20%',
              width: '60%',
              marginRight: '20%'
            }}
            onClick={()=>{
              this.loginHandler();
            }}
          >
            Submit 
          </div>
        </div>
      </>
    );
  }
}

export default User2;