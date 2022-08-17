import fs from "fs";
import path from "path";
import { FireblocksSDK } from "fireblocks-sdk";
import { SolStaker } from "./src/sol-staker"
require('dotenv').config();


//Provide the API key and the path to the RSA secret key
const apiSecret = fs.readFileSync(path.resolve(__dirname, process.env.API_SECRET_PATH), "utf8"); 
const fireblocks = new FireblocksSDK(apiSecret, process.env.API_KEY);

//Set to false if you wish to work on mainnet
const DEVNET = false;

//Set your staking vault account ID here
const VAULT_ACCOUNT = 'your_vault_ID';

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
