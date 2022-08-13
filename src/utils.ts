import { FireblocksSDK } from "fireblocks-sdk";
import * as nonceAuth from "../src/nonceAuth/nonceAccounts.json"
import * as testNonceAuth from "../src/nonceAuth/testNonceAccounts.json"

export const LAMPORTS_TO_SOL = 1000000000;


export async function getStakeAccountKey(fireblocks: FireblocksSDK, vaultAccountId: any, testNet: boolean,){
    return (await fireblocks.getPublicKeyInfoForVaultAccount({
        assetId: testNet ? "SOL_TEST" : "SOL",
        vaultAccountId: Number(vaultAccountId),
        change: 2,
        addressIndex: 0,
        compressed: true
    })).publicKey;
}

export async function sendRawTX(rawTx: any, web3: any, connection: any, testNet: any){
    let cluster = "cluster=mainnet-beta";
    if(testNet)
        cluster = "cluster=devnet"
    try{
        const txRes = await web3.sendAndConfirmRawTransaction(connection, rawTx);
        console.log("Success. Transaction Hash:\n", txRes + `\n\nExplorer Link: \nhttps://explorer.solana.com/tx/${txRes}?${cluster}`)
    }catch(e){
        console.log("Failed\n",e)
    }
}

export async function getNonceInfo(web3: any, testNet: boolean){

    let nonceAccount: any;
    let authorityKeyPair: any;

    if(testNet){
        //nonceAccount = web3.Keypair.fromSecretKey(Uint8Array.from(nonceAuth.accounts[Math.floor(Math.random() * 5)]));
        nonceAccount = web3.Keypair.fromSecretKey(Uint8Array.from(testNonceAuth.accounts[2]));
        authorityKeyPair = web3.Keypair.fromSecretKey(Uint8Array.from(testNonceAuth.authority));
    }else{
        //const nonceAccount = web3.Keypair.fromSecretKey(Uint8Array.from(nonceAuth.accounts[Math.floor(Math.random() * 5)]));
        nonceAccount = web3.Keypair.fromSecretKey(Uint8Array.from(nonceAuth.accounts[0]));
        authorityKeyPair = web3.Keypair.fromSecretKey(Uint8Array.from(nonceAuth.authority));
    }

    return { nonceAccount, authorityKeyPair }

}
