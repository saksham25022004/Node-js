const mongodb=require('mongodb');
const MongoClient=mongodb.MongoClient;

const mongoConnect= (callback) => {
    MongoClient.connect('mongodb+srv://saksham:W9Gqe1CXMq2WYEhf@cluster0.qcxjood.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
            .then(client=>{
                console.log('Connected1');
                callback(client);
            })
            .catch(err=>console.log(err));
};

module.exports=mongoConnect;