import { mxw, auth, utils } from 'mxw-sdk-js/dist/index';
import { sha256, toUtf8Bytes } from 'mxw-sdk-js/dist/utils'
import { sortObject } from 'mxw-sdk-js/dist/utils/misc';

export default class KycData {
    public wallet: mxw.Wallet;
    public constructor(wallet: mxw.Wallet) {
        this.wallet = wallet;
    }

    public signKycAddress() {
        const kycDataPromise = async (): Promise<mxw.KycData> =>
            auth.Kyc.create(this.wallet).then(async (kyc) => {
                let seed = sha256(toUtf8Bytes(JSON.stringify(sortObject({
                    juridical: ['', ''].sort(),
                    seed: utils.getHash(utils.randomBytes(32))
                }))));

                let kycAddress = kyc.getKycAddress({
                    country: 'USA',
                    idType: 'CAL',
                    id: this.wallet.address,
                    idExpiry: 20201212,
                    dob: 19800101,
                    seed
                });

                const data = await kyc.sign(kycAddress);
                return data;
            })

            return kycDataPromise();
    }

}