"use strict";

const { Contract } = require("fabric-contract-api");
const crypto  = require("crypto");


class Results extends Contract{
    
    async encryptObject(person, password){

        const algorithm = 'aes-192-cbc';
        // const key = crypto.scrypt(password, 'vscode' , 24);
        // const iv = Buffer.alloc(16, 0); 

        // Encrypt Name
        try{
            // const nameCipher = crypto.createCipheriv(algorithm , key, iv);
            const nameCipher = crypto.createCipher(algorithm, password);
            person.name = nameCipher.update(person.name, "utf8", "hex");
            person.name += nameCipher.final("hex");
            console.log("encrypted name");
        }
        catch(err){
            console.error("problem in encrypting name:"+err);
        }

        //Encrypt Registration Number
        try{
            // const regCipher = crypto.createCipheriv(algorithm , key, iv);
            const regCipher = crypto.createCipher(algorithm, password);
            person.reg = regCipher.update(person.reg, "utf8", "hex");
            person.reg += regCipher.final("hex");
            console.log("encrypted reg");
        }
        catch(err){
            console.error(`problem in encrypting name: ${err}`);
        }

        //Encrypt Marks
        try{
            // const markCipher = crypto.createCipheriv(algorithm , key, iv);
            const markCipher =  crypto.createCipher(algorithm, password);
            let temp = JSON.stringify(person.marks);
            // console.log(person.marks+""+temp);
            person.marks = markCipher.update(temp, "utf8", "hex");
            person.marks += markCipher.final("hex");
            console.log("encrypted marks");
        }
        catch(err){
            console.error(`problem in encrypting marks : ${err}`);
        }

        //auth creation - hash password for future check
        try{
            const passHash = crypto.createHash("sha256");
            passHash.update(password);
            person.auth = passHash.digest("hex");
            console.log("Wrote auth successfully!");
        }
        catch(err){
            console.error(`auth creation failed due to error: ${err}`);
        }
    }

    async doAuthorize(person, password){

        //Password authorization
        try{
            const authHash = crypto.createHash("sha256");
            authHash.update(password);
            if(person.auth.localeCompare(authHash.digest("hex"))){
                console.error("Password Mismatch");
                throw new Error("Entered Password is wrong, Try again");
            }
        }
        catch(err){
            console.error("Mistake while authenticating password: "+err);
            throw new Error("Mistake while authenticatin, try again?");
        }

    }

    async decryptObject(person, password){
        
        //check - correctness of password before decryption. Multiple decryption is costlier than a single hash function.
        await this.doAuthorize(person, password);

        const algorithm = 'aes-192-cbc';
        // const key = crypto.scrypt(password, 'vscode' , 24);
        // const iv = Buffer.alloc(16, 0); 

        //Decrypt Name
        try{
            // const nameText = crypto.createDecipheriv(algorithm, key, iv);
            const nameText = crypto.createDecipher(algorithm, password);
            person.name = nameText.update(person.name, "hex", "utf8");
            person.name += nameText.final("utf8");
            console.log("decryped name");
        }
        catch(err){
            console.error(`problems with decrypting name: ${err}`);
        }

        //Decrypt Registration Number
        try{
            // const regText = crypto.createDecipheriv(algorithm, key, iv);
            const regText = crypto.createDecipher(algorithm, password);
            person.reg = regText.update(person.reg, "hex", "utf8");
            person.reg += regText.final("utf8");
            console.log("decryped reg");
        }
        catch(err){
            console.error(`problems with decryping reg: ${err}`);
        }
        //Decrypt Marks 
        try{
            // const markText = crypto.createDecipheriv(algorithm, key, iv);
            const markText = crypto.createDecipher(algorithm, password);
            let temp = markText.update(person.marks, "hex", "utf8");
            temp += markText.final("utf8");
            person.marks = JSON.parse(temp);
            console.log("decrypted marks");
        }
        catch(err){
            console.error(`problems with decryping marks: ${err}`);
        }
    }

    async firstLedger(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        
        let examples = [
            {
                personal_id:"1",
                name:"PREM",
                reg:"921316104149",
                collegeCode: "9213",
                course_id: "1",
                year: "1",
                semester: "1",
                certificateVersion: "1",
                marks:{
                        cs1001: "A",
                        cs1002: "S"
                }
            },
            {
                personal_id:"2",
                name:"PREM P",
                reg:"921316014148",
                collegeCode: "9213",
                course_id: "1",
                year: "1",
                semester: "1",
                certificateVersion: "1",
                marks:{
                        cs1001: "S",
                        cs1002: "B"
                }
            }
        ];
        

        const password = "29/04/1999";

	    for( let i = 0 ; i < examples.length ; i++ ){
            await this.encryptObject(examples[i], password);
            // examples[i].name = nameCipher.update(examples[i].name, "utf8", "hex") + cipher.final("hex");
            examples[i].transaction_id = ctx.stub.getTxID();
            let timestamp = new Date();
            examples[i].creationTime= timestamp.toString();
		    await ctx.stub.putState(examples[i].personal_id,Buffer.from(JSON.stringify(examples[i])));
	    }
	    console.info("ADDED PREMS");
        console.info("============= END : Initialize Ledger ===========");
    }
    

    async queryResult(ctx, personal_id, key) {
        console.info("============= START : Query Result ===========");
        
        //Retreive current state of personal id
        let resultAsBytes = await ctx.stub.getState(personal_id); 
        
        //check - existense of state of personal id in world state
        if (!resultAsBytes || resultAsBytes.length === 0) {
            console.log (`${personal_id} does not exits`);
            throw new Error(`${personal_id} does not exist`);
        }

        //binary to JSON to Js object, decryption
        const finalResult = JSON.parse(resultAsBytes.toString());
        await this.decryptObject(finalResult, key);
        
        delete finalResult.auth;

        console.log(resultAsBytes.toString());
        console.info("============= END : Query Result ===========");
        
        return JSON.stringify(finalResult);
    }

    
    async queryByCollegeCode(ctx, collegeCode){
        console.info("============ START : Query By College Code ==========");
        if(!/\S/.test(collegeCode)){
            console.error(`No college code`); throw new Error("Enter proper college code");
        }

        //create query - collect by collegeCode, sort by course_id
        let query = {};
        query.selector = {};
        query.selector.collegeCode = collegeCode;
        
        let queryString = JSON.stringify(query);
        let queryIterator = await ctx.stub.getQueryResult(queryString);

        let allResults = [];
        while(true){
            let res = await queryIterator.next();
            console.log(res);
            if(res.value && res.value.value.toString()){
                let jsonResult = {};
                console.log(res.value.value.toString());

                jsonResult.isDelete = res.value.value.toString();
                jsonResult.Key = res.value.key;
                try {
                    jsonResult.Record = JSON.parse(res.value.value.toString("utf8"));
                } catch (err) {
                    console.log(err);
                    jsonResult.Record = res.value.value.toString("utf8");
                }

                allResults.push(jsonResult.Record);
            }
            console.log(allResults);
            if(res.done){
                console.log(`Results for ${collegeCode} queued`);
                await queryIterator.close();
                console.log(allResults);
                return JSON.stringify(allResults);
            }
        }

    }

    async createResult(ctx, personal_id, name, collegeCode, course_id, reg, year, semester, certificateVersion, marks, password){
        
        console.info("============= START : Creating Result ===========");
       
        //check - input availability
        if(!/\S/.test(password)){
            console.error("No password");
            throw new Error("Enter password properly");
        }
        if(!/\S/.test(personal_id)){
            console.error(`No personal_id`); 
            throw new Error("Enter personal id");
        }
        if(!/\S/.test(name)){
            console.error("no name"); 
            throw new Error("Enter name properly ");
        }
        if(!/\S/.test(reg)){
            console.error("no reg"); 
            throw new Error("Enter register number");
        }
        if(!/\S/.test(year)){
            console.error("no year"); 
            throw new Error("Enter year");
        }
        if(!/\S/.test(semester)){
            console.error("no semester"); 
            throw new Error("Enter semester");
        }
        if(!/\S/.test(certificateVersion)){
            console.error("no certificate version"); 
            throw new Error("Enter certificate version");
        }
        if(!/\S/.test(course_id)){
            console.error("no course id"); 
            throw new Error("Enter course id");
        }

        // check input quality
        if(isNaN(Number(personal_id))){
            console.error("Entered personal_id is NaN: "+personal_id);
            throw new Error("Personal ID should be a number");
        }
        if(isNaN(Number(reg))){
            console.error("Entered reg is NaN: "+reg);
            throw new Error("Registration Number should be a number");
        }
        if(isNaN(Number(course_id))){
            console.error("Entered course_id is NaN: "+course_id);
            throw new Error("course ID should be a number");
        }
        if(isNaN(Number(collegeCode))){
            console.error("Entered collegecodeis NaN: "+collegeCode);
            throw new Error("college code should be a number");
        }
        if(isNaN(Number(year))){
            console.error("Entered year is NaN: "+year);
            throw new Error("Year of Study should be a number");
        }
        if(isNaN(Number(semester))){
            console.error("Entered semester is NaN: "+semester);
            throw new Error("Semester of study should be a number");
        }
        if(isNaN(Number(certificateVersion))){
            console.error("Entered certificateVersion is NaN: "+certificateVersion);
            throw new Error("Result sheet's certification version should be a number");
        }
        try{
            console.log(typeof(marks))
            if(typeof(JSON.parse(marks)) == 'object'){
                console.info("marks is in proper object format after parsing the provided json object");
            }
        }
        catch(err){
            console.error("Entered marks is not in a JSON object format"+marks);
            throw new Error("Enter marks in proper format");
        }
        
        //Receive the current state of personal id from the world state 
        const resultAsBytes = await ctx.stub.getState(personal_id);
        const timeNow = new Date();
        const finName = name.toUpperCase();

        const finTime =  timeNow.toString();
        
        //Inputs to JS Object conversion
        const sheet = {
            personal_id: personal_id,
            name: finName, 
            collegeCode: collegeCode,
            course_id: course_id,
            reg: reg, 
            year: year, 
            semester: semester, 
            certificateVersion: certificateVersion, 
            creationTime: finTime, 
            transaction_id: ctx.stub.getTxID(),
            marks: marks
        };
        
        await this.encryptObject(sheet, password);

        if (!resultAsBytes || resultAsBytes.length === 0){
            console.log("first entry to key");
            // console.log("======> checking for registration number's existense <=====");

            // let query = {};
            // query.selector = {};
            // query.selector.reg = reg;
            // console.log(query+" and "+reg);
            // let queryString = JSON.stringify(query);
            // let queryIterator = await ctx.stub.getQueryResult(queryString);

            // let availables = [];
            // while(true){
            //     let res = await queryIterator.next();
            //     console.log(res);
            //     if(res.value && res.value.value.toString()){
            //         let jsonResult = {};
            //         console.log(res.value.value.toString());
            //         jsonResult.isDelete = res.value.value.toString();
            //         jsonResult.Key = res.value.key;
            //         try {
            //             jsonResult.Record = JSON.parse(res.value.value.toString("utf8"));
            //         } catch (err) {
            //             console.log(err);
            //             jsonResult.Record = res.value.value.toString("utf8");
            //         }
    
            //         availables.push(jsonResult.Record);
            //     }
            //     if(res.done){
            //         console.log("done---->"+availables);
            //         break;
            //     }
            // }
            // console.log(availables);
            // if(availables.length > 0){
            //     console.error(`Register Number ${reg} already exists`);
            //     throw new Error(`Register Number ${reg} already exists`);
            // }
        }
        else{
   
            
            //Binary to JSON to JS Object Conversionm password check    
            const currentResult = JSON.parse(resultAsBytes.toString());
            await this.doAuthorize(currentResult, password);
            
            // //Decrypting Result in world state
            // await this.decryptObject(currentResult, password);

            //check- corrupt, mismatched or wrong input
            if (parseInt(certificateVersion) > 3){
                console.error(`Certificates for person with person id ${personal_id} for the current semester is above 3`);
                throw new Error(`Max limit of certificate per semester is only 3, try again with next semester`);
            }
            //throw new Error(`${currentResult}, ${currentResult.toString()}`)
            if(currentResult.name !== "undefined"){
                if(currentResult.name.localeCompare(sheet.name)){
                    console.error("Exited!!! Wrong name");
                    throw new Error(`Name Mismatch!!! Entered Name: ${finName}`);
                }

                if(currentResult.collegeCode.localeCompare(collegeCode) || currentResult.course_id.localeCompare(course_id)){
                    console.info(`${personal_id} has either moved from ${currentResult.collegeCode} to college ${collegeCode} or changed course from ${currentResult.course_id} to ${course_id}`);    
                }   
                else{
                    if(currentResult.reg.localeCompare(sheet.reg)){
                        console.error("Exited!!! Wrong Registration Number");
                        throw new Error(`Reg Number Mismatch!!! Old Reg Number: ${currentResult.reg}, Entered Reg Number: ${reg}`);
                    }
                             
                    if (parseInt(currentResult.year) > parseInt(year)){
                        console.error("Exited!!! current 'year' entry lesser than previous 'year'entry ");
                        throw new Error(`Year Mismatch!! Old year: ${currentResult.year}, Entered year: ${year}`);
                    }
                    else if(parseInt(currentResult.year) === parseInt(year)){
                        if(parseInt(currentResult.semester) > parseInt(semester)){
                            console.error("Exited!!! current 'semester' lesser than previous 'semester' entry. ");
                            throw new Error(`Semester Mismatch!! Old Semester: ${currentResult.semester}, Entered semester: ${semester}`);
                        }
                        else if(parseInt(currentResult.semester) === parseInt(semester)){
                            if(parseInt(currentResult.certificateVersion) >= parseInt(certificateVersion)){
                                console.error("Exited!!! current 'certificate version' lesser/equal than/to previous 'certificate version' ");
                                throw new Error(`Certificate Version Mismatch!! Old version: ${currentResult.certificateVersion}, Entered version: ${certificateVersion} `);
                            }
                        }
                    }
                }
            }
        }
        
        let semAvailable = 2*parseInt(year);
                    
        if(!year.localeCompare('n/a') || !year.localeCompare("N/A") || !year.localeCompare("N/a") || !year.localeCompare("n/A")) {}
        else if(parseInt(year) == 0 || parseInt(year).toString() == 'NaN'){
            console.error("Invalid character entered in year");
            throw new Error(`${year} isn't a valid year`);
        }

        if(parseInt(semester) == semAvailable || parseInt(semester) == (semAvailable-1)){}
        else{
            console.error("Entered Semester and SemAvailables mismatch: "+Number(semester));
            throw new Error(`Semester for year ${year} should be ${semAvailable - 1} or ${semAvailable}`);
        }

     
        //Write to world state of personal id 
        await ctx.stub.putState(personal_id, Buffer.from(JSON.stringify(sheet)));
        console.info("============= END : Creating Result ===========");
    }


    async queryAllResult(ctx, personal_id, password){
        console.info("============= START : Query All Result ===========");

        //check - input availability
        if(isNaN(personal_id)){
            throw new Error(`${personal_id} is not a valid key`);
        }

        //retreive all states from the ledger - returns iterator key
        const manyResult = await ctx.stub.getHistoryForKey(personal_id);

        const allResult = [];
        while(true){
            //iterate using key
            const temp = await manyResult.next();

            if(temp.value && temp.value.value.toString()){
                console.log(temp.value.value.toString("utf8"));
                
                let sheet = {};
                
                sheet.IsDelete = temp.value.is_delete.toString();
                try{
                    sheet.value = JSON.parse(temp.value.value.toString("utf8"));
                }
                catch(err){
                    console.log("Caught an error while accepting ledger data"+err);
                    sheet.value = temp.value.value.toString("utf8");
                }
            
                //Add to sheet only if it is not deleted from world state
                if(sheet.IsDelete){
                    //decrypt object -> sheet.value <=> result object
                    await this.decryptObject(sheet.value, password);
                    delete sheet.IsDelete;
                    allResult.push(sheet);
                }
            }

            if (temp.done){
                console.log("All Requested Data has been written");
                await manyResult.close();
                if(allResult.length == 0){
                    throw new Error(`Records for ${personal_id} doesn"t exist`);
                }
                console.info(allResult);
                console.info("============= END : Query All Result ===========");
                return JSON.stringify(allResult);
                
            }
        }
    }

    async deleteResult(ctx, personal_id){   

        try{
            await ctx.stub.deleteState(personal_id);
        }
        catch(err){
            console.error("id doesn't exist in world state");
            throw new Error(`Error : ${err}`);
        }
    }
    
}

module.exports = Results;

	
