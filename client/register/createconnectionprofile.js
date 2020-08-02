const path = require("path");
const fs = require("fs");
const  conProfile = require('./university1-connection-profile.json');

async function main(){
    // var jss = {"a.b.d":"asdasD"};
    // console.log(jss["a.b.d"]);
    let finConProfile = conProfile;
    // console.log(finConProfile.peers["peer0.org1.example.com"]);
    // let ls = "peer0.org1.example.com";
    // console.log(finConProfile.peers["peer0.org1.example.com"].tlsCACerts);
    finConProfile.peers["peer0.org1.example.com"].tlsCACerts.pem = fs.readFileSync('/home/prem/temp/network/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem').toString();
    // // console.log(conProfile.name);
    finConProfile.peers["peer1.org1.example.com"].tlsCACerts.pem = fs.readFileSync('/home/prem/temp/network/crypto-config/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem').toString();
    finConProfile.certificateAuthorities["ca.org1.example.com"].tlsCACerts.pem = fs.readFileSync('/home/prem/temp/network/crypto-config/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem').toString();

    fs.writeFileSync('./university1-connection-profile.json', JSON.stringify(conProfile));
}
main();

