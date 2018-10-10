var util = require('../util/util.js');
var constants = require('../constants/constants.js');

const SEMESTER_A_START = new Date('10-31');
const SEMESTER_A_END = new Date('02-06');
const SEMESTER_B_START = new Date('02-20');
const SEMESTER_B_END = new Date('06-18');
const SEMESTER_C_START = new Date('07-10');
const SEMESTER_C_END = new Date('09-08');

const LATITUDE_MTA = 32.047881;
const LONGITUDE_MTA = 34.760674;


function isUserInClassPlace(latitude, longitude, college) {
    if(college === constants.MTA) {
        var centerPoint = {'lat': LATITUDE_MTA, "lng": LONGITUDE_MTA };
        var ky = 40000 / 360;
        var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
        var dx = Math.abs(centerPoint.lng - longitude) * kx;
        var dy = Math.abs(centerPoint.lat - latitude) * ky;
        return Math.sqrt(dx * dx + dy * dy) <= 0.3;
    }   
}

function getSemesterNumber(semesterHebrew) {
    var result;
    switch (semesterHebrew) {
        case "א": { result = 1; break; }
        case "ב": { result = 2; break; }
        case "קיץ": { result = 3; break; }
    }
    return result;
}


function checkIfUserIsInSemesterTime(dayInMonth, monthNumber, semesterHebrew) {
    var semesterNumber = getSemesterNumber(semesterHebrew);
    var startDaySemester, endDaySemster ,startMonthSemster, endMonthSemester;

    switch (semesterNumber) {
        case 1: { startDaySemester = SEMESTER_A_START.getDate(); startMonthSemster = SEMESTER_A_START.getMonth(); endDaySemster = SEMESTER_A_END.getDate(); endMonthSemester = SEMESTER_A_END.getMonth(); break;}
        case 2: { startDaySemester = SEMESTER_B_START.getDate(); startMonthSemster = SEMESTER_B_START.getMonth(); endDaySemster = SEMESTER_B_END.getDate(); endMonthSemester = SEMESTER_B_END.getMonth(); break;}
        case 3: { startDaySemester = SEMESTER_C_START.getDate(); startMonthSemster = SEMESTER_C_START.getMonth(); endDaySemster = SEMESTER_C_END.getDate(); endMonthSemester = SEMESTER_C_END.getMonth(); break;}
    }

    //Need to check...
    return true;
}

function getHebrewdayInWeek(dayNumber) {
    var result;
    switch (dayNumber) {
        case 0: { result = "א"; break; }
        case 1: { result = "ב"; break; }
        case 2: { result = "ג"; break; }
        case 3: { result = "ד"; break; }
        case 4: { result = "ה"; break; }
        case 5: { result = "ו"; break; }
        case 6: { result = "ש"; break; }
    }
    return result;
}

function isUserInClassTime(doc) {
    var timeTable = JSON.parse(doc.timeTable);
    var date = new Date();
    if(!checkIfUserIsInSemesterTime(date.getDate(), date.getMonth(), timeTable.FileFromYedion[0].A)) {
        return false;
    }

    var dayInWeek = getHebrewdayInWeek(date.getDay())
    for (var lesson of timeTable.FileFromYedion) {
        if(lesson.F === dayInWeek) {
            if(util.checkIfTimeIsInTheMinuteOfLesson(date, lesson.G, lesson.H)) {
                return true;
            }  
        }
    }

    return false;
}

function checkIfUserInTheRightConditions(appState, screenState) {
    if(screenState === constants.SCREEN_OFF || (screenState === constants.SCREEN_ON && appState === constants.APP_STATE_ACTIVE)) {
        return true;
    }
    else {
        return false;
    }
}

function updateServer(id, req, userDataCollection, resHttp) {
    var screenState = req.body.screenState;
    var appState = req.body.appState;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    console.log("Screen state: " + screenState + ", App state: " + appState + ", latitude: " + latitude + ", longitude: " + longitude + ", from user id: " + id);
    return new Promise(function(resolve, reject) {
        var result = {"message" : ''};
        userDataCollection.findById(id, function (err, doc) {
            if(err) {
                resHttp.status(400);
                result.message = "An error occurred: " + err;
            }
            else {
                console.log("The user: " + doc.username + " has been found, updating server.");
                doc.lastTimeStampUpdate = new Date();
                try {
                    if(checkIfUserInTheRightConditions(appState, screenState) && isUserInClassTime(doc) && isUserInClassPlace(latitude, longitude, doc.college)) {
                        doc.status = true;
                        console.log("User status update to true.");
                    }
                    else {
                        doc.status = false;
                        console.log("User status update to false.");
                    }

                    doc.save();
                    result.message = "Updated the server successfully.";
                }
                catch(err) {
                    reject(err);
                }
            }

            console.log(result.message);
            resolve(result);
        });  
    });
}

module.exports = { updateServer};