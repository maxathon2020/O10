import { mxw } from 'mxw-sdk-js/dist/index';
import { computeAddress, sha256, toUtf8Bytes } from 'mxw-sdk-js/dist/utils'

export default class KycValidator {

    public transaction: mxw.KycTransaction;
    constructor(transaction: mxw.KycTransaction) {
        this.transaction = transaction;
    }


    public isValidSignature() {
        const isValidSignaturePromise = async (providerIssuerSignedTrx: mxw.KycTransaction): Promise<Boolean> => {

            let isValid: Boolean = providerIssuerSignedTrx.signatures.every((signature): Boolean => {

                let payload = JSON.stringify(providerIssuerSignedTrx.payload);
                let address = computeAddress(signature.pub_key.value);
                return mxw.utils.verify(payload, signature.signature, address);
            });

            return isValid;

        }

        return isValidSignaturePromise(this.transaction);

    }
}