# Fireblocks Solana Staking SDK

Solana staking in Fireblocks

## Getting started

1. Clone this repo locally
2. cd into the directory
3. Run:
```
    npm install
```    
3. Create .env file with the following parameters:
```
    API_SECRET_PATH - the path to your RSA secret key
    API_KEY - your Fireblocks API key
```
## Using the CLI

Run the following command and follow the instructions in the terminal:
```
    ts-node cli.ts
```

## SDK functions

### Create stake account
```
createStakeAccount('<amount_to_stake>')
```

This function creates a staking account on the Solana blockchain controlled by the SOL wallet in your Fireblocks vault and sets the amount to be staked. This special stake account is a prerequisite for staking on the Solana blockchain. 

The amount in the stake account can’t be changed after this call.
The stake account is not shown in the Fireblocks console but appears in Solana block explorers and can be queried on-chain.

**Parameters:**

```
amount_to_stake; optional - The amount of SOL to stake out of the total balance of the wallet. The entire wallet balance will be staked if this value is not provided. There is a minimum requirement of 0.01 SOL.
```

**Returns:**
Void. Prints the transaction hash of the successful operation or an error log.

 

### Delegate
```
delegate('<validator_address>')
```
This function delegates the staked amount set in the previous createStakeAccount call to a validator address and initiates the actual delegation process. The staked amount will be moved from your SOL vault account balance into the stake sub-account but remains under the ownership of your original SOL wallet. The delegated funds enter an activation period and will start to earn rewards after two to three days typically.

This function should only be called once for any createStakeAccount call.

**Parameters:**
```
validator_address - string - The validator address is provided by the staking provider. Your assets are delegated to the owner of this address.
```
**Returns:**
Void. Prints the transaction hash of the successful operation or an error log.



### Deactivate
```
deactivate()
```
Deactivate is required to undelegate assets and stop staking entirely. Deactivate must be called before withdrawing the staked amount and rewards. Once this function is called, the funds in the stake sub-account start a deactivation period, which may take several days.

**Returns:**
Void. Prints the transaction hash of the successful operation or an error log.

 

### Withdraw staked balance:
```
withdrawStakedBalance('<amount_to_withdraw>')
```
The withdraw function moves the staked assets and the rewards from the stake sub-account back to the controlling vault account. Withdraw is called after the deactivate function has been called and the cooldown period is complete. 

After a successful withdrawal, the original SOL vault account balance will show all unstaked assets, including the rewards.

**Parameters:**
```
amount_to_withdraw - string; optional - The amount of SOL to withdraw out of the total stake account balance. The entire stake account balance will be withdrawn if a value is not provided.
```
**Returns:**
Void. Prints the transaction hash of the successful operation or an error log.

### Get Staked Balance:
```
getStakedBalance()
```
The get staked balance function returns the total staked balance and the received rewards that are currently on the staking account.
Calculation of the rewards might take up to a couple of minutes, please be patient.

**Returns:**
Void. Prints the total and the rewards balance.
