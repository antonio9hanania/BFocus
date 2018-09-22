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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

mongoose.connect('mongodb://localhost:27017/startidea-db', { useNewUrlParser: true }).then(() => {
    console.log('Connected to the database in mongo.')
}).catch( err => console.log('Some error occurred' + err));

require('./modules/Idea');
var userDataCollection = mongoose.model('allUsers');
var courseDataCollection = mongoose.model('allCourses');

app.use(bodyParser.json()); // for parsing application/json

app.post('/Login', function (req, res) {
	console.log('Server got login request: ');
    var username = req.body.username;
    var email = req.body.email;
    var accessToken = req.body.accessToken;

    loginLogic.login(username, email, accessToken, userDataCollection, res)
    .then((response) => res.json(response));
});

app.post('/LoginWithPassword', function (req, res) {
	console.log('Server got login request with password: ');
	var email = req.body.email;
    var password = req.body.password;
    
    loginLogic.loginWithPassword(email, password, userDataCollection, res)
    .then((response) => res.json(response));
});

app.post('/SignUp', function (req, res) {
	console.log('Server got sign up request: ');
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    
    loginLogic.signup(username, email, password, confirmPassword, userDataCollection, res)
    .then((response) => res.json(response));
});

app.post('/EntitySelection', function(req, res) {
    console.log("Got entity type request.");
    var entity = req.body.entity;
    var college = req.body.college;
    var id = req.headers.id;

    entitySelectionLogic.uploadEntity(id, entity, college, userDataCollection, res)
    .then((response) => res.json(response));
}); 



var busboy = require('connect-busboy');
//...
app.use(busboy()); 
//...
app.post('/TimeTableUpload', function(req, res) {
    console.log("Got time table upload request.");
    var id = req.headers.id;

    uploadTimeTableLogic.uploadTimeTable(id, req, userDataCollection, courseDataCollection, res)
    .then((response) => res.json(response));
});

app.post('/UpdateServer', function(req, res) {
    console.log("Got update server request.");
    var id = req.headers.id;

    updateServerLogic.updateServer(id, req, userDataCollection, res)
    .then((response) => res.json(response));
});

app.get('/GetCoursesGroupsList', function(req, res) {
    console.log("Got get courses groups List request.");
    var id = req.headers.id;

    coursesGroups.getCoursesGroups(id, userDataCollection, res)
    .then((response) => res.json(response));
});

app.post('/DeleteTimeTable', function(req, res) {
    console.log("Got delete time table request.");
    var id = req.headers.id;

    uploadTimeTableLogic.deleteTimeTableFromUser(id, userDataCollection, courseDataCollection, res)
    .then((response) => res.json(response));

});

app.get('/RefreshQueriesAndSurveys', function(req, res) {
    console.log("Got refresh queries and surveys request.");
    var id = req.headers.id;

    coursesGroups.getPublishedQueriesAndSurveys(id, userDataCollection, res)
    .then((response) => res.json(response));

});

app.post('/UploadQueryOrSurvey', function(req, res) {
    console.log("Got upload query or servey request.");
    var id = req.headers.id;

    queriesAndSurveysManager.uploadQueryOrSurvey(id, req, userDataCollection, res)
    .then((response) => res.json(response));

});

app.post('/DeleteQueryOrSurvey', function(req, res) {
    console.log("Got DeleteQueryOrSurvey request.");
    var id = req.headers.id;

    queriesAndSurveysManager.deleteQueryOrSurvey(id, req, userDataCollection, res)
    .then((response) => res.json(response));

});

app.post('/PublishQueryOrSurvey', function(req, res) {
    console.log("Got publish query or servey request.");
    var id = req.headers.id;

    coursesGroups.publishQueryOrSurvey(id, req, userDataCollection, res)
    .then((response) => res.json(response));

});

app.post('/UploadAnswerToQueryOrSurvey', function(req, res) {
    console.log("Got answer to query or servey request.");
    var id = req.headers.id;

    coursesGroups.uploadAnswerToQueryOrSurvey(id, req, userDataCollection, res)
    .then((response) => res.json(response));

});


app.get('/GetLessonsStudentsData', function(req, res) {
    console.log("Got GetLessonsStudentsData request.");
    var id = req.headers.id;

    coursesGroups.getLessonsStudentsData(id, req, userDataCollection, res)
    .then((response) => res.json(response));
});

app.get('/GetCoursesQueriesAndSurveysForLecturer', function(req, res) {
    console.log("Got GetCoursesQueriesAndSurveysForLecturer request.");
    var id = req.headers.id;

    queriesAndSurveysManager.getCoursesQueriesAndSurveysForLecturer(id, req, userDataCollection, res)
    .then((response) => res.json(response));
});


//var intervalExpiredQueriesAndSurveys = setInterval( backgroundTask.updateQueriesAndSurveys, constants.VALID_TWENTY_FOUR_HOURS, courseDataCollection);
//var intervalExpiredQueriesAndSurveys = setTimeout( backgroundTask.updateQueriesAndSurveys, 1000, courseDataCollection);

//var intervalBackground = setInterval(backgroundTask.updateDataBase, 10000, courseDataCollection, userDataCollection);
//var intervalBackground = setTimeout(backgroundTask.updateDataBase, 1000, courseDataCollection, userDataCollection);


//var intervalStudentsScoreBackground = setInterval(backgroundTask.updateStudentsScoresInGroups, constants.VALID_TWENTY_FOUR_HOURS, courseDataCollection, userDataCollection);
//var intervalStudentsScoreBackground = setTimeout(backgroundTask.updateStudentsScoresInGroups, 1000, courseDataCollection, userDataCollection);


//var s = setTimeout(backgroundTask.deleteArrayStudentDaily, 1000, userDataCollection);