import React, {Component} from 'react';
// import {CreateToken} from "../nft/token";
import { mxw ,nonFungibleToken as token} from 'mxw-sdk-js/dist/index';
import { TransactionReceipt } from 'mxw-sdk-js/dist/providers/abstract-provider';
import TokenCreator from '../nft/createnft';
import { hexlify, randomBytes, bigNumberify } from 'mxw-sdk-js/dist/utils';
import { createPortal } from 'react-dom';
import Util from "../nft/util";
import Approver from '../nft/approver';
import * as crypto from "crypto";
import Minter from '../nft/minter';
import Transferer from '../nft/transferer';
import ProviderOrSignerRequest from '../shared/initialize';
import '../css/main.css';

class DataClass {
    public symbol = hexlify(randomBytes(4)).substring(2);
    public feeCollector = "mxw1md4u2zxz2ne5vsf9t4uun7q2k0nc3ly5g22dne";
    public itemId = crypto.randomBytes(16).toString('hex');
    private _itemMetadata: string = "";
    private _itemProperties: string = "";
    private _trxReceipt: TransactionReceipt;
    private _wallet: mxw.Wallet;
    private _issuer: mxw.Wallet;
    private _provider: mxw.Wallet;
    private _middleware: mxw.Wallet;
    private _nft: token.NonFungibleToken;
    private _issuerNft: token.NonFungibleToken;
    private _walletDefined: Boolean = false;

    public get itemMetadata(): string {
        return this._itemMetadata;
    }
    public set itemMetadata(value: string){
        this._itemMetadata = value;
    }
    public get itemProperties(): string {
        return this._itemProperties;
    }
    public set itemProperties(value: string){
        this._itemProperties = value;
    }
    public get nft(): token.NonFungibleToken {
        return this._nft;
    }
    public set nft(value: token.NonFungibleToken) {
        this._nft = value;
    }
    public get issuerNft(): token.NonFungibleToken {
        return this._issuerNft;
    }
    public set issuerNft(value: token.NonFungibleToken) {
        this._issuerNft = value;
    }
    public get wallet(): mxw.Wallet {
        return this._wallet;
    }
    public set wallet(value: mxw.Wallet) {
        this._wallet = value;
    }
    public get issuer(): mxw.Wallet {
        return this._issuer;
    }
    public set issuer(value: mxw.Wallet) {
        this._issuer = value;
    }
    public get provider(): mxw.Wallet {
        return this._provider;
    }
    public set provider(value: mxw.Wallet) {
        this._provider = value;
    }
    public set middleware(value: mxw.Wallet) {
        this._middleware = value;
    }
    public get middleware(): mxw.Wallet {
        return this._middleware;
    }
    public set trxReceipt(value: TransactionReceipt) {
        this._trxReceipt = value;
    }
    public get trxReceipt(): TransactionReceipt {
        return this._trxReceipt;
    }
    public set walletDefined(value: Boolean) {
        this._walletDefined = value;
    }
    public get walletDefined(): Boolean {
        return this._walletDefined;
    }
}

interface MyProps {
    Wallets: ProviderOrSignerRequest
};
interface MyState {
    data: DataClass
}

class NFT extends Component<MyProps, MyState>{

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


    createWalletsHandler = async () => {
        let data = this.state.data;
        data.walletDefined = true;

        let wallets = this.props.Wallets.createNFTWallets();
        data.wallet = (await wallets).wallet;
        data.provider = (await wallets).provider;
        data.issuer = (await wallets).issuer;
        data.middleware = (await wallets).middleware;
        
        this.setState({data});
    }

    itemMetadataHandler(e:any){
        e.preventDefault();
        let data = this.state.data; 
        data.itemMetadata = e.target.value;
        this.setState({data});
    }

    itemPropertiesHandler(e:any){
        e.preventDefault();
        let data = this.state.data; 
        data.itemProperties = e.target.value;
        this.setState({data});
    }

    createTokenHandler = async() => {
        let data = this.state.data;
        console.log("value of symbol: ", data.symbol);
        const tokencreator = new TokenCreator(data.symbol, data.feeCollector, data.issuer, data.wallet, data.itemMetadata, data.itemProperties);
        try{
            await tokencreator.create();
            const nonFungibleToken = await tokencreator.reload(data.symbol, data.wallet);
            const issuerNonFungibleToken = await tokencreator.reload(data.symbol, data.issuer);
            data.nft = nonFungibleToken;
            data.issuerNft = issuerNonFungibleToken;
            this.setState({data}, ()=>{console.log("DATA AFTER TOKEN CREATION: ", this.state.data)});
            try{
                const receipt = await new Approver(data.symbol, data.provider, data.issuer, data.middleware).approve();
                data.nft = await Util.reload(data.symbol, data.wallet);
                data.issuerNft = await Util.reload(data.symbol, data.issuer);
                this.setState({data}, ()=>{console.log("DATA AFTER APPROVAL: ", this.state.data)});
            }
            catch(e){
                console.log("there was an error: ", e);
            }
        }
        catch(e){
            console.log("there was an error: ", e);
        }
    }

    mintTokenHandler = async() => {
        try{
            let data = this.state.data;
            const minter = new Minter(data.symbol, data.itemId, data.itemMetadata, data.itemProperties);
            data.trxReceipt = await minter.mint(data.wallet, data.wallet.address);
            // data.trxReceipt = await minter.mint(data.wallet, data.issuer.address);
            this.setState({data}, ()=>{console.log("DATA AFTER MINTING: ", this.state.data)});
        }
        catch(e){
            console.log("there was an error: ", e)
        }
    }

    stateQuery = async() => {
        let data = this.state.data;
        let nftState = await data.nft.getState();
        let walletState = await data.wallet.getBalance();
        let walletTransaction = await data.wallet.compressedPublicKey;
        console.log("nftState: ", nftState);
        console.log("walletState: ", walletState);
        console.log("walletNFT: ", walletTransaction);
    }

    transferHandler = async() => {
        try{
            let data = this.state.data;
            const transferReceipt = await new Transferer(data.symbol, data.itemId, data.issuer)
            .transfer(data.wallet.address);
            this.setState({data}, ()=>{
                console.log("DATA AFTER TRANSFER: ", this.state.data);
                this.stateQuery();
            });
        }catch(e){
            console.log("there was an error: ", e);
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
            return <div/>
        }
    }

    walletDefined = () => {
        if(this.state.data.walletDefined == true){
            return(
                <div>
                    <div>
                        Input Item Meta Data
                    </div>
                    <br/>
                    <input value={this.state.data.itemMetadata} onChange={e=>this.itemMetadataHandler(e)}/>
                    <br/>
                    <br/>
                    <div>
                        Input Item Properties
                    </div>
                    <br/>
                    <input value={this.state.data.itemProperties} onChange={e=>this.itemPropertiesHandler(e)}/>
                    <br/>
                    <br/>
                    <div
                        onClick={()=>{
                            this.createTokenHandler();
                        }}
                        style={{
                            display: 'inline-block',
                            background: "black", 
                            color: "white", 
                            width: "20rem", 
                            padding: '5px'
                        }}
                    >
                        Create Token
                    </div>
                    <br/>
                    <br/>
                    <div
                        onClick={()=>{
                            this.mintTokenHandler();
                        }}
                        style={{
                            display: 'inline-block',
                            background: "black", 
                            color: "white", 
                            width: "20rem", 
                            padding: '5px'
                        }}
                    >
                        Mint Token
                    </div>
                    <br/>
                    <br/>
                    <div
                        onClick={()=>{
                            this.transferHandler();
                        }}
                        style={{
                            display: 'inline-block',
                            background: "black", 
                            color: "white", 
                            width: "20rem", 
                            padding: '5px'
                        }}
                    >
                        Transfer Token
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
                className="pages"
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
                            NFT Main
                        </h2>
                    </div>
                    <hr style={{width: '80%'}}/>
                    <hr style={{width: '80%'}}/>
                    <br/>
                    <br/>
                    {this.walletsErrorMessage()}
                    {this.walletDefined()}
                </div>
            </div>
        );
    }
}

export default NFT;   