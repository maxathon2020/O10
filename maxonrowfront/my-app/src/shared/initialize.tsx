import axios from 'axios';
import { mxw ,nonFungibleToken as token} from 'mxw-sdk-js/dist/index';

export default class ProviderOrSignerRequest{

  private _walletM: string;
  private _providerM: string;
  private _issuerM: string;
  private _middlewareM: string;
  private _kyc_providerM: string;
  private _kyc_issuerM: string;
  private _kyc_middlewareM: string;
  private silentRPC = false;


  constructor(walletM: string, providerM: string, issuerM: string, 
    middlewareM: string, kyc_providerM: string, kyc_issuerM: string, 
    kyc_middlewareM: string    
    ){
      this._walletM = walletM;
      this._providerM = providerM;
      this._issuerM = issuerM;
      this._middlewareM = middlewareM;
      this._kyc_providerM = kyc_providerM;
      this._kyc_issuerM = kyc_issuerM;
      this._kyc_middlewareM = kyc_middlewareM;
    }

    private localnet = {
        connection: {
            url: "http://localhost:26657",
            timeout: 60000
        },
        chainId: "maxonrow-chain",
        name: "mxw",
        trace: {
            silent: true,
            silentRpc: this.silentRPC
        }
    }

    providerFunction = () => {
      let silentRPC = this.silentRPC;
      return(
        new mxw.providers.JsonRpcProvider(
          this.localnet.connection,
          this.localnet
        )
          .on('rpc', function (args) {
            if ('response' == args.action) {
              if (silentRPC) { 
                console.log('request', JSON.stringify(args.request));
                console.log('response', JSON.stringify(args.response));
              }
            }
          })
          .on('responseLog', function (args) {
            if (silentRPC) { 
              console.log(
                'responseLog',
                JSON.stringify({ info: args.info, response: args.response })
              );
            }
          })
      );
    }

    createNFTWallets = async() => {
      let wallet = await mxw.Wallet.fromMnemonic(this._walletM).connect(this.providerFunction());    
      let provider = await mxw.Wallet.fromMnemonic(this._providerM).connect(this.providerFunction());
      let issuer = await mxw.Wallet.fromMnemonic(this._issuerM).connect(this.providerFunction());
      let middleware = await mxw.Wallet.fromMnemonic(this._middlewareM).connect(this.providerFunction());                 
      return {wallet, provider, issuer, middleware}
    }

    createKYCWallets = async(numberWallets:number) => {
      let kyc_provider = await mxw.Wallet.fromMnemonic(this._kyc_providerM).connect(this.providerFunction());
      let kyc_issuer = await mxw.Wallet.fromMnemonic(this._kyc_issuerM).connect(this.providerFunction());
      let kyc_middleware = await mxw.Wallet.fromMnemonic(this._kyc_middlewareM).connect(this.providerFunction());
      let walletArray:mxw.Wallet[] = [];
      for (let i = 1; i < numberWallets + 1; i++) {
        let kyc_wallet_temp = await mxw.Wallet.createRandom().connect(this.providerFunction());
        walletArray.push(kyc_wallet_temp);
      }
      return {walletArray, kyc_provider, kyc_issuer, kyc_middleware}
    }
    
}