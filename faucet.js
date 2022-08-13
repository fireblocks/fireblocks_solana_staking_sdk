const web3 = require("@solana/web3.js");

let payer = new web3.PublicKey("ET98QFL1kaGsr31bZyTEbXnf5bD8kkQ1sNB9HQxXQLyi")

let connection = new web3.Connection(web3.clusterApiUrl('devnet'));

const LAMPORTS_TO_SOL = 1000000000;


(async() => {
    
    let airdropSignature = await connection.requestAirdrop(
        payer,
        web3.LAMPORTS_PER_SOL,
    );

    console.log(payer)
    const res = await connection.confirmTransaction(airdropSignature);
    console.log(JSON.stringify(res, null , 2));

})();
