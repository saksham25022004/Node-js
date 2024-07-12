const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient;

let _db;

const mongoConnect= (callback) => {
    MongoClient.connect('mongodb+srv://saksham:W9Gqe1CXMq2WYEhf@cluster0.qcxjood.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0')
            .then(client=>{
                console.log('Connected!');
                _db=client.db();
                callback(client);
            })
            .catch(err=>{
                console.log(err);
                throw err;
            });
};

const getDb=()=>{
    if(_db){
        return _db;
    }
    throw 'NO DATABASE FOUND';
}

exports.mongoConnect=mongoConnect;
exports.getDb=getDb;