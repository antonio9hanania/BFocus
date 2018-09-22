var util = require('../util/util.js');
var constants = require('../constants/constants.js');

function getCoursesQueriesAndSurveysForLecturer(id, reqHttp, userDataCollection, resHttp)  {
    return new Promise(function(resolve, reject) {
        var result = { "message": '', "courses" : []};
        userDataCollection.findById(id, function (err, doc) {
            if(err || !doc) {
                resHttp.status(400);
                result.message = "An error occurred: " + err;
            }
            else { 
                console.log("Found user collecting courses");
                result.courses = doc.queriesAndSurveys;
                result.message = "Got the groups list successfully.";   
            }

            console.log(result.message);
            resolve(result);
        });
    });
}

function getIndexOfQueryOrSurvey(queryOrSurveyId, queriesOrSurveys) {
    var i = 0;
    for(var option of queriesOrSurveys) {
        if(option.id === queryOrSurveyId) {
            return i;
        }

        i++;
    }

    return null;
}

function uploadQueryOrSurvey(id, reqHttp, userDataCollection, resHttp) {
    var coursePositionIndex = reqHttp.body.coursePositionIndex;
    var isQuery = util.getIsQueryBoolean(reqHttp);
    var editMode = reqHttp.body.editMode;
    var queryOrSurvey = reqHttp.body.queryOrSurvey;
    var question = reqHttp.body.question;
	var answer1 = reqHttp.body.answer1;
	var answer2 = reqHttp.body.answer2;
    var answer3 = reqHttp.body.answer3;
    var answer4 = reqHttp.body.answer4;
    var answer5 = reqHttp.body.answer5;

    return new Promise(function(resolve, reject) {
        var result = {"message" : ''};
            userDataCollection.findById(id, function (err, doc) {
                if(err || !doc) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;  
                }
                else if(util.isEmpty(question)) {
                    resHttp.status(401);
                    result.message = "Question must not be empty";
                }
                else {
                    console.log("Question: " + question + " answer1: " + answer1 + " answer2: " + answer2 + " answer3: " + answer3 + " answer4: " + answer4 + " answer5: " + answer5);
                    var queriesOrSurveys = isQuery === true ? doc.queriesAndSurveys[coursePositionIndex].queries : doc.queriesAndSurveys[coursePositionIndex].surveys;
                    var newQueryOrSurvey;

                    if(isQuery === true) {
                        newQueryOrSurvey = { question: question, answers: [{ text: answer1, votersCounter: 0}, {text: answer2, votersCounter: 0}, {text: answer3, votersCounter: 0}, {text: answer4, votersCounter: 0}], winner: undefined };
                    }
                    else {
                        newQueryOrSurvey = { question: question, answers: [{ text: answer1, votersCounter: 0}, {text: answer2, votersCounter: 0}, {text: answer3, votersCounter: 0}, {text: answer4, votersCounter: 0}, {text: answer5, votersCounter: 0}]};  
                    }

                    if(editMode === true) {
                        var indexOfQueryOrSurveyEditMode = getIndexOfQueryOrSurvey(queryOrSurvey._id, queriesOrSurveys);
                        if(indexOfQueryOrSurveyEditMode === null) {
                            resHttp.status(400);
                            result.message = "Couldn't find the desired doc to edit";
                        }
                        else {
                            queriesOrSurveys.splice(indexOfQueryOrSurveyEditMode, 1, newQueryOrSurvey);
                            result.message = "Successfully edited " + (isQuery ? "Query" : "Survey");
                        }
                    }
                    else {
                        queriesOrSurveys.push(newQueryOrSurvey);
                        result.message = "Successfully uploaded " + (isQuery ? "Query" : "Survey");
                    }

                    doc.save();      
                 }

                console.log(result.message);
                resolve(result);
        });
    });
}

function findQueryOrSurvey(id, coursePositionIndex, isQuery, queryOrSurveyId, userDataCollection, callback) {
    var error = null;
    userDataCollection.findById(id, function (err, doc) {
        if(err || !doc) {
            error = "An error occurred: " + err;  
            callback(error);
        }
        else {
            console.log("Found user looking for the document.");
            var queriesOrSurveys = isQuery === true ? doc.queriesAndSurveys[coursePositionIndex].queries : doc.queriesAndSurveys[coursePositionIndex].surveys;
            var indexOfQueryOrSurvey= getIndexOfQueryOrSurvey(queryOrSurveyId, queriesOrSurveys);
            if(indexOfQueryOrSurvey === null) {     
                error = "Couldn't find the desired doc.";
                callback(error);
            }
            else {
                console.log("Found the document.");
                callback(error, doc, indexOfQueryOrSurvey, queriesOrSurveys);
            }      
        }
    });
}

function deleteQueryOrSurvey(id, reqHttp, userDataCollection, resHttp) {
    var coursePositionIndex = reqHttp.body.coursePositionIndex;
    var isQuery = util.getIsQueryBoolean(reqHttp);
    var queryOrSurveyId = reqHttp.body.queryOrSurvey._id;

    return new Promise(function(resolve, reject) {
        var result = {"message" : ''};
        findQueryOrSurvey(id, coursePositionIndex, isQuery, queryOrSurveyId, userDataCollection, function(error, user, indexOfQueryOrSurvey, queriesOrSurveys){
            if(error !== null) {
                resHttp.status(400);
                result.message = "Couldn't delete document due: " + error;
            }
            else {
                queriesOrSurveys.splice(indexOfQueryOrSurvey, 1);
                result.message = "Successfully deleted " + (isQuery ? "Query" : "Survey");
                user.save();  
            }
            
            console.log(result.message);
            resolve(result);
        });
    });
}


module.exports = { getCoursesQueriesAndSurveysForLecturer, uploadQueryOrSurvey, deleteQueryOrSurvey, findQueryOrSurvey }