const web3 = require("@solana/web3.js");

(async() => {
    
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    console.log(JSON.stringify(await connection.getVoteAccounts(), null, 2));
    

})();


{
    status: 0,
    id: 'fc1b2d2e-4abc-7a3c-8932-18e4d24b0038',
    name: 'Minters',
    enabled: true,
    membersIds: [ '9116c9ef-6c7d-57da-dd0e-35aee88f5bb5' ]
  }