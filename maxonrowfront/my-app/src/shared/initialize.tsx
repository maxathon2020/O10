import axios from 'axios';
import { mxw ,nonFungibleToken as token} from 'mxw-sdk-js/dist/index';
import KycData from "../kyc/data";
import KycIssuer from '../kyc/issuer';
import KycProvider from '../kyc/provider';
import KycValidator from '../kyc/validator';
import KycWhitelistor from '../kyc/whitelistor';

export default class ProviderOrSignerRequest{

  private _walletM: string;
  private _providerM: string;
  private _issuerM: string;
  private _middlewareM: string;
  private _kyc_providerM: string;
  private _kyc_issuerM: string;
  private _kyc_middlewareM: string;
  private silentRPC = false;
  private _rpcProvider: mxw.providers.Provider;


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
      this._rpcProvider = this.providerFunction();
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

    getWallet = (mne: string) => {
      return mxw.Wallet.fromMnemonic(mne).connect(this._rpcProvider);
    }

    whitelistNewWallet = async (providerMne: string, issuerMne: string, middlewareMne: string) => {
      console.debug("Creating new MXW wallet");
      let wallet = mxw.Wallet.createRandom().connect(this._rpcProvider);
      console.debug("New MXW wallet with address " + wallet.address + " created. Going to whitelist it.");
      return await this.whitelistExistingWallet(providerMne, issuerMne, middlewareMne, wallet);
    }

    createNFTWallets = async() => {
      let wallet = mxw.Wallet.fromMnemonic(this._walletM).connect(this.providerFunction());    
      let provider = mxw.Wallet.fromMnemonic(this._providerM).connect(this.providerFunction());
      let issuer = mxw.Wallet.fromMnemonic(this._issuerM).connect(this.providerFunction());
      let middleware = mxw.Wallet.fromMnemonic(this._middlewareM).connect(this.providerFunction());                 
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
    

  public async whitelistExistingWallet(providerMne: string, issuerMne: string, middlewareMne: string, wallet: mxw.Wallet) {
    console.debug("Whitelisting wallet " + wallet.address);
    let provider = mxw.Wallet.fromMnemonic(providerMne).connect(this._rpcProvider);
    let issuer = mxw.Wallet.fromMnemonic(issuerMne).connect(this._rpcProvider);
    let middleware = mxw.Wallet.fromMnemonic(middlewareMne).connect(this._rpcProvider);
    console.debug("Whitelisting using provider " + provider.address + "; issuer " + issuer.address + "; middleware " + middleware.address);

    const kycData: mxw.KycData = await new KycData(wallet).signKycAddress();
    console.debug("KYC address: " + kycData.kyc.kycAddress);
    const partialSignedTrx: mxw.KycTransaction = await new KycProvider(
      provider,
      kycData
    ).signTransaction();
    console.debug("KYC Provider signed");
    const allSignedTrx: mxw.KycTransaction = await new KycIssuer(
      issuer,
      partialSignedTrx
    ).signTransaction();
    console.debug("KYC Issuer signed");
    const isValidSignature: Boolean = await new KycValidator(
      allSignedTrx
    ).isValidSignature();
    var str = "valid";
    if(!isValidSignature) {
      str = "invalid"
    }
    console.debug("KYC Validator checked signatures and they found " + str);
    const whitelistReceipt: mxw.providers.TransactionReceipt = await new KycWhitelistor(
      middleware,
      allSignedTrx
    ).whitelist();
    console.debug("KycWhitelistor whitelisted wallet with " + whitelistReceipt.confirmations + " confirmations");

    return wallet;
  }
}