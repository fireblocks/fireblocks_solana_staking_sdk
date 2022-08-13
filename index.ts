import fs from "fs";
import path from "path";
import { FireblocksSDK } from "fireblocks-sdk";
import { SolStaker } from "./src/sol-staker"

//Provide the API key and the path to the RSA secret key
const apiSecret = fs.readFileSync(path.resolve(__dirname, '/Users/slavaserebriannyi/api_keys/fireblocks_secret.key'), "utf8"); 
const apiKey = "b3eeb1d6-afbd-f55d-0ccc-910d41479622"

//Set to false if you wish to work on mainnet
const DEVNET: boolean = false;

//Set your staking vault account ID here
const VAULT_ACCOUNT = '6';


const fireblocks = new FireblocksSDK(apiSecret, apiKey);
const solStaker = new SolStaker(fireblocks, VAULT_ACCOUNT, DEVNET);

(async() => {

    //await solStaker.createStakeAccount('1');
    //await solStaker.delegate('G87TwgErAW2qsqg5KCSaR6mheJK7942JXxfp2o7XbUYV')
    //await solStaker.deactivate();
    await solStaker.withdrawStakedBalance();
    
})();
