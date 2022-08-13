
import inquirer = require("inquirer");
import { SolStaker } from "./src/sol-staker";
import { FireblocksSDK } from "fireblocks-sdk";
import * as path from 'path'
import * as fs from 'fs'
import { LAMPORTS_TO_SOL } from "./src/utils";
require('dotenv').config();



var DEVNET = true;
const apiSecret = fs.readFileSync(path.resolve(__dirname, process.env.API_SECRET_PATH), "utf8"); 
const fireblocks = new FireblocksSDK(apiSecret, process.env.API_KEY);

(async () => {
    console.log("Welcome to Fireblocks Solana Staking CLI!")
    const vault = await inquirer.prompt<any>({
        type: "input",
        name: "vaId",
        message: 'Enter Vault Account ID'
    });
    if(!Number(vault.vaId) || (Number(vault.vaId) < 0 || Number(vault.vaId) > 4000000000))
        throw new Error("Wrong vault account ID input. ID should be an integer between 0 to N.");
    
    const mainnet = await inquirer.prompt<any>({
        type: "list",
        name: "confirm",
        message: "Do you want to stake on mainnet?",
        choices: [
            'No',
            'Yes'
        ]
    });

    if(mainnet.confirm == "Yes")
        DEVNET = false;

    const operationsList: inquirer.QuestionCollection = {
        type: "list",
        name: "staking",
        message: 'Choose Staking Operation',
        choices: [
            'Create Stake Account',
            'Delegate',
            'Deactivate',
            'Withdraw staked amount',
            'Get Rewards info'
        ]
    };
            
    const solStaker = new SolStaker(fireblocks, vault.vaId, DEVNET);
    const operation = await inquirer.prompt<any>(operationsList);

    switch(operation.staking){
        case 'Create Stake Account':
            
            const amount = await inquirer.prompt<any>({
                type: "input",
                name: "amount",
                message: 'Enter the amount to stake'
            });
            if(!Number(amount.amount))
                throw new Error("Wrong amount input");

            const confirmStakeAccount = await inquirer.prompt<any>({
                type: "list",
                name: "confirm",
                message: `Going to create a new stake account from vault account ${vault.vaId} with an amount of ${amount.amount}\n  Please confirm:`,
                choices: [
                    'No',
                    'Yes'
                ]
            });

            if(confirmStakeAccount.confirm == "Yes")
                await solStaker.createStakeAccount(amount.amount)
            else
                console.log("Cancelling the operation")
            break;

        case 'Delegate':
            
            const delegate = await inquirer.prompt<any>({
                type: "input",
                name: "validator",
                message: 'Enter the validator address'
            });
            if((delegate.validator).length != 44)
                throw new Error("Wrong validator address input")

            const confirmDelegate = await inquirer.prompt<any>({
                type: "list",
                name: "confirm",
                message: `Going to delegate from vault ${vault.vaId} to ${delegate.validator}\n  Please confirm:`,
                choices: [
                    'No',
                    'Yes'
                ]
            });
            if(confirmDelegate.confirm == "Yes")
                await solStaker.delegate(delegate.validator);    
            else
                console.log("Cancelling the operation")
            break;

        case 'Deactivate':
            
            const confirmDeactivate = await inquirer.prompt<any>({
                type: "list",
                name: "confirm",
                message: `Going to deactivate your stake account in vault ${vault.vaId}\n  Please confirm:`,
                choices: [
                    'No',
                    'Yes'
                ]
            });
            if(confirmDeactivate.confirm == "Yes")
                await solStaker.deactivate();
            else
                console.log("Cancelling the operation")
            break;

        case 'Withdraw staked amount':
            
            const stakeBalance = await solStaker.getStakedBalance()
            
            const amountToWithdraw = await inquirer.prompt<any>({
                type: "input",
                name: "amount",
                message: 'Enter the amount to withdraw'
            });
            
            if(Number(amountToWithdraw.amount) <= stakeBalance.total/LAMPORTS_TO_SOL){
                const confirmWithdraw = await inquirer.prompt<any>({
                    type: "list",
                    name: "confirm",
                    message: `Going to withdraw ${amountToWithdraw.amount} out of ${stakeBalance.total/LAMPORTS_TO_SOL} SOL\n  Please confirm:`,
                    choices: [
                        'No',
                        'Yes'
                    ]
                });
                if(confirmWithdraw.confirm == "Yes")
                    await solStaker.withdrawStakedBalance(amountToWithdraw.amount)
                else
                    console.log("Cancelling the operation")
            }else{
                throw new Error("Cannot withdraw an amount greater than the actual balance")
            }
            break;
        case("Get Rewards info"):
            await solStaker.getStakedBalance();
            break;
        default: 
            console.log("Wrong Choice")
            break;
    }
})();
