var redis = require("redis"),
    client = redis.createClient({
        host:`redis-16703.c10.us-east-1-2.ec2.cloud.redislabs.com`,
        port:16703,
        url:`redis://:95manhte@redis-16703.c10.us-east-1-2.ec2.cloud.redislabs.com:16703/redis-node`,
        db:'redis-node'
    });
// ttl=10 mins
const TTL=10*60;
const Promise=require("bluebird");
const _ =require("lodash");
Promise.promisifyAll(redis.RedisClient.prototype);

/**
 *
 * @param {[{id:string}]} arra
 */
const hookArrayToObject=(arra)=>{
    if(!Array.isArray(arra))return;
    else{
        let listData=[];
        arra.map(val=>{
            listData.push(_.keys(val)[0],_.values(val)[0])
        });
        return listData;
    }
}
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect",function(connect){
    console.log("Connected:",connect);
})
client.on("ready",function(log){
    console.log("Ready caching!");
})
/**
 *
 *thêm nhiều
 * @param hash_key
 * @param {{key:string,value:Object}}mang
 * @param ttl
 * @returns {Promise.<TResult>}
 */
const createHmset=(hash_key,mang,ttl)=>{
    if(!ttl) ttl=TTL;
    let query=[hash_key];
    for(let key in mang){
        query.push(key,mang[key]);
    }
    return client.hmsetAsync(...query).then(
        ()=>{
            return client.expireAsync(hash_key,ttl)
        }
    );
}


/**
 * Thêm 1 value
 * @param hash_key
 * @param key
 * @param val
 * @returns {Promise.<TResult>}
 */
 const addMore=(hash_key,key,val)=>{
    return client.hsetAsync(hash_key,key,val).then(()=>{
        return client.expireAsync(hash_key,TTL)
    });
}
/**
 *
 * @param hash_key
 * @returns {*}
 */
 const getAll=(hash_key)=>{
    return client.hgetallAsync(hash_key)
}
/**
 *
 * @param hash_key
 * @returns {*}
 */
const getHkeys =(hash_key)=>{
    return client.hkeysAsync(hash_key)
}

// createHmset(`prod_key`,{post1:11,post2:122},3*60).then(
//     ()=>{
//         addMore(`prod_key`,"post3",3333);
//     }
// );
// addMore(`prod_key`,"post3",3333);
getAll(`prod_key`).then(doc=>{
    console.log(doc);
})
module.exports={
    getHkeys,
    getAll,
    addMore,
    createHmset,
    hookArrayToObject
}
