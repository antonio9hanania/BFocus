var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var loginLogic = require('./loginLogic/login.js');
var entitySelectionLogic = require('./loginLogic/entity.js');
var uploadTimeTableLogic = require('./loginLogic/uploadTimeTable.js');
var updateServerLogic = require('./mainLogic/updateStatus.js');
var backgroundTask = require('./mainLogic/updateDataBaseBackground.js');
var coursesGroups = require('./mainLogic/coursesGroups.js');
var constants = require('./constants/constants.js');
var queriesAndSurveysManager = require('./mainLogic/queriesAndSurveys.js');
var admin = require('firebase-admin');
var serviceAccount = require('./bfocus-37efa-firebase-adminsdk-c6160-b54fee7c9b.json');
var excellManager = require('./mainLogic/excellTable.js');
const querystring = require('querystring');
var fs = require('fs');
require('./modules/Idea');
var userDataCollection = mongoose.model('allUsers');
var courseDataCollection = mongoose.model('allCourses');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bfocus-37efa.firebaseio.com/'
});


mongoose.connect('mongodb://localhost:27017/startidea-db', { useNewUrlParser: true }).then(() => {
    console.log('Connected to the database in mongo.')
}).catch(err => console.log('Some error occurred' + err));

function deleteAllDataBase() {
    courseDataCollection.remove((err) => { 
        if(err) {
            console.log("Err: " +err);
        }
        else {
            console.log("Success delete courses");
            userDataCollection.remove((err) => { 
                if(err) {
                    console.log("Err: " +err);
                }
                else {
                    console.log("Success delete users");
                    
                }
            });
        }
    });
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    
});



app.use(bodyParser.json()); // for parsing application/json

app.post('/Login', function (req, res) {
    console.log('Server got login request: ');
    var username = req.body.username;
    var email = req.body.email;
    var accessToken = req.body.accessToken;
    var deviceToken = req.body.deviceToken;

    loginLogic.login(username, email, accessToken, deviceToken, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/LoginWithPassword', function (req, res) {
    console.log('Server got login request with password: ');
    var email = req.body.email;
    var password = req.body.password;
    var deviceToken = req.body.deviceToken;

    loginLogic.loginWithPassword(email, password, deviceToken, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/SignUp', function (req, res) {
    console.log('Server got sign up request: ');
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    var deviceToken = req.body.deviceToken;

    loginLogic.signup(username, email, password, confirmPassword, deviceToken, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});



app.post('/EntitySelection', function (req, res) {
    console.log("Got entity type request.");
    var entity = req.body.entity;
    var college = req.body.college;
    var id = req.headers.id;

    entitySelectionLogic.uploadEntity(id, entity, college, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});



var busboy = require('connect-busboy');
//...
app.use(busboy());
//...
app.post('/TimeTableUpload', function (req, res) {
    console.log("Got time table upload request.");
    var id = req.headers.id;

    uploadTimeTableLogic.uploadTimeTable(id, req, userDataCollection, courseDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/UpdateServer', function (req, res) {
    console.log("Got update server request.");
    var id = req.headers.id;

    updateServerLogic.updateServer(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});


app.post('/RemoveDeviceToken', function (req, res) {
    console.log("Got RemoveDeviceToken request.");
    var id = req.headers.id;

    loginLogic.removeDeviceToken(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.get('/GetCoursesGroupsList', function (req, res) {
    console.log("Got get courses groups List request.");
    var id = req.headers.id;

    coursesGroups.getCoursesGroups(id, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});


app.post('/DeleteTimeTable', function (req, res) {
    console.log("Got delete time table request.");
    var id = req.headers.id;

    uploadTimeTableLogic.deleteTimeTableFromUser(id, userDataCollection, courseDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.get('/RefreshQueriesAndSurveys', function (req, res) {
    console.log("Got refresh queries and surveys request.");
    var id = req.headers.id;

    coursesGroups.getPublishedQueriesAndSurveys(id, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/UploadQueryOrSurvey', function (req, res) {
    console.log("Got upload query or servey request.");
    var id = req.headers.id;

    queriesAndSurveysManager.uploadQueryOrSurvey(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/DeleteQueryOrSurvey', function (req, res) {
    console.log("Got DeleteQueryOrSurvey request.");
    var id = req.headers.id;

    queriesAndSurveysManager.deleteQueryOrSurvey(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/PublishQueryOrSurvey', function (req, res) {
    console.log("Got publish query or servey request.");
    var id = req.headers.id;

    coursesGroups.publishQueryOrSurvey(id, req, userDataCollection, admin, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

app.post('/UploadAnswerToQueryOrSurvey', function (req, res) {
    console.log("Got answer to query or servey request.");
    var id = req.headers.id;

    coursesGroups.uploadAnswerToQueryOrSurvey(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});


app.get('/GetLessonsStudentsData', function (req, res) {
    console.log("Got GetLessonsStudentsData request.");
    var id = req.headers.id;

    coursesGroups.getLessonsStudentsData(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});

////////////////////////////////////////////////////////////////
/*app.get('/ExportToExcelFile', function (req, res) {
    console.log("Got ExportToExcelFile request.");
    var data = [
        ['a', 'b', 'c'],
        ['a', 'e', 'c'],
        ['d', 'b', 'c']
    ];

    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Sheet 1');

    data.forEach(function (value1, i) {
        value1.forEach(function (value2, j) {
            worksheet.cell(i + 1, j + 1).string(value2);
        });
    });
    workbook.write('Excel.xlsx');
    var file = './Excel.xlsx';
    res.download(file);
});
app.get('/removeExcelFile', function (req, res) {
    fs.exists('./Excel.xlsx', (exists) => {
        if (exists) {
            fs.unlink('./Excel.xlsx', (err) => {

                console.log('path/file.txt was deleted');
            });
        }
    });

});

*/
/////////////////////////////////////////////////////////////////////////////////////
app.get('/DownloadExcelFile', function(req, res) {
    console.log("got DownloadExcelFile request ");
    excellManager.downloadExcelFile(req, res);
});

app.post('/ExportToExcelFile', function (req, res) { 
    console.log("Got ExportToExcelFile request.");
   
    excellManager.createExcellTable(req)
    .then((response) => {
        console.log("response to export to excell file: " , response.message);
        res.json(response);
    })
    .catch((err) => {
        console.log("An exception occured: " + err);
        res.status(400);
        res.json({"message" : "An error occured: " + err});
    });
});

app.get('/removeExcelFile', function (req, res) {
    console.log("Got removeExcelFile request.");
    res.send(excellManager.removeExcelFile(req));
});

app.get('/GetCoursesQueriesAndSurveysForLecturer', function (req, res) {
    console.log("Got GetCoursesQueriesAndSurveysForLecturer request.");
    var id = req.headers.id;

    queriesAndSurveysManager.getCoursesQueriesAndSurveysForLecturer(id, req, userDataCollection, res)
        .then((response) => res.json(response))
        .catch((err) => {
            console.log("An exception occured: " + err);
            res.status(400);
            res.json({ "message": "An error occured: " + err });
        });
});


var intervalExpiredQueriesAndSurveys = setInterval(backgroundTask.updateQueriesAndSurveys, constants.VALID_TWENTY_FOUR_HOURS, courseDataCollection);
//var intervalExpiredQueriesAndSurveys = setTimeout( backgroundTask.updateQueriesAndSurveys, 1000, courseDataCollection);

var intervalBackground = setInterval(backgroundTask.updateDataBase, 10000, courseDataCollection, userDataCollection);
//var intervalBackground = setTimeout(backgroundTask.updateDataBase, 1000, courseDataCollection, userDataCollection);


//var intervalStudentsScoreBackground = setInterval(backgroundTask.updateStudentsScoresInGroups, constants.VALID_TWENTY_FOUR_HOURS, courseDataCollection, userDataCollection);
var intervalStudentsScoreBackground = setTimeout(backgroundTask.updateStudentsScoresInGroups, 1000, courseDataCollection, userDataCollection);


//var s = setTimeout(backgroundTask.deleteArrayStudentDaily, 1000, userDataCollection);