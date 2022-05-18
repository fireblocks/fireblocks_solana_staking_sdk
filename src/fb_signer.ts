import {FireblocksSDK, PeerType, TransactionOperation, TransactionStatus, TransactionResponse, CreateTransactionResponse} from "fireblocks-sdk";
import { LAMPORTS_TO_SOL } from "./utils"


export class FbSigner {
    constructor(
        private fireblocks: FireblocksSDK,
        private vaultAccountId: string,
        private testnet: boolean,
        private validatorAddress?: string,
        private amountToStake?: number,
        private amountToWithdraw?: number
    ){};

    
    private async waitForTxCompletion(fbTx: CreateTransactionResponse){
        
        let tx = fbTx;
        while (tx.status != TransactionStatus.COMPLETED) {
            if(tx.status == TransactionStatus.BLOCKED || tx.status == TransactionStatus.FAILED || tx.status == TransactionStatus.REJECTED || tx.status == TransactionStatus.CANCELLED){
                console.log("Transaction's status: " + tx.status);
                
                throw Error("Exiting the operation");
            }
            console.log("Transaction's status:",(await this.fireblocks.getTransactionById(fbTx.id)).status);
            setTimeout(() => { }, 4000);
            
            tx = await this.fireblocks.getTransactionById(fbTx.id);
                        
        }
        
        return (await this.fireblocks.getTransactionById(fbTx.id));
    }
    
    
    private async fbRawSigning(payloadToSign: any, note: string){

        const fbTx = await this.fireblocks.createTransaction(
            {
                assetId: this.testnet ? 'SOL_TEST' : 'SOL',
                operation: TransactionOperation.RAW,
                source: {
                    type: PeerType.VAULT_ACCOUNT,
                    id: String(this.vaultAccountId)
                },
                note,
                extraParameters: {
                    rawMessageData: {
                        messages: payloadToSign
                    }
                }

            }
        );
        console.log(note)
        return (await this.waitForTxCompletion(fbTx));
    }
    
    public async signWithFB(message: string, operation: string, stakeAccount?: string){

        let note;
        let messages = [];
        let res: any;

        switch(operation){
            case "stakeAccount": {
                messages = [
                    {
                        "content": message
                    },
                    {
                        "content": message,
                        "bip44addressIndex": 0,
                        "bip44change": 2
                    }
                ]
                note = `Going to create a stake account with the following details: \nVault Account ID: ${this.vaultAccountId}\nAmount to stake: ${this.amountToStake}\nStake Account address: ${stakeAccount}`;
                res = this.fbRawSigning(messages, note);
                break;
            }
            case "delegate": {
                note = `Going to create a delegation with the following details:\nVault Account ID: ${this.vaultAccountId}\nValidator Address: ${this.validatorAddress}\nStake account address: ${stakeAccount}`;
                messages = [
                    {
                        "content": message
                    }
                ]
                res = this.fbRawSigning(messages, note);
                break;
            }
            case "deactivate": {
                note = `Going to deactivate delegation with the following details:\nDelegated Vault Account ID: ${this.vaultAccountId}\nStaking accound address: ${stakeAccount}`;
                messages = [
                    {
                        "content": message
                    }
                ]
                res = this.fbRawSigning(messages, note);
                break;
            }
            case "withdraw": {
                note = `Going to withdraw with the following details:\nDestination Vault Account ID: ${this.vaultAccountId}\nAmount: ${this.amountToWithdraw}\nStake account address: ${stakeAccount}`;
                messages = [
                    {
                        "content": message
                    }
                ]
                res = this.fbRawSigning(messages, note);
                break;
            }
            default: {
                throw(`Illegal operation: ${operation}`)
            }


        }
        

        return res;
    }

}
