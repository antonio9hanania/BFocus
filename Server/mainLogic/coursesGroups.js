var util = require('../util/util.js');
var constants = require('../constants/constants.js');
var queriesAndSurveysManager = require('./queriesAndSurveys');
var fcmNotificationsAdmin = require('./fcmNotifications');

function buildGroupPositionToReturn(groupsPosition) {
    var result = [];
    var i = 0;
    for(var group of groupsPosition) {
        result.push({"_id": group._id, "groupName": group.groupName, "groupPositionIndex": i});
        i++;
    }

    return result;
}

function getCoursesGroups(id, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        var result = {"message" : '', 'isLecturer': ''  , "groupsPosition": [], "coursesNames": [] };
        userDataCollection.findById(id, function (err, doc) {
            if(err || !doc) {
                resHttp.status(400);
                result.message = "An error occurred: " + err;
            }
            else {
                console.log("The user: " + doc.username + " has been found, getting group list.");
                result.groupsPosition = buildGroupPositionToReturn(doc.groupsPosition);
                result.message = "Got the groups list successfully.";
                result.isLecturer = util.isLecturer(doc);
            }

            console.log(result.message);
            resolve(result);
        });  
    });
}


function checkIfUserAnswered(queryOrSurvey, userId) {
    for(var id of queryOrSurvey.userAnswered) {
        if( id === userId) {
            return true;
        }
    }

    return false;
}

function checkIfUserCanAnswer(doc, queryOrSurvey, isLecturer) {
    if(isLecturer) {
        return true;
    }

    return checkIfUserAnswered(queryOrSurvey, doc.id);
}

function getPublishedQueriesAndSurveys(id, userDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        var result = {"message" : '', "queries": [], "surveys": [] };
        userDataCollection.findById(id, function (err, doc) {
            if(err || !doc) {
                resHttp.status(400);
                result.message = "An error occurred: " + err;
                console.log(result.message);
                resolve(result);
            }
            else {
                console.log("The user: " + doc.username + " has been found, getting queries and surveys if found.");
                var path = "groupsPosition.course";
                var isLecturer = util.isLecturer(doc);
                doc.populate(path,
                    function (err, docAfter) {
                        if (err || !docAfter) {
                            resHttp.status(400);
                            result.message = "An error occurred: " + err;
                            console.log(result.message);
                            resolve(result);
                        }
                        else {
                            var i = 0;
                            for (var courseGroup of docAfter.groupsPosition) {
                                for(var queryOption of courseGroup.course.groups[courseGroup.groupIndex].publishedQueries) {
                                        result.queries.push({groupPositionIndex: i, groupName: courseGroup.course.groups[courseGroup.groupIndex].groupFullName ,value: queryOption, disabled: checkIfUserCanAnswer(doc, queryOption, isLecturer)});
                                }

                                for(var surveyOption of courseGroup.course.groups[courseGroup.groupIndex].publishedSurveys) {
                                        result.surveys.push({groupPositionIndex: i, groupName: courseGroup.course.groups[courseGroup.groupIndex].groupFullName, value: surveyOption, disabled: checkIfUserCanAnswer(doc, surveyOption, isLecturer)});
                                }

                                i++;
                            }

                            result.message = "Successfully updated queries and surveys";
                            console.log(result.message);
                            resolve(result);
                       }
                });
            }
        });  
    });
}

function checkValidExpiryDate(expiryDate) {
    if(util.isEmpty(expiryDate)) {
        return "You have to pick expiry date.";
    }
    else{
        var time  = expiryDate - new Date();
        if(time < constants.VALID_TWENTY_FOUR_HOURS) {
            return "Expiry date must be at least 1 day ahead.";
        }
        else {
            return null;
        }
    }
}

function getDate(expiryDateString) {
    if(util.isEmpty(expiryDateString)) {
        return "";
    }
    else {
        var fullDate = expiryDateString.split('-');
        return new Date(fullDate[0], parseInt(fullDate[1]) - 1, fullDate[2].substr(0,2));
    }
}

function getQueryOrSurveyFromGroup(collection, queryOrSurveyId) {
    for(var item of collection) {
        if(item.id === queryOrSurveyId) {
            return item;
        }
    }

    return null;
}

function getQueryOrSurveyIndexFromGroup(collection, queryOrSurveyId) {
    var i = 0;
    for(var item of collection) {
        if(item.id === queryOrSurveyId) {
            return i; 
        }
        i++;
    }

    return null;
}

function getIndexOfQueryOrSurvey(queryOrSurvey, isQuery, group) {
    var index;

    if(isQuery === true) {
        index = getQueryOrSurveyIndexFromGroup(group.queries, queryOrSurvey._id);
    }
    else if(isQuery === false) {
        index = getQueryOrSurveyIndexFromGroup(group.surveys, queryOrSurvey._id);
    }
    else {
        return null;
    }

    return index;  
}

function updateStudentsAnswerPercentages(group) {
    var i = 0;
    for(studentOption of group.lessons[0].students) {
        var studentOverallStats = group.studentsOverallStats[i];
        var num = studentOverallStats.totalQuestionsAnsweredCounter / group.totalQuestionsCounter;
        studentOverallStats.studentAnswerPercentage = Math.round(num * 100);    
        i++;    
    }
}

function publishQueryOrSurvey(id, reqHttp, userDataCollection, admin, resHttp) {
    var groupPositionIndex = reqHttp.body.groupPositionIndex;
    var coursePositionIndex = reqHttp.body.coursePositionIndex;
    var isQuery = util.getIsQueryBoolean(reqHttp);
    var queryOrSurveyId = reqHttp.body.queryOrSurveyId;
    var expiryDate = getDate(reqHttp.body.expiryDate);

    return new Promise(function(resolve, reject) {
        var result = {"message" : ''};
        var errorMessageDate = checkValidExpiryDate(expiryDate);
        if(errorMessageDate !== null ) {
            resHttp.status(401);
            result.message = errorMessageDate;
            console.log(result.message);
            resolve(result);
        }
        else { 
            queriesAndSurveysManager.findQueryOrSurvey(id, coursePositionIndex, isQuery, queryOrSurveyId, userDataCollection, function(error, user, indexOfQueryOrSurvey, queriesOrSurveys){
            if(error !== null) {
                resHttp.status(400);
                result.message = "Couldn't find document due: " + error;
                console.log(result.message);
                resolve(result);
            }
            else {
                console.log("expiryDate:" + expiryDate);
                var path = "groupsPosition." + groupPositionIndex + ".course";
                var groupPositionDesired = user.groupsPosition[groupPositionIndex];

                user.populate(path, function (err, lecturer) {
                    if (err) {
                        resHttp.status(400);
                        result.message = "An error occurred: " + err;
                    }
                    else {
                        var queryOrSurvey = queriesOrSurveys[indexOfQueryOrSurvey];
                        console.log("The user: " + lecturer.username + " has been found, publishing " + (isQuery === true ? "Query" : "Survey"));
                        var group;
                        var newQueryOrSurveyToPublish = { question: queryOrSurvey.question, answers: queryOrSurvey.answers, winner: undefined, expiryDate: expiryDate, userAnswered: [] };
                        
                        if(isQuery === true) {
                            group = lecturer.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex].publishedQueries;                             
                        }
                        else { 
                            group = lecturer.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex].publishedSurveys;          
                        }
                        
                        lecturer.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex].totalQuestionsCounter++;
                        group.push(newQueryOrSurveyToPublish);
                        updateStudentsAnswerPercentages(lecturer.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex]);
                        lecturer.groupsPosition[groupPositionIndex].course.save();
                        fcmNotificationsAdmin.sendNotificationToAllRegisteredStudents(admin, isQuery, lecturer.groupsPosition[groupPositionIndex].course, groupPositionDesired.groupIndex);
                        
                        result.message = "Successfully published " + (isQuery ? "Query" : "Survey");
                    }

                    console.log(result.message);
                    resolve(result);
                });

            }
            });
        }
    });
}

function findPublishedQueryOrSurvey(id, reqHttp, isQuery, groupPositionIndex, userDataCollection, callback) {
    var queryOrSurveyId = reqHttp.body.queryOrSurveyId;
    var error = null;

    userDataCollection.findById(id, function (err, doc) {
        if(err || !doc) {
            error =  "An error occurred: " + err;
            callback(error);
        }
        else {
            var path = "groupsPosition." + groupPositionIndex + ".course";
            var groupPositionDesired = doc.groupsPosition[groupPositionIndex];

            doc.populate(path,
            function (err, user) {
                if (err) {
                    error = "An error occurred: " + err;
                }
                else {
                    console.log("The user: " + user.username + " has been found and the doc");
                    var group = user.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex];
                    var queryOrSurveyDesired = null;

                    if(isQuery === true) {
                        queryOrSurveyDesired = getQueryOrSurveyFromGroup(group.publishedQueries, queryOrSurveyId);
                    }
                    else if(isQuery === false) {
                        queryOrSurveyDesired = getQueryOrSurveyFromGroup(group.publishedSurveys, queryOrSurveyId);
                    }

                    if(queryOrSurveyDesired === null) {
                        error = "Could not found the desired doc";  
                    }

                    callback(error, user, queryOrSurveyDesired, group);
                }
            }); 
         }  
    });
}

function updateUserAnswerInGroup(group, user) {
    var index = 0, found = false;
    for(studentOption of group.lessons[0].students) {
        if(studentOption._id.equals(user._id) === true) {
            found = true;
            break;
        }
        index++;
    }

    if(found === false) {
        console.log("Couldn't update user in group");
    }
    else {
        var studentOverallStats = group.studentsOverallStats[index];
        studentOverallStats.totalQuestionsAnsweredCounter++;
        var num = studentOverallStats.totalQuestionsAnsweredCounter / group.totalQuestionsCounter;
        studentOverallStats.studentAnswerPercentage = Math.round(num * 100);        
    }
}

function uploadAnswerToQueryOrSurvey(id, reqHttp, userDataCollection, resHttp) {
    var isQuery = util.getIsQueryBoolean(reqHttp);
    var selectedAnswerIndex = reqHttp.body.selectedAnswerIndex;
    var topAnswerPossibleIndex = isQuery ?  3 : 4;
    var groupPositionIndex = reqHttp.body.groupPositionIndex;
    var queryOrSurveyString = isQuery ? "Query" : "Survey";

    return new Promise(function(resolve, reject) {
        resHttp.status(400);
        var result = {"message" : ''};
        findPublishedQueryOrSurvey(id, reqHttp, isQuery, groupPositionIndex, userDataCollection, function(error, user, queryOrSurvey, group){
            if(error !== null) {
                result.message = error;
            }
            else if(util.isLecturer(user)) {
                result.message = "The user is a lecturer and only a student can submit answer";  
            }    
            else if (util.isEmpty(selectedAnswerIndex) || selectedAnswerIndex < 0 || selectedAnswerIndex > topAnswerPossibleIndex) {
                result.message = "User answer index isn't valid for this: " + queryOrSurveyString;
            }
            else if (checkIfUserAnswered(queryOrSurvey, user.id)) {
                result.message = "User already answered to this " + queryOrSurveyString;
            }       
            else {
                queryOrSurvey.answers[selectedAnswerIndex].votersCounter++;
                queryOrSurvey.userAnswered.push(user.id);
                updateUserAnswerInGroup(group, user);
                user.groupsPosition[groupPositionIndex].course.save();

                resHttp.status(200);
                result.message = "Successfully uploaded answer to " + queryOrSurveyString;
            }

            console.log(result.message);
            resolve(result);
        });
    });     
}


function buildStudentOverallStats(course, innerGroupIndex, callback) {
    var studentsOverallStats = [];
    var path = "groups." + innerGroupIndex + ".lessons.0.students";
    course.populate(path, async function(err, courseAfter) {
        if (err) { 
            callback(err);
        }
        else {
            var group = courseAfter.groups[innerGroupIndex];
            var i = 0;
            for(var student of group.lessons[0].students) {
                var studentStats = group.studentsOverallStats[i];
                //studentsOverallStats.push({"name": student.username, "score": studentStats.studentLackUsageScore, "answerPrecentage": studentStats.studentAnswerPercentage  });
                studentsOverallStats.push([i + 1, student.username, studentStats.studentAnswerPercentage, studentStats.studentLackUsageScore ]);
                
                i++;
            }
            
            await studentsOverallStats.sort((a, b) => Number(b.score) - Number(a.score));
            callback(null, studentsOverallStats);
        }
    });
}

function returnCurrentOrNextLessonOfGroup(lessons) {
    var date = new Date();

    for(let i = date.getDay(); i < 7; i=(i+1)% 7) {
        for(let j = 0; j < lessons.length; j++ ) {
            if(lessons[j].dayInWeek === i) {
                return lessons[j];
            }
        }
     
    }
}

function getLessonsStudentsData(id, reqHttp, userDataCollection, resHttp) {
    var groupPositionIndex = parseInt(reqHttp.headers.grouppositionindex);

    return new Promise(function(resolve, reject) {
        var result = {"message" : '', "studentsOverallStats": [], "currOrNextLesson": '', "isLessonInCurrentDay": false };
            userDataCollection.findById(id, function (err, doc) {
                if(err || !doc) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;
                    console.log(result.message);
                    resolve(result);
                }
                else {
                    var path = "groupsPosition." + groupPositionIndex + ".course";
                    var groupPositionDesired = doc.groupsPosition[groupPositionIndex];

                    doc.populate(path,
                    function (err, user) {
                        if (err) {
                            resHttp.status(400);
                            result.message = "An error occurred: " + err;
                            console.log(result.message);
                            resolve(result);
                        }
                        else {
                            console.log("The user: " + user.username + " has been found, returning students data of lessons.");
                            var group = user.groupsPosition[groupPositionIndex].course.groups[groupPositionDesired.groupIndex]; 
                            result.currOrNextLesson = returnCurrentOrNextLessonOfGroup(group.lessons);
                            result.isLessonInCurrentDay  = result.currOrNextLesson.dayInWeek === new Date().getDay();

                            buildStudentOverallStats(user.groupsPosition[groupPositionIndex].course, groupPositionDesired.groupIndex, function(error, studentsOverallStats) {
                                if(error === null) {
                                    result.studentsOverallStats = studentsOverallStats;
                                    result.message = "Retrieved lessons students data successfully";
                                }
                                else {
                                    resHttp.status(400);
                                    result.message = "An error occurred: " + error;
                                }

                                console.log(result.message);
                                resolve(result);

                            });    
                        }
                    });
                }   
            });
        });
}

module.exports = { getCoursesGroups, getPublishedQueriesAndSurveys, publishQueryOrSurvey, uploadAnswerToQueryOrSurvey, getLessonsStudentsData };