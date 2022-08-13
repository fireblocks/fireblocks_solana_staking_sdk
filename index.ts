import fs from "fs";
import path from "path";
import { FireblocksSDK } from "fireblocks-sdk";
import { SolStaker } from "./src/sol-staker"

//Provide the API key and the path to the RSA secret key
const apiSecret = fs.readFileSync(path.resolve(__dirname, 'path_to_private_key'), "utf8"); 
const apiKey = "api_key"

//Set to false if you wish to work on mainnet
const DEVNET: boolean = false;

//Set your staking vault account ID here
const VAULT_ACCOUNT = 'you_vault_ID';


const fireblocks = new FireblocksSDK(apiSecret, apiKey);
const solStaker = new SolStaker(fireblocks, VAULT_ACCOUNT, DEVNET);

(async() => {

    //Create Stake Account:
    //await solStaker.createStakeAccount('<amount>');

    //Delegate to a validator:
    //await solStaker.delegate('<validator_address>')

    //Deactivate:
    //await solStaker.deactivate();

    //Withdraw Staked:
    //await solStaker.withdrawStakedBalance();

    //Get Staked Balance:
    //await solStaker.getStakedBalance()
    
})();
