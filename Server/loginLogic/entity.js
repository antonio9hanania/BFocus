var util = require('../util/util.js');
var constants = require('../constants/constants.js');

function uploadEntity(id, entity, college, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        console.log("Entity is: " + entity + ", from user id: " + id);
        var result = {"message" : ''};

        if(util.isEmpty(id) || (entity !== constants.LECTURER && entity !== constants.STUDENT)){
            resHttp.status(400);
            result.message = "Something went wrong with request of entity, got illegal request.";
            console.log(result.message);
            resolve(result);
        }
        else {
            userDataCollection.findByIdAndUpdate(id, {entity: entity, college: college }, function (err, doc) {
                if(err) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;
                }
                else {
                    console.log("The user: " + doc.username + " has been found, updating entity type.");
                    result.message = "Updated the entity successfully.";
                    util.printAllUsersInDataBase(userDataCollection);
                }

                console.log(result.message);
                resolve(result);
            });    
        }
    });
}


module.exports = { uploadEntity};