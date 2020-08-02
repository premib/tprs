"use strict";

const { FileSystemWallet, Gateway, X509WalletMixin } = require("fabric-network");
const path = require("path");
const ccpPath = path.resolve(__dirname, "university1-connection-profile.json");

async function main() {
    try {
        const userNumber = process.argv[2];
        const walletPath = path.join(process.cwd(), "../wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists("user"+userNumber);
        if (userExists) {
            console.log("An id for user 'user"+userNumber+"' already exists in the wallet");
            return;
        }

        const adminExists = await wallet.exists("admin");
        if (!adminExists) {
            console.log("id for admin user 'admin' doesn't exist in the wallet");
            return;
        }
        
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: "admin", discovery: { enabled: true, asLocalhost: true } });

        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        const secret = await ca.register({ affiliation: "org1.department1", enrollmentID: "user"+userNumber, role: "client" }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: "user"+userNumber, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity("Org1MSP", enrollment.certificate, enrollment.key.toBytes());
        await wallet.import("user"+userNumber, userIdentity);
        console.log("Successfully registered and enrolled admin user 'user"+userNumber+"' and imported it into the wallet");

    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }
}

main();