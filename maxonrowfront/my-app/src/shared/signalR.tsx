import * as signalR from '@microsoft/signalr';

export default class SignalRClass{

  private hubConnection: signalR.HubConnection;
  private _accountId: string;
  private _registrations: {[key: string]:any}[]
  private _spAttributes: {[key: string]:any}[]

  public get spAttributes(): {[key: string]:any}[]{
    return this._spAttributes;
  }

  public set spAttributes(value: {[key:string]:any}[]){
    this._spAttributes = value;
  }

  public get registrations(): {[key: string]:any}[]{
    return this._registrations;
  }

  public set registrations(value: {[key:string]:any}[]){
    this._registrations = value;
  }

  public get accountId(): string{
    return this._accountId;
  }

  public set accountId(value: string){
    this._accountId = value;
  }

  public initializeHub(){ 
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5003/identitiesHub")
    .configureLogging(signalR.LogLevel.Information)
    .build();
    const start = async() => {
      try {
        await this.hubConnection.start();
        console.log("SignalR Connected.");
      } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
      }
    };
    this.hubConnection.onclose(start);
    // Start the connection.
    start();

    this.hubConnection.on("RequestForIssuance", (i) => {
      console.info("RequestForIssuance");
			console.info(i);
		});
		this.hubConnection.on("PushAttribute", (i) => {
			this.spAttributes.push(i);
    });
    
		// this.hubConnection.on("PushEmployeeUpdate", (i) => {
		// 	for (let employee of this.employees) {
		// 		if (employee.assetId === i.assetId) {
		// 			employee.registrationCommitment = i.registrationCommitment;
		// 		}
		// 	}
		// });
  
  }

  public AddToGroup(){
    console.log("inside AddToGroup(" + this.accountId + ")");
    this.hubConnection
       .invoke("AddToGroup", this.accountId)
       .then(r => {},e => {console.error(e)});
  }

  public RequestForIssuance(){
    let packageObjTest = {
      rootAttribute: {
        attributeName: "test", 
        originatingCommitment:"5f3ae2b02affea74c2ee6e6d53a2d6ded319c9905dea7f0b4bb9273819c76b65", 
        assetCommitment: "4e2c16a6499dafab98da9e5a2c3d7ff418aead18fec0e074e61f1cdfa2c84a9c", 
        surjectionProof: "c3d631ca7bb6cdeaa9e167043367ab8e3c7dd792c2959b1dba46f61fa2c583161983d919802416140eebf9306a8f4a30bd417aff47b0ffe58630382ebc970c159a6051d8608d39f37cd97172c40544c8115a581964f34f42942138f62f0948b9"
      }, 
      associatedAttributes: [
        {
          attributeName: "test", 
          assetCommitment: "204b9505556c687e3d8a491d1850054ac848896303fafaf18af2d3e933f97d88", 
          bindingToRootCommitment: "b4bbe17841ria25c144209eda794599eb632491842d5afb7f0eabcd9cd0bcecc8"
        }
      ]
    }
    this.hubConnection.invoke("RequestForIssuance", packageObjTest);
  }

}