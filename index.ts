import fs from "fs";
import path from "path";
import { FireblocksSDK } from "fireblocks-sdk";
import { SolStaker } from "./src/sol-staker"

//Provide the API key and the path to the RSA secret key
const apiSecret = fs.readFileSync(path.resolve(__dirname, '<path_to_your_secret_key>'), "utf8"); 
const apiKey = "<your_fb_api_key>"

//Set to false if you wish to work on mainnet
const DEVNET: boolean = true;

//Set your staking vault account ID here
const VAULT_ACCOUNT = '<your_vault_account_id>';


const fireblocks = new FireblocksSDK(apiSecret, apiKey);
const solStaker = new SolStaker(fireblocks, VAULT_ACCOUNT, DEVNET);

(async() => {

    // await solStaker.createStakeAccount('<amount_to_stake>');
    // await solStaker.delegate('<validator_address>')
    // await solStaker.deactivate();
    // await solStaker.withdrawStakedBalance('<amount_to_withdraw>')
    
})();
