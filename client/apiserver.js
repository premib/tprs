
var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());

// Setting for Hyperledger Fabric
const { FileSystemWallet, Gateway } = require("fabric-network");
const path = require("path");
const ccpPath = path.resolve(__dirname, ".",  "register/university1-connection-profile.json");

app.get('/queryResult', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/queryresult.html'));
    res.sendFile(path.join(__dirname + '/html/request.js'));
    res.sendFile(path.join(__dirname + '/html/style.css'));
});


app.get("/api/queryAllResult/:id/:password", async function (req, res) {
    try {

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

        const result = await contract.evaluateTransaction("queryAllResult", req.params.id, req.params.password);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.status(200).json({response: result.toString()});

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({response: error.toString()});
        
    
    }
});


app.get("/api/queryResult/:id/:password", async function (req, res) {
    try {

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

        
        const result = await contract.evaluateTransaction("queryResult", req.params.id, req.params.password);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.status(200).json({response: result.toString()});


    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error.toString()});
       
    }
});

app.post("/api/createResult", async function (req, res) {
    try {

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

        await contract.submitTransaction("createResult", req.body.personal_id, req.body.name, req.body.collegeCode, req.body.course_id, req.body.reg, req.body.year, req.body.semester, req.body.certificateVersion, req.body.marks, req.body.password);
        console.log("Transaction has been submitted");
        
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.send("Transaction has been submitted");

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        
    }
})

app.get("/api/queryByCollegeCode/:college_code", async function (req, res) {
    try {

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

        const result = await contract.submitTransaction("queryByCollegeCode", req.params.college_code);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.status(200).json({response: result.toString()});

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }	
})

app.listen(8080);

