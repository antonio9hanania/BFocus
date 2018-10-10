var util = require('../util/util.js');

function isEmpty(val){
    return util.isEmpty(val);
}

function checkValidationSignupData(username, email, password, confirmPassword, resHttp) {
    if(isEmpty(email)) {
        resHttp.status(401);
        return "Email can't be empty.";
    } 
    else if(isEmpty(username)) {
        resHttp.status(402);
        return "Username can't be empty.";
    }
    else if(username.length > 25) {
        resHttp.status(402);
        return "Username is too long.";
    }
    else if(isEmpty(password)) {
        resHttp.status(403);
        return "Password can't be empty.";
    }
    else if(password.length < 4) {
        resHttp.status(403);
        return "Password length must be above 4 characters.";
    }
    else if(isEmpty(confirmPassword)) {
        resHttp.status(404);
        return "Confirm password can't be empty.";
    }
    else if(password !== confirmPassword) {
        resHttp.status(404);
        return "Password doesn't match to confirm password";
    }
    else { 
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(String(email).toLowerCase())) {
            resHttp.status(401);
            return "Email isn't in the right pattern.";
        }
        else {
            return false;
        }
    }
}

function checkValidationLoginData(username, password, resHttp) {
    if(isEmpty(username)) {
        resHttp.status(401);
        return "Email can't be empty.";
    } 
    else if(isEmpty(password)) {
        resHttp.status(402);
        return "Password can't be empty.";
    }
    else {
        return false;
    }
}

function printAllUsersInDataBase(userDataCollection) {
    util.printAllUsersInDataBase(userDataCollection);
}

function checkWhichPageToReturn(userData) {
    if(isEmpty(userData.entity)) {
        return "Ok-EntityMissing";
    }
    else if(isEmpty(userData.timeTable)) {
        return "Ok-TimeTableMissing";
    }
    else {
        return "Ok";
    }
}

function createAccessToken() {
    return "1111";
}

function clearTokenFromOtherUsers(userDataCollection, currentUserEmail, token) {
    userDataCollection.find({ 'deviceToken': token}, function (err, docs) {
        if(err) {
            console.log("An error occurred: " + err);   
        }
        else if(docs.length === 0) {
            console.log("Not need to update any device in the database ");   
        }
        else {
            console.log("Need to clear tokens from devices");  
            for(let doc of docs) {
                if(doc.email !== currentUserEmail) {
                    console.log("Clear the device of user: " + doc.username, " with email: " + doc.email);  
                    doc.deviceToken = undefined;
                    doc.save();
                }
            }  
        }   
    });
}

function login(username, email, accessToken, deviceToken, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        console.log("username: " + username + " email: " + email + " access token:" + accessToken + "\ndevice token: " + deviceToken);
        var userData;
        var result = {"message" : ''};

        userDataCollection.find({ 'email': email}, function (err, docs) {
            if(err) {
                result.message = "An error occurred: " + err;
                resHttp.status(400);
            }
            else {
                if(docs.length === 0) {
                    console.log("The user: " + username + " entering to the db with email:" + email + ".");
                    var item = {
                        username: username,
                        email: email,
                        accessToken: accessToken,
                        deviceToken: deviceToken,
                    };
                    userData = new userDataCollection(item);
                }
                else {
                    console.log("The user: " + username + " found in the database, not need to register.");
                    userData = docs[0];
                    userData.accessToken = accessToken;
                    userData.deviceToken = deviceToken;
                }
                userData.save();
                var message = checkWhichPageToReturn(userData);
                result = {"message": message, "accessToken": accessToken, "id": userData.id, "username": userData.username};
                clearTokenFromOtherUsers(userDataCollection, userData.email, userData.deviceToken);
            }

            printAllUsersInDataBase(userDataCollection);
            console.log(result.message);
            resolve(result);
        });
    }); 
}

function loginWithPassword(email, password, deviceToken, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        email = email.toLowerCase().trim();
        console.log("email: " + email + "\npassword: " + password + "\ndevice token: " + deviceToken);
        var result = {"message" : ''};
        var errorMessage = checkValidationLoginData(email, password, resHttp);

        if(errorMessage === false) {
            userDataCollection.find({ 'email': email}, function (err, docs) {
                if(err) {
                    result.message = "An error occurred: " + err;
                    resHttp.status(400);
                }
                else if(docs.length === 0) {
                    result.message = "The email you typed: " + email + " isn't exists. Please check your details or sign up.";
                    resHttp.status(401);
                }
                else if(docs[0].password !== password) {
                    result.message = "The password you have entered is incorrect.\nPlease try again.";
                    resHttp.status(402);
                }
                else {
                    var message = checkWhichPageToReturn(docs[0]);
                    docs[0].accessToken = createAccessToken();
                    docs[0].deviceToken = deviceToken;
                    docs[0].save();
                    result = {"message": message, "accessToken": docs[0].accessToken, "id": docs[0].id, "username": docs[0].username};
                    clearTokenFromOtherUsers(userDataCollection, docs[0].email, docs[0].deviceToken);
                }
                console.log(result.message);
                resolve(result);
            });
        }
        else {
            result.message = errorMessage;
            console.log(result.message);
            resolve(result);
        }
    }); 
}

function signup(username, email, password, confirmPassword, deviceToken, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        email = email.toLowerCase();
        console.log("username: " + username + "\npassword: " + password + "email: " + email + "\nconfirm password: " + confirmPassword + "\ndevice token: " + deviceToken);
        var result = {"message" : ''};
        var errorMessage = checkValidationSignupData(username, email, password, confirmPassword, resHttp);

        if(errorMessage === false) {
            userDataCollection.find({ 'email': email}, function (err, docs) {
                if(err) {
                    resHttp.status(400);
                    result.message  = "An error occurred: " + err;
                }
                else if(docs.length > 0) {
                    resHttp.status(401);
                    result.message  = "This email: " + email + " already in use, try to use another email.";
                }
                else {
                    console.log("This user: " + username + " entering to the db.");
                    var item = {
                        username: username,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword,
                        deviceToken: deviceToken,
                        accessToken: createAccessToken(),
                    };
                    var userData = new userDataCollection(item);
                    userData.save();

                    printAllUsersInDataBase(userDataCollection);
                    var message = "Ok-EntityMissing";
                    result = {"message": message, "accessToken": userData.accessToken, "id": userData.id, "username": userData.username};
                    clearTokenFromOtherUsers(userDataCollection, userData.email, userData.deviceToken);
                }

                console.log(result.message );
                resolve(result);
            });    
        }
        else {
            result.message = errorMessage;
            console.log(result.message );
            resolve(result);
        }
    }); 
}

function removeDeviceToken(id, req, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        var result = {"message" : ''};

        userDataCollection.findByIdAndUpdate(id, {deviceToken: undefined }, function (err, doc) {
            if(err) {
                resHttp.status(400);
                result.message = "An error occurred: " + err;
                resolve(result);
            }
            else {
                console.log("The user: " + doc.username + " has been found, removed the device token successfully.");
                result.message = "Removed the device token successfully.";
                resolve(result);
            }
        });
    });
}

module.exports = { login, loginWithPassword, signup, removeDeviceToken };