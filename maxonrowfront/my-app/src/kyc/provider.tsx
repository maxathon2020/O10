import { mxw, auth } from 'mxw-sdk-js/dist/index';

export default class KycProvider {
    public provider: mxw.Wallet;
    public kycData: mxw.KycData;
    constructor(provider: mxw.Wallet, kycData: mxw.KycData,) {
        this.provider = provider;
        this.kycData = kycData;
    }

    public signTransaction() {

        const providerSignedTrxPromise = async (kycData: mxw.KycData): Promise<mxw.KycTransaction> =>
            auth.Kyc.create(this.provider).then(async (kyc) => {
                let signatures:any[] = [];
                let nonSignedTransaction = {
                    payload: kycData,
                    signatures
                };
                let transaction = await kyc.signTransaction(nonSignedTransaction);
                
                return transaction;
            });

        return providerSignedTrxPromise(this.kycData);
    }
}