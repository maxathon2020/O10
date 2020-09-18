import { mxw, auth } from 'mxw-sdk-js/dist/index';

export default class KycIssuer {
    public issuer: mxw.Wallet;
    public transaction: mxw.KycTransaction;
    constructor(issuer: mxw.Wallet, transaction: mxw.KycTransaction,) {
        this.issuer = issuer;
        this.transaction = transaction;
    }

    public signTransaction() {

        const issuerSignedTrxPromise = async (providerSignedTransaction: mxw.KycTransaction): Promise<mxw.KycTransaction> =>
            auth.Kyc.create(this.issuer).then(async (kyc) => {
                let transaction = await kyc.signTransaction(providerSignedTransaction);
                return transaction;
            });

        return issuerSignedTrxPromise(this.transaction);
    }
}