import React, { Component } from 'react';
import axios from 'axios';

import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import * as signalR from '@microsoft/signalr';

import { Kyc, mxw, nonFungibleToken as token, utils } from 'mxw-sdk-js/dist/index';
import { sha256, toUtf8Bytes } from 'mxw-sdk-js/dist/utils';
import { sortObject } from 'mxw-sdk-js/dist/utils/misc';
import ProviderOrSignerRequest from '../shared/initialize';


class DataClass {
  private _username: string = "";
  private _password: string = "";

  private _defaultAccountId_1: number = 2;
  private _defaultAccountId_2: number = 3;

  private _accountId: string = "0";
  private _method: string = "POST";
  private _msg: string = ""

  private _loginId: number = 0;
  private _loginPass: string = "";

  listOfAllAccounts: any[] = [];

  newProofs: any[] = [];



  public set username(value: string) {
    this._username = value;
  }

  public get username(): string {
    return this._username;
  }

  public set password(value: string) {
    this._password = value;
  }

  public get password(): string {
    return this._password;
  }

  public set defaultAccountId_1(value: number) {
    this._defaultAccountId_1 = value;
  }

  public get pas_defaultAccountId_1(): number {
    return this._defaultAccountId_1;
  }

  public set defaultAccountId_2(value: number) {
    this._defaultAccountId_2 = value;
  }

  public get pas_defaultAccountId_2(): number {
    return this._defaultAccountId_2;
  }

  public set accountId(value: string) {
    this._accountId = value;
  }

  public get accountId(): string {
    return this._accountId;
  }

  public set method(value: string) {
    this._method = value;
  }

  public get method(): string {
    return this._method;
  }

  public set msg(value: string) {
    this._msg = value;
  }

  public get msg(): string {
    return this._msg;
  }

  public set loginId(value: number) {
    this._loginId = value;
  }

  public get loginId(): number {
    return this._loginId;
  }

  public set loginPass(value: string) {
    this._loginPass = value;
  }

  public get loginPass(): string {
    return this._loginPass;
  }


  //   public set listOfAllAccounts(value) {
  //   this._listOfAllAccounts = value;
  // }

  //   public get listOfAllAccounts() {
  //   return this._listOfAllAccounts;
  // }






}

interface MyProps {
  Wallets: ProviderOrSignerRequest,
};
interface MyState {
  data: DataClass
}


class Service extends Component<MyProps, MyState>{
  constructor(props: MyProps) {
    super(props);
    this.state = {
      data: new DataClass(),
    }
  }

  public _hubConnection: HubConnection;

  createWallet() {
    let randomWallet = mxw.Wallet.createRandom();
    console.log("randomWallet data:", randomWallet);
    console.log("Address:", randomWallet.address);
    return randomWallet.address
  }

  createWalletWithKYC() {
    let networkProvider = mxw.getDefaultProvider("localnet");
    var wallet = mxw.Wallet.createRandom().connect(networkProvider);
    Kyc.create(wallet).then((kycR) => {
      let seed = sha256(toUtf8Bytes(JSON.stringify(sortObject({
        juridical: ["", ""].sort(),
        seed: utils.getHash(utils.randomBytes(32))
      }))));

      let kycAddress = kycR.getKycAddress({
        country: "MY",
        idType: "NIC",
        id: wallet.address,
        idExpiry: 20200101,
        dob: 19800101,
        seed
      });

      console.log("KYC Address: " + kycAddress);
      //expected result:
      //kyc1ekv4s2e75vyzmjjnve3md9ek5zm3pt66949vclrttgkfrrc6squqlxlpsp

      return kycR.sign(kycAddress).then((data) => {
        console.log(JSON.stringify(data));
      });
      //expected result:
      //KYC Data, click on the link above for more information

    });
  }


  componentDidMount = () => {
    this.listOfRegisteredServiceProviders()
    this.AutoRegistration()


    // //testing wallet
    console.log("value of Wallets on ComponentDidMount: ", this.props.Wallets);
  }

  async hubConnection(accountId: string) {
    console.log("this :", accountId)
    this._hubConnection = new HubConnectionBuilder().withUrl("http://localhost:5003/identitiesHub").build();
    await this._hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while estabilishing connection with SignalR!'));

    this._hubConnection.invoke("AddToGroup", "'" + accountId + "'")
      .then(
        v => {
          console.log("AddToGroup succeeded");
          console.log(v);
        },
        e => {
          console.log("AddToGroup failed");
          console.log(e);
        });

    this._hubConnection.on('test', (response) => {
      console.log("message from SignalR test: ", response.message)
    })

    this._hubConnection.on('PushUserRegistration', (response) => {
      console.log("message from SignalR PushUserRegistration: ", response.message)
      let symbol = response.rootAttributeName + "@" + response.issuer
      let itemID = response.issuanceCommitments.itemId
      this.proofValidation(symbol, itemID)

      let details = {
        message: response.rootAttributeName,
        status: "Verified"
      }
      let data = this.state.data;
      data.newProofs.push(details)
      this.setState({ data });
    })

  }

  test() {
    let details = {
      message: "response.rootAttributeName",
      status: "Verified"
    }
    let data = this.state.data;
    data.newProofs.push(details)
    this.setState({ data });
  }

  proofValidation(symbol: string, itemID: mxw.Signer | mxw.providers.Provider,) {
    mxw.nonFungibleToken.NonFungibleToken.fromSymbol(symbol, itemID, this.props.Wallets).then((token) => {
      console.log(JSON.stringify(token))
      // var mintedNFTItem = nftItem;
      // console.log(mintedNFTItem.parent.state);
    });
  }

  listOfRegisteredServiceProviders() {
    axios.get("http://localhost:5003/api/accounts?ofTypeOnly=2")
      .then((resolve) => {
        console.log("Successfully collected all registered accounts: ", resolve);
        let data = this.state.data;
        data.listOfAllAccounts = resolve.data
        this.setState({ data });
        // this.userOptions()
      })
      .catch((error) => {
        console.log("Something went wrong in getting all accounts: ", error);
      })
  }

  async AutoRegistration() {
    let accounts: any = ['O10 Border Control', 'O10 Hotel']
    let defaultPassword = '1234'
    accounts.forEach(async (element: string) => {
      if (await this.findAccountIdByInfo(element) == false) {
        this.registerHandler(element, defaultPassword)
      }
    });
  }

  accountIdSetter(accountInfo: string, id: number) {
    if (accountInfo == 'O10 Border Control') {
      let data = this.state.data;
      data.defaultAccountId_1 = id
      this.setState({ data });
    } else if (accountInfo == 'O10 Hotel') {
      let data = this.state.data;
      data.defaultAccountId_2 = id
      this.setState({ data });
    }
  }


  async findAccountIdByInfo(accountInfo: string) {
    let accountExist: boolean = false
    await axios.get("http://localhost:5003/api/accounts?ofTypeOnly=2")
      .then((resolve) => {
        for (let i = 0; i <= resolve.data.length; i++) {
          let element = resolve.data[i]
          if (element.accountInfo === accountInfo) {
            this.accountIdSetter(accountInfo, element.accountId)
            accountExist = true
            break
          }
        }
      })
      .catch((error) => {
        console.log("Error in getting all accounts", error);
      })
    return accountExist
  }



  async loginHandler(accountInfo: any) {
    let defaultPassword = '1234'
    let id
    await axios.get("http://localhost:5003/api/accounts?ofTypeOnly=2")
      .then((resolve) => {
        for (let i = 0; i <= resolve.data.length; i++) {
          let element = resolve.data[i]
          if (element.accountInfo === accountInfo) {
            id = element.accountId
            break
          }
        }
      })
      .catch((error) => {
        console.log("Error in getting all accounts", error);
      })

    if (id == 0 || id == null) {
      return
    }

    await axios.post("http://localhost:5003/api/accounts/authenticate", {
      accountId: id,
      password: defaultPassword,
    })
      .then(resolve => {
        let data = this.state.data;
        data.accountId = resolve.data.accountId
        this.setState({ data });
        console.log("Login was successful")
      })
      .catch((error) => {
        console.log("there was some error: ", error);
      });
    console.log(this.state.data.accountId)
    this.hubConnection(this.state.data.accountId)
  }

  registerHandler = (accountInfo: string, password: string) => {
    let data = this.state.data;
    console.log(data.username, data.password)
    axios.post("http://localhost:5003/api/accounts/register", {
      accountType: 2,
      accountInfo: accountInfo,
      password: password,
    })
      .then((resolve) => {
        console.log("the user has been registered: ", resolve);
        this.listOfRegisteredServiceProviders()
      })
      .catch((error) => {
        console.log("there was an error registering the user: ", error);
      })
  }

  userNamePassword = () => {
    if (this.state.data.accountId == '0') {
      // return <> <div>Hello</div> </>
    } else {
      if (this.state.data.newProofs.length > 0) {
        return [
          <tbody>
            <tr style={{
              color: "white",
              padding: '20px'
            }}>
              <th>From</th>
              <th>Status</th>
            </tr>
            {this.state.data.newProofs.map((messsage) => {
              return [
                <tr style={{
                  color: "white",
                  padding: '20px'
                }}>
                  <td>
                    <div style={{
                      color: "white",
                      padding: '20px'
                    }}>
                      {messsage.message} </div>
                  </td>
                  <td>
                    <div style={{
                      color: "white",
                      padding: '20px'
                    }}>
                      {messsage.status}</div>
                  </td>
                </tr>
              ]
            })
            }
          </tbody>
        ]
      } else {
        return [
          <>
            <tbody>
              <tr style={{
                color: "white",
                padding: '20px'
              }}>
                <th>From</th>
                <th>Status</th>
              </tr>
              <tr>
                <div style={{
                  color: "white",
                  padding: '20px'
                }}>Waiting for message</div>
              </tr>
            </tbody>
          </>]
      }


    }
  }

  render() {
    return (
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
            If you would like to log in to an existing Service Provider, please select from the provided list.
            </div>
          {/* {this.userNamePassword()} */}
          <select value={this.state.data.accountId} onChange={e => this.loginHandler(e.target.value)}>
            <option value="0">Select a service provider</option>
            <option>O10 Border Control</option>
            <option>O10 Hotel</option>
          </select>
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
            {/* If you would like to log in to an existing Service Provider, please select from the provided list and enter a password. */}
          </div>

          {this.userNamePassword()}
          {/* <div
            className="button"
            onClick={() => {
               this.test();
            }}
          >
            Login
            </div> */}
        </div>
      </>
    );
  }
}

export default Service;