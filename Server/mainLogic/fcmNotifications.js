var util = require('../util/util.js');

function sendMessageToAllDevices(users, admin, message) {
    for(let user of users) {
        if(!util.isEmpty(user.deviceToken)) {
            message.token = user.deviceToken;
            admin.messaging().send(message)
            .then((response) => {         
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
        }
    }
}

var message = {
    android: {
        ttl: 3600 * 1000, // 1 hour in milliseconds
        priority: 'high',
            //  notification: {
            //    title: 'lecture submision',
            //    body: 'New query published',
            //    //icon:  require('./ic_launcher'),
            //    sound: "default", 
            //  },
         data: {
             body : "New query published!",
             title : "New Update",
             sound : "default",
             toastForeground : "true",
             //color: '#f45342',
         }
    },
    token : ''
};

function sendNotificationToAllRegisteredStudents(admin, isQuery, course, innerGroupIndex) {
    var path = "groups." + innerGroupIndex + ".lessons.0.students";
    var queryOrSurveyString = isQuery ? "Query" : "Survey";
    message.android.data.body = "You have a new " + queryOrSurveyString;

    course.populate(path, function(err, courseAfter) {
        if (err) { 
            console.log(" Erorr happened during populate: " + err);
        }
        else {
            sendMessageToAllDevices(courseAfter.groups[innerGroupIndex].lessons[0].students, admin, Object.assign({}, message));   
        }
    });
}

module.exports = { sendNotificationToAllRegisteredStudents }