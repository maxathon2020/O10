import { mxw, nonFungibleToken as token } from 'mxw-sdk-js/dist/index';
import { NonFungibleToken } from 'mxw-sdk-js/dist/non-fungible-token';
import { TransactionReceipt } from 'mxw-sdk-js/dist/providers/abstract-provider';

export default class Minter {

    private _symbol: string;
    private _itemId: string;
    private _itemMetadata: string;
    private _itemProperties: string;

    constructor(symbol: string, itemId: string, itemMetadata: string, itemProperties: string) {
        this._symbol = symbol;
        this._itemId = itemId;
        this._itemMetadata = itemMetadata;
        this._itemProperties = itemProperties;
    }

    public get symbol(): string {
        return this._symbol;
    }
    public set symbol(value: string) {
        this._symbol = value;
    }

    public async mint(minter: mxw.Wallet, address: string) : Promise<TransactionReceipt> {
        let nftMinter: token.NonFungibleToken =
            new NonFungibleToken(this._symbol, minter);

        const itemProp = {
            symbol: this._symbol,
            itemID: this._itemId,
            properties: this._itemMetadata,
            metadata: this._itemProperties
        } as token.NonFungibleTokenItem;

        return nftMinter.mint(address, itemProp) as Promise<TransactionReceipt>;
    };

}
