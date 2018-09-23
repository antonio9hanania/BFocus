var constants = require('../constants/constants.js');

function isEmpty(val){
    return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function printAllUsersInDataBase(userDataCollection) {
    console.log("---Printing all the users in the database: ");
    userDataCollection.countDocuments({}, function( err, count){
        console.log( "Number of users:", count );
    })

    userDataCollection.find({}, function (err, docs) {
        if(err) {
            console.log(err);
        }
        else {docs.forEach((user) => {
                console.log(user);
            });
        }
    });
}

function getHours(hourAndMinute) {
    var hours = hourAndMinute.split(":")[0];
    return parseInt(hours);
}

function getMinutes(hourAndMinute) {
    var minutes = hourAndMinute.split(":")[1];
    return parseInt(minutes);
}

function checkIfTimeIsInTheMinuteOfLesson(date, startLessonString, endLessonString) {
    var currentHours = date.getHours();
    var currentMinutes = date.getMinutes();
    var hoursStart = getHours(startLessonString);
    var minutesStart = getMinutes(startLessonString);
    var hoursEnd = getHours(endLessonString);
    var minutesEnd = getMinutes(endLessonString);

   if(currentHours >= hoursStart && currentHours <= hoursEnd) {
       if(currentHours > hoursStart || currentMinutes >= minutesStart) {
           if(currentHours < hoursEnd || currentMinutes <= minutesEnd) {
               return true;
           }
       } 
   }

   return false;
}

function isLecturer(doc) {
    return doc.entity === constants.LECTURER
}

function getIsQueryBoolean(reqHttp) {
    return reqHttp.headers.isquery === "true";
}

module.exports = { isEmpty, printAllUsersInDataBase, checkIfTimeIsInTheMinuteOfLesson, isLecturer, getIsQueryBoolean };