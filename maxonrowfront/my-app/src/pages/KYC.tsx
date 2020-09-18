import React, {Component} from 'react';
import ProviderOrSignerRequest from '../shared/initialize';
import '../css/main.css';
import { mxw } from 'mxw-sdk-js';
import KycData from "../kyc/data";
import KycProvider from "../kyc/provider";
import KycIssuer from "../kyc/issuer";
import KycValidator from "../kyc/validator";
import KycWhitelistor from "../kyc/whitelistor";

class DataClass{
    private _walletDefined: Boolean = false;
    private _numberWallets: number = 3;
    private _issuer: mxw.Wallet;
    private _provider: mxw.Wallet;
    private _middleware: mxw.Wallet;
    private _walletArray: mxw.Wallet[];
    private _walletAddressArray: string[];


    public set walletAddressArray(value: string[]) {
        this._walletAddressArray = value;
    }
    public get walletAddressArray(): string[] {
        return this._walletAddressArray;
    }

    public set issuer(value: mxw.Wallet) {
        this._issuer = value;
    }
    public get issuer(): mxw.Wallet {
        return this._issuer;
    }

    public set provider(value: mxw.Wallet) {
        this._provider = value;
    }
    public get provider(): mxw.Wallet {
        return this._provider;
    }

    public set middleware(value: mxw.Wallet) {
        this._middleware = value;
    }
    public get middleware(): mxw.Wallet {
        return this._middleware;
    }

    public set walletArray(value: mxw.Wallet[]) {
        this._walletArray = value;
    }
    public get walletArray(): mxw.Wallet[] {
        return this._walletArray;
    }

    public set numberWallets(value: number) {
        this._numberWallets = value;
    }
    public get numberWallets(): number {
        return this._numberWallets;
    }
    public set walletDefined(value: Boolean) {
        this._walletDefined = value;
    }
    public get walletDefined(): Boolean {
        return this._walletDefined;
    }
}

interface MyProps {
    Wallets: ProviderOrSignerRequest;
};

interface MyState {
    data: DataClass
}

class KYC extends Component<MyProps, MyState>{
    constructor(props: MyProps){
        super(props);
        this.state = {
            data: new DataClass()
        }
        if(this.props.Wallets!=undefined){
            let data = this.state.data;
            data.walletDefined = true;
            this.setState({data})
        }
    }

    componentDidUpdate(prevState:any, prevProps:any) {
        if(prevProps!=this.props && this.state.data.walletDefined == false){
            console.log("Value of props has changed: ", this.props);
            if(this.props.Wallets!=undefined){
                this.createWalletsHandler();
            }
        }
    }

    createWalletsHandler = async() => {
        let data = this.state.data;
        data.walletDefined = true;
        let wallets = this.props.Wallets.createKYCWallets(data.numberWallets);
        data.walletArray = (await wallets).walletArray;
        data.provider = (await wallets).kyc_provider;
        data.issuer = (await wallets).kyc_issuer;
        data.middleware = (await wallets).kyc_middleware;
        
        this.setState({data}, ()=>{
            console.log('after created wallets and value is: ', data)
        });
    }

    walletGenesis = async() => {
        let data = this.state.data;
        for (let i = 1; i < data.numberWallets + 1; i++) {
            let wallet = data.walletArray[i-1];
            let kycData: mxw.KycData;
            try{
                kycData = await new KycData(wallet).signKycAddress();    
            }
            catch(e){
                console.log("there was an error on kycData: ", e);
            }
            
            /**
             * Provider Sign KYC Data
             */
            let partialSignedTrx: mxw.KycTransaction;

            try{
                partialSignedTrx = await new KycProvider(
                    data.provider,
                    kycData
                ).signTransaction();    
            }
            catch(e){
                console.log("there was an error on partialSignedTrx", e);
            }
            
            let allSignedTrx: mxw.KycTransaction;
        
            try{
                allSignedTrx = await new KycIssuer(
                    data.issuer,
                    partialSignedTrx
                ).signTransaction();    
            }
            catch(e){
                console.log("there was an error on allSignedTrx: ", e);
            }

            let isValidSignature: Boolean;

            try{
                isValidSignature = await new KycValidator(
                    allSignedTrx
                ).isValidSignature();    
            }
            catch(e){
                console.log("there was an error on isValidSignature: ", e);
            }

            let whitelistReceipt: mxw.providers.TransactionReceipt;
            
            try{
                whitelistReceipt = await new KycWhitelistor(
                    data.middleware,
                    allSignedTrx
                ).whitelist();
            }catch(e){
                console.log("there was an error on whitelistReceipt: ", e);
            }

        }
    }

    walletsErrorMessage = () => {
        if(this.state.data.walletDefined == false){
            return(
                <div
                    style={{
                        color: "black"
                    }}
                >
                    The wallet is not defined. Please define the wallet to continue.
                </div>
            );
        }else{
            return(
                <div/>
            );
        }
    }

    walletDefined = () => {
        if(this.state.data.walletDefined == true){
            return(
                <div>
                    <div>
                        Input Number of Wallets to Create
                    </div>
                    <br/><br/>
                    <input 
                    placeholder={this.state.data.numberWallets.toString()}
                    value={this.state.data.numberWallets.toString()} onChange={e=>{
                        let data = this.state.data;
                        data.numberWallets = parseInt(e.target.value);
                        this.setState({data});
                    }}/>
                    <br/><br/>
                    <div
                        onClick={()=>{
                            this.walletGenesis();
                        }}
                        style={{
                            display: 'inline-block',
                            background: "black", 
                            color: "white", 
                            width: "20rem", 
                            padding: '5px'
                        }}
                    >
                        Wallet Genesis 
                    </div>
                </div>  
            );
        }else{
            return <div/>
        }
    }

    render(){
        return(
            <div
                className = "pages"
            >   
                <div
                    style={{
                        padding: '20px',
                        color: 'white', 
                        width: '100%'
                    }}
                >
                    <div
                        style={{
                            display: 'inline-block'
                        }}
                    >
                        <h2>
                            KYC Main
                        </h2>  
                    </div>
                    <hr style={{width: '80%'}}/>
                    <hr  style={{width: '80%'}}/>
                    <br/>
                    <br/>
                    {this.walletsErrorMessage()}
                    {this.walletDefined()}
                </div>
            </div>
        );
    }
}

export default KYC;