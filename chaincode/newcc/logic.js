'use strict';
const { Contract} = require('fabric-contract-api');

class testContract extends Contract {



   async queryids(ctx,a) {
   
    let idsAsBytes = await ctx.stub.getState(a); 
    if (!idsAsBytes || idsAsBytes.toString().length <= 0) {
      throw new Error('var doesn\'t exist');
       }
      let ids=JSON.parse(idsAsBytes.toString());
      
      return JSON.stringify(ids);
     }

   async addids(ctx,a,value1,value2,value3) {
   
    let ids={
       val1:value1,
       val2:value2,
       val3:value3
       };

    await ctx.stub.putState(a,Buffer.from(JSON.stringify(ids))); 
    
    console.log('variable ids added to ledger...');
    
  }

   async deleteids(ctx,a) {
   

    await ctx.stub.deleteState(a); 
    
    console.log('variable ids deleted from ledger...');
    
    }
}

module.exports=testContract;
