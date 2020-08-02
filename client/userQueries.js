"use-strict"

const { FileSystemWallet, Gateway } = require("fabric-network");
const path = require("path");
const ccpPath = path.resolve(__dirname, "register/university1-connection-profile.json");

async function doQueryResult(contract){
    const personal_id = process.argv[3];
    const password = process.argv[4];
    if(personal_id == undefined){
        console.error("id not present");
        return;
    }
    if(password == undefined){
        console.error("password not present");
        return;
    }
    const result = await contract.evaluateTransaction("queryResult", personal_id, password);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
}

async function doQueryAllResult(contract){
    const personal_id = process.argv[3];
    const password = process.argv[4];
    if(personal_id == undefined){
        console.error("id not present");
        return;
    }
    if(password == undefined){
        console.error("password not present");
        return;
    }
    const result = await contract.evaluateTransaction("queryAllResult", personal_id, password);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
}

async function doQueryByCollegeCode(contract){
    const college_code = process.argv[3];
    console.log(college_code);  
    if(college_code == undefined){
        console.error("college code undefined");
        return;
    }
    const result = await contract.evaluateTransaction("queryByCollegeCode", college_code);
    console.log(`Transaction has been evaluated, result is: \n ${result.toString()}`);
}

async function main(){
    try{
        //move to wallet and input necessary certs
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        //check - user credentials
        const userExists = await wallet.exists("user1");
        if (!userExists) {
            console.log("An id for user 'user1' doesn't exist in the wallet");
            return;
        }

        //creating a gateway for user to peer communication
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: "user1", discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork("mychannel");

        //connecting to the chaincode on channel
        const contract = network.getContract("results");

        const functions = process.argv[2];
        switch(functions){
            case 'queryResult':
                await doQueryResult(contract); 
                break;
            case 'queryAllResult':
                await doQueryAllResult(contract);
                break;
            case 'queryByCollegeCode':
                await doQueryByCollegeCode(contract);
                break;
            default:
                console.error(`${functions} is not a proper function`);
        }
        

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}
main();
