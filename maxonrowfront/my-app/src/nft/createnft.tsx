import { mxw, nonFungibleToken as token, nonFungibleToken } from 'mxw-sdk-js/dist/index';
import { hexlify, randomBytes, bigNumberify } from 'mxw-sdk-js/dist/utils';
import axios from 'axios';

export default class TokenCreator{

    private _issuer: mxw.Wallet;
    private _wallet: mxw.Wallet;
    private _symbol: string;
    private _feeCollector: string;
    private _itemMetadata: string;
    private _itemProperties: string;

    public constructor(
        symbol: string,
        feeCollector: string,
        issuer: mxw.Wallet,
        wallet: mxw.Wallet,
        itemMetadata: string, 
        itemProperties: string
        ) {
        this._issuer = issuer;
        this._wallet = wallet;
        this._symbol = symbol;
        this._feeCollector = feeCollector;
        this._itemMetadata = itemMetadata;
        this._itemProperties = itemProperties;
    }

    public get symbol(): string {
        return this._symbol;
    }
    public set symbol(value: string) {
        this._symbol = value;
    }
    public get feeCollector(): string {
        return this._feeCollector;
    }
    public set feeCollector(value: string) {
        this._feeCollector = value;
    }
    public get issuer(): mxw.Wallet {
        return this._issuer;
    }
    public set issuer(value: mxw.Wallet) {
        this._issuer = value;
    }
    public get wallet(): mxw.Wallet {
        return this._wallet;
    }
    public set wallet(value: mxw.Wallet) {
        this._wallet = value;
    }

    public create(): Promise<mxw.nonFungibleToken.NonFungibleToken> {
        console.log("value of this.symbol: ", this.symbol);
        let nonFungibleTokenProperties = {
            name: "NFT" + this.symbol,
            symbol: this.symbol,
            fee: {
            to: this.feeCollector,
            value: bigNumberify("1"),
            },
            metadata: this._itemMetadata,
            properties: this._itemProperties
        }
        const create = async (): Promise<mxw.nonFungibleToken.NonFungibleToken> =>
            await token.NonFungibleToken.create(nonFungibleTokenProperties, this.wallet).then((token) => {
                return token as token.NonFungibleToken;
            });
        return create();
    }
    
    public reload(symbol: string, wallet: mxw.Wallet)
    : Promise<token.NonFungibleToken> {
        return token.NonFungibleToken.fromSymbol(
            symbol, wallet);
    }
}

