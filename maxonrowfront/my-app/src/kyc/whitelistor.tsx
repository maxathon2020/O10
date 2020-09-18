
import { mxw, auth } from 'mxw-sdk-js/dist/index';

export default class KycWhitelistor {

    public middleware: mxw.Wallet;
    public transaction: mxw.KycTransaction;
    constructor(middleware: mxw.Wallet, transaction: mxw.KycTransaction) {
        this.middleware = middleware;
        this.transaction = transaction;
    }


    public whitelist() {
        const whitelistReceiptPromise = async (signedTransaction: mxw.KycTransaction): Promise<mxw.providers.TransactionReceipt> =>
            auth.Kyc.create(this.middleware).then(async (kyc) => {
                let receipt: mxw.providers.TransactionReceipt = await kyc.whitelist(signedTransaction);
                return receipt;

            });



        return whitelistReceiptPromise(this.transaction);

    }


}