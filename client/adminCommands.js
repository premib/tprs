"use strict";

const { FileSystemWallet, Gateway } = require("fabric-network");
const path = require("path");
const ccpPath = path.resolve(__dirname, "register/university1-connection-profile.json");

const  doQueryResult = async function(contract){
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

const doQueryAllResult = async function(contract){
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

const  doQueryByCollegeCode = async function(contract){
    const college_code = process.argv[3];
    if(college_code == undefined){
        console.error("college code undefined");
        return;
    }
    const result = await contract.evaluateTransaction("queryByCollegeCode", college_code);
    console.log(`Transaction has been evaluated, result is: \n ${result.toString()}`);
}

const  doCreateResult = async function(contract){
    console.log(process.argv.slice(2,13));
    const [personal_id, name, collegeCode, course_id, reg, year, semester, certificateVersion, marks, password] = process.argv.slice(3,13);
    await contract.submitTransaction("createResult", personal_id, name, collegeCode, course_id, reg, year, semester, certificateVersion, marks, password);
    console.log(`Transaction has been evaluated`);
}

const  main = async function() {
    try {

        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists("admin");
        if (!userExists) {
            console.log("An identity for the user 'admin' does not exist in the wallet");
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: "admin", discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork("mychannel");
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
            case 'createResult':
                await doCreateResult(contract);
                break;
            default:
                console.error(`${functions} is not a proper function`);
        }

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();