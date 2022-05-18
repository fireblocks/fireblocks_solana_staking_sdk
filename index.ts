import fs from "fs";
import path from "path";
import { FireblocksSDK } from "fireblocks-sdk";
import { SolStaker } from "./src/sol-staker"


const apiSecret = fs.readFileSync(path.resolve(__dirname, '<path_to_your_secret_key>'), "utf8"); 
const apiKey = "<your_fb_api_key>"
const fireblocks = new FireblocksSDK(apiSecret, apiKey);

const DEVNET: boolean = true;
const VAULT_ACCOUNT: any = null;


const solStaker = new SolStaker(fireblocks, VAULT_ACCOUNT, DEVNET);

(async() => {

    // await solStaker.createStakeAccount('<amount_to_stake>');
    // await solStaker.delegate('<validator_address>')
    // await solStaker.deactivate();
    // await solStaker.withdrawStakedBalance('<amount_to_withdraw>')
    
})();
