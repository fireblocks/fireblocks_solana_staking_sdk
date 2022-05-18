import { FireblocksSDK } from "fireblocks-sdk";
import * as web3 from "@solana/web3.js";
import * as utils from "./utils"
import { FbSigner } from "./fb_signer";


export class SolStaker {
    constructor(
        private fireblocks: FireblocksSDK,
        private vaultAccountId: any,
        private testNet: boolean        
    ){}
    
    
    private async getConnection(){
        
        let connection = null;

        if(this.testNet){
            connection = new web3.Connection(web3.clusterApiUrl('devnet'));
        }else{
            connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
        }
        return connection;
    }
    
    /**
        * @param amountToStake Optional. The amount to stake(if was not provided - stake the entire balance)
        * @returns Void. Prints the transaction hash of the successful operation or error log 
        */

    public async createStakeAccount(amountToStake?: any){
        
        if(typeof(amountToStake) == 'string'){
            amountToStake = parseFloat(amountToStake);
        }
        const balance = (await this.fireblocks.getVaultAccountAsset(this.vaultAccountId, this.testNet? 'SOL_TEST': 'SOL')).available;
        let balanceToStake: number;
        
        if(amountToStake){
            if(amountToStake > parseFloat(balance)){
                throw(`You cannot stake more than the available balance. Available balance: ${balance}, requested amount to stake: ${amountToStake}`)
            }else if(amountToStake == parseFloat(balance)){
                balanceToStake = parseFloat(balance) - 0.001;
            }else{
                balanceToStake = amountToStake
            }
        }else{
            balanceToStake = parseFloat(balance)
        }
        

        const { nonceAccount, authorityKeyPair } = await utils.getNonceInfo(web3, this.testNet);
        const connection = await this.getConnection();

        const fbSigner = new FbSigner(this.fireblocks, this.vaultAccountId, this.testNet, null, balanceToStake, null);

        const mainAddr = await this.fireblocks.getDepositAddresses(this.vaultAccountId, this.testNet? 'SOL_TEST': 'SOL');
        const mainPubKey = new web3.PublicKey(mainAddr[0].address)

        const stakePublicKey = new web3.PublicKey(Buffer.from(await utils.getStakeAccountKey(this.fireblocks, this.vaultAccountId, this.testNet), 'hex'));
        
        
        let accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
        let nonceAccountHash = web3.NonceAccount.fromAccountData(accountInfo.data);
        
        let stakeAccountTx = new web3.Transaction();

        stakeAccountTx.add(
                web3.SystemProgram.nonceAdvance({
                noncePubkey: nonceAccount.publicKey,
                authorizedPubkey: authorityKeyPair.publicKey,
                })
        );
        stakeAccountTx.add(web3.StakeProgram.createAccount({
            fromPubkey: mainPubKey,
            authorized: new web3.Authorized(mainPubKey, mainPubKey),
            lamports: balanceToStake*utils.LAMPORTS_TO_SOL,
            stakePubkey: stakePublicKey
        }));

        stakeAccountTx.recentBlockhash = nonceAccountHash.nonce;
        stakeAccountTx.feePayer = mainPubKey;

        let transactionBuffer = stakeAccountTx.serializeMessage();
        const signatures = await fbSigner.signWithFB(transactionBuffer.toString('hex'), "stakeAccount", stakePublicKey.toBase58());
        
        signatures.signedMessages.forEach(signedMessage => {
            if(signedMessage.derivationPath[3] == 0){
                stakeAccountTx.addSignature(mainPubKey, Buffer.from(signedMessage.signature.fullSig, "hex"))
            }else{
                stakeAccountTx.addSignature(stakePublicKey, Buffer.from(signedMessage.signature.fullSig, "hex"))
            }
        });
        
        stakeAccountTx.partialSign(authorityKeyPair);
        console.log("The signatures were verifed:", stakeAccountTx.verifySignatures())
        
        await utils.sendRawTX(stakeAccountTx.serialize(), web3, connection)
    }

    /**
        * @param validatorAddr The validator's address
        * @returns Void. Prints the transaction hash of the successful operation or error log 
        */
    public async delegate(validatorAddr: string){
        

        const connection = await this.getConnection();
        const fbSigner = new FbSigner(this.fireblocks, this.vaultAccountId, this.testNet, validatorAddr, null, null);


        const mainAddr = await this.fireblocks.getDepositAddresses(this.vaultAccountId, this.testNet? 'SOL_TEST': 'SOL');
        const mainPubKey = new web3.PublicKey(mainAddr[0].address);
        const { nonceAccount, authorityKeyPair } = await utils.getNonceInfo(web3, this.testNet); 

        const stakePublicKey = new web3.PublicKey(Buffer.from(await utils.getStakeAccountKey(this.fireblocks, this.vaultAccountId, this.testNet), 'hex'));
        let votePubkey = new web3.PublicKey(validatorAddr);

        let accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
        let nonceAccountHash = web3.NonceAccount.fromAccountData(accountInfo.data);
            
        let delegateTransaction = new web3.Transaction().add(
            web3.SystemProgram.nonceAdvance({
            noncePubkey: nonceAccount.publicKey,
            authorizedPubkey: authorityKeyPair.publicKey,
            })
        );  
        delegateTransaction.add(web3.StakeProgram.delegate({
                stakePubkey: stakePublicKey,
                authorizedPubkey: mainPubKey,
                votePubkey: votePubkey
            })
        );
    
        delegateTransaction.recentBlockhash = nonceAccountHash.nonce;
        delegateTransaction.feePayer = mainPubKey;


        let bytesToSign = delegateTransaction.serializeMessage();

        const signature = await fbSigner.signWithFB(bytesToSign.toString('hex'), "delegate", stakePublicKey.toBase58()); 
        delegateTransaction.addSignature(mainPubKey, Buffer.from((signature.signedMessages[0].signature.fullSig), 'hex'));

        delegateTransaction.partialSign(authorityKeyPair);
        
        console.log('The signatures were verifed:', delegateTransaction.verifySignatures());        

        await utils.sendRawTX(delegateTransaction.serialize(), web3, connection);
    }

    /**
        * @returns Void. Prints the transaction hash of the successful operation or error log
        */
    public async deactivate(){

        const mainAddr = await this.fireblocks.getDepositAddresses(this.vaultAccountId, this.testNet? 'SOL_TEST': 'SOL');
        const mainPubKey = new web3.PublicKey(mainAddr[0].address)
        const connection = await this.getConnection();
        const fbSigner = new FbSigner(this.fireblocks, this.vaultAccountId, this.testNet);
        const { nonceAccount, authorityKeyPair } = await utils.getNonceInfo(web3, this.testNet);
        const stakePublicKey = new web3.PublicKey(Buffer.from(await utils.getStakeAccountKey(this.fireblocks, this.vaultAccountId, this.testNet), 'hex'));

        let accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
        let nonceAccountHash = web3.NonceAccount.fromAccountData(accountInfo.data);

        const deactivateTx = new web3.Transaction();

        deactivateTx.add(
            web3.SystemProgram.nonceAdvance({
                noncePubkey: nonceAccount.publicKey,
                authorizedPubkey: authorityKeyPair.publicKey,
            })
        );
        deactivateTx.add(web3.StakeProgram.deactivate({
            stakePubkey: stakePublicKey,
            authorizedPubkey: mainPubKey
            })
        );

        deactivateTx.recentBlockhash = nonceAccountHash.nonce;
        deactivateTx.feePayer = mainPubKey;

        const bytesToSign = deactivateTx.serializeMessage();
        const signature = await fbSigner.signWithFB(bytesToSign.toString('hex'), "deactivate", stakePublicKey.toBase58()); 
        deactivateTx.addSignature(mainPubKey, Buffer.from((signature.signedMessages[0].signature.fullSig), 'hex'));

        deactivateTx.partialSign(authorityKeyPair);
        console.log("The signatures were verifed:", deactivateTx.verifySignatures())
        
        await utils.sendRawTX(deactivateTx.serialize(), web3, connection);

    }
    /**
        * @param amountToWithdraw Optional. The amount to withdraw(if was not provided - withdraw the entire balance)
        * @returns Void. Prints the transaction hash of the successful operation or error log 
        */
    public async withdrawStakedBalance(amountToWithdraw?: string){
        
        let amount;
        let entireBalance: boolean = false;
        const connection = await this.getConnection();
        const stakePublicKey = new web3.PublicKey(Buffer.from(await utils.getStakeAccountKey(this.fireblocks, this.vaultAccountId, this.testNet), 'hex'));

        if(amountToWithdraw == null){
            entireBalance = true;
            amount = parseFloat(await connection.getBalance(stakePublicKey));
        }
        else{
            amount = parseFloat(amountToWithdraw);
        }

        const mainAddr = await this.fireblocks.getDepositAddresses(this.vaultAccountId, this.testNet? 'SOL_TEST': 'SOL');
        const mainPubKey = new web3.PublicKey(mainAddr[0].address);
        
        const { nonceAccount, authorityKeyPair } = await utils.getNonceInfo(web3, this.testNet);
        const fbSigner = new FbSigner(this.fireblocks, this.vaultAccountId, this.testNet, null, null, entireBalance ? amount/utils.LAMPORTS_TO_SOL : amount);

        const withdrawTx = new web3.Transaction();

        let accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
        let nonceAccountHash = web3.NonceAccount.fromAccountData(accountInfo.data);

        withdrawTx.add(
            web3.SystemProgram.nonceAdvance({
            noncePubkey: nonceAccount.publicKey,
            authorizedPubkey: authorityKeyPair.publicKey,
            })
        );

        withdrawTx.add(web3.StakeProgram.withdraw({
            stakePubkey: stakePublicKey,
            authorizedPubkey: mainPubKey,
            toPubkey: mainPubKey,
            lamports: entireBalance ? amount : amount*utils.LAMPORTS_TO_SOL
        }))

        
        withdrawTx.recentBlockhash = nonceAccountHash.nonce;
        withdrawTx.feePayer = mainPubKey;

        const bytesToSign = withdrawTx.serializeMessage();
        const signature = await fbSigner.signWithFB(bytesToSign.toString('hex'), "withdraw", stakePublicKey.toBase58()); 
        
        withdrawTx.addSignature(mainPubKey, Buffer.from((signature.signedMessages[0].signature.fullSig), 'hex'));
        withdrawTx.partialSign(authorityKeyPair);

        console.log("The signatures were verifed:", withdrawTx.verifySignatures())

        await utils.sendRawTX(withdrawTx.serialize(), web3, connection);
    }
}