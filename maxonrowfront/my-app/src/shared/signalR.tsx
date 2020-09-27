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

    this.hubConnection.on("PushRegistration", (i) => {
			this.registrations.push(i);
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

  private AddToGroup(){
    this.hubConnection.invoke("AddToGroup", this.accountId)
  }

}