var util = require('../util/util.js');
const excelToJson = require('convert-excel-to-json');
var fs = require('fs');
var constants = require('../constants/constants.js');
const groupNamesOptions = require('./groupNamesOptions');
const groupNames = groupNamesOptions.groupNames;

function parseExcelFileToJson(file, doc) {
    const result = excelToJson({
        sourceFile: file,
        header:{
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 2 // 2, 3, 4, etc.
        }
    });
    console.log(result);
    doc.timeTable = JSON.stringify(result);
   // doc.save();
}

function saveCourses(coursesToSave) {
    for(var course of coursesToSave) {
        course.save();
    }
}

function addZeroToNumberIfNeed(number) {
    return number <= 9 ? ("0" + number) : number.toString(); 
}

function createNextTimeStampToEnter(time, additionOnTime) {
    var hours = parseInt(time.split(":")[0]);
    var minutes = parseInt(time.split(":")[1]);

    if(minutes + additionOnTime >= 60) {
        hours++; 
    }

    minutes = (minutes + additionOnTime) % 60;
    var minutesStringToAdd = addZeroToNumberIfNeed(minutes); 
    var hourStringToAdd = addZeroToNumberIfNeed(hours); 

    return hourStringToAdd + ":" + minutesStringToAdd;
}

function createLessonsDatesOption(startTime, endTime, additionOnTime, halfHourAtEnd) {
    var result = [ startTime ];
    var lastTimeStampEntered = startTime;
    var nextTimeStampToEnter;

    while(lastTimeStampEntered !== endTime) {
        console.log("time entered: " + lastTimeStampEntered);
        if(result.length === 5 && halfHourAtEnd === true && additionOnTime === 45) {
            nextTimeStampToEnter = createNextTimeStampToEnter(lastTimeStampEntered, 30);
        }
        else if(result.length === 6 && halfHourAtEnd === true && additionOnTime === 60) {
            nextTimeStampToEnter = createNextTimeStampToEnter(lastTimeStampEntered, 30);
        }
        else {
            nextTimeStampToEnter = createNextTimeStampToEnter(lastTimeStampEntered, additionOnTime);
        }

        result.push(nextTimeStampToEnter);
        lastTimeStampEntered = nextTimeStampToEnter;
    }

    console.log(result);
    return result;
}

function createLessonsDates(startTime, endTime) {
    var result = [];
    var additionOnTime = 15, halfHourAtEnd;
    do {
        halfHourAtEnd = additionOnTime >= 45 ? !halfHourAtEnd : false;
        result = createLessonsDatesOption(startTime, endTime, additionOnTime, halfHourAtEnd);
        additionOnTime = halfHourAtEnd === true ? additionOnTime : additionOnTime + 15;

    } while( result.length > 7);

    console.log(result);
    return result;
}

function returnGroupName(lessonName) {
    for(var i=0; i< groupNames.length; i++) {
        if(lessonName.includes(groupNames[i])) {
            return groupNames[i];
        }
    }

    return lessonName;
}

function getNumberwdayInWeek(dayNumber) {
    var result;
    switch (dayNumber) {
        case "א": { result = 0; break; }
        case "ב": { result = 1; break; }
        case "ג": { result = 2; break; }
        case "ד": { result = 3; break; }
        case "ה": { result = 4; break; }
        case "ו": { result = 5; break; }
        case "ש": { result = 6; break; }
    }
    return result;
}

function createNewLesson(lesson) {
    var dates = createLessonsDates(lesson.G, lesson.H);
      
    return {
        dates: dates,
        dayInWeek: getNumberwdayInWeek(lesson.F),
        lessonName: lesson.C,
        lecturerName: lesson.E,
        studentsId: [],
        studentsActivityPercentage: [],
    }
}

function getClearGroupName(name) {
     var result =  name.replace(/<br>/g,"").replace(/ <b>/g,"").replace(/<\/b>/g,"");
     console.log("The clear group full name:" + result);
     return result;
}

function createNewGroup(lesson, groupName) {
    var newLessonToAdd = createNewLesson(lesson);

    return {
        groupName: groupName,
        groupFullName: getClearGroupName(lesson.C),
        lessons: [ newLessonToAdd ],
    }
}

function createNewCourse(lesson, groupName, courseDataCollection) {
    var newGroupToAdd = createNewGroup(lesson, groupName);

    var course = {
        code: lesson.B,
        groups: [ newGroupToAdd ],
    };
    courseData = new courseDataCollection(course);
    return courseData;
}

function returnLessonIfExists(lesson, allLessons) {
    for(var lessonToCheck of allLessons) {
        if(lessonToCheck.lecturerName === lesson.E  && lessonToCheck.dayInWeek === getNumberwdayInWeek(lesson.F) && lessonToCheck.dates[0] === lesson.G && lessonToCheck.dates[lessonToCheck.dates.length -1] === lesson.H) {
            return lessonToCheck;
        }
        /*if(lessonToCheck.lecturerName === lesson.E) {
            if(lessonToCheck.dayInWeek === getNumberwdayInWeek(lesson.F)){
                if(lessonToCheck.dates[0] === lesson.G) {
                    if(lessonToCheck.dates[lessonToCheck.dates.length -1] === lesson.H) {
                        console.log("aa");
                    }
                }
            }
        }*/
    }

    return null;
}

function addGroupIfNeed(lesson, course, groupName, courseDataCollection) {
    for(var i=0; i < course.groups.length; i++) {
        if(course.groups[i].groupName === groupName) {
            var lessonInDb = returnLessonIfExists(lesson, course.groups[i].lessons);
            if(lessonInDb) {
                console.log("Not need to add the lesson: " + lesson.C + " already exists.")
                return;
            }
            else {
                console.log("Adding new lesson: " + lesson.C + ".")
                var newLessonToAdd = createNewLesson(lesson);
                course.groups[i].lessons.push(newLessonToAdd);
                return;
            }
        }
    }
    //No group in the same name
    var newGroupToAdd = createNewGroup(lesson, groupName);
    course.groups.push(newGroupToAdd);
}

async function removeDataCollection(courseDataCollection) {
    await courseDataCollection.remove();
}

function checkIfLessonIsInCoursesToSaveAndReturnCourse(coursesToSave, lesson) {
    var result = null;
    for(var course of coursesToSave) {
        if(course.code === lesson.B) {
            return course;
        }
    }

    return result;
}

function addCoursesIfNeeded(doc, courseDataCollection) {
    //removeDataCollection(courseDataCollection);
    
    return new Promise( async function(resolve, reject) {
        var timeTable = JSON.parse(doc.timeTable);
        var coursesToSave = [];

        for (var lesson of timeTable.FileFromYedion) {
            console.log("Doing lesson:" + lesson.C);
            var groupName = returnGroupName(lesson.C);

            try {
              let docs = await courseDataCollection.find({ 'code': lesson.B});
              let currentCourse;

              if(docs.length > 0) {
                  addGroupIfNeed(lesson, docs[0], groupName, courseDataCollection);
                  currentCourse = docs[0];
              }
              else if((currentCourse = checkIfLessonIsInCoursesToSaveAndReturnCourse(coursesToSave, lesson)) !== null ) {
                  addGroupIfNeed(lesson, currentCourse, groupName, courseDataCollection);
              }
              else {
                  console.log("Adding new course: " + lesson.B + ".")
                  currentCourse = createNewCourse(lesson, groupName, courseDataCollection);
              }

              if(!coursesToSave.includes(currentCourse)) {
                coursesToSave.push(currentCourse);
              }
            
            } 
            catch (error) {
                console.log("error: " + error);
            }
        }

        resolve(coursesToSave);
    });
}

function checkIfGroupPositionIsNotExist(groupPosition, allGroupsPosition) {
    for(var groupPositionToCheck of allGroupsPosition ) {
        if(groupPositionToCheck.courseCode=== groupPosition.courseCode && groupPositionToCheck.groupIndex === groupPosition.groupIndex) {
            return true;
        }
    }

    return false;
}

function checkIfStudentExists(studentsInLesson, studentToCheck) {
   
   for(var student of studentsInLesson) {
        if(student.equals(studentToCheck)) {
            return true;
        }
   }

    return false;
}

function returnCourseIfAlreadyExists(courses, courseCode) {
    for(var course of courses) { 
        if(course.courseCode === courseCode) {
            return course;
        }
    }

    return null;
}

function returnCourseName(courseName) {
    var startingIndexOfLesson = courseName.indexOf("שיעור");
    if(startingIndexOfLesson === -1) {
        startingIndexOfLesson = courseName.indexOf("תרגיל");
    }
    if(startingIndexOfLesson === -1) {
        return courseName;
    }
    else {
        return courseName.substr(0, startingIndexOfLesson - 1);
    }
}

function buildQueriesAndSurveysForCourses(groupsPosition) {
    var courses = [];
    for(var group of groupsPosition) { 
        var course = returnCourseIfAlreadyExists(courses, group.courseCode);
        if(course === null) {
            courses.push({"courseName": returnCourseName(group.groupName), "courseCode": group.courseCode, "groupsNames": [group.groupName], queries: [], surveys: [] });
        }
        else {
            course.groupsNames.push(group.groupName);
        }
    }

    return courses;
}

function addStudentToGroupStats(lessonInDb, group) {
    /*var studentOverallStatsSchema = new Schema({
    studentAnswerPercentage:{ type: Number},
    studentLackUsageScore: { type: Number},

    totalScoresAddedCounter: { type: Number, default: 0 },
    totalScoresSum: { type: Number, default: 0 },
    totalQuestionsAnsweredCounter: { type: Number, default: 0 },
    */
   if(lessonInDb.id === group.lessons[0].id) {
       studentOverallStats = {'studentAnswerPercentage': 0, 'studentLackUsageScore': 0, 'totalScoresAddedCounter': 0, 'totalScoresSum': 0, 'totalQuestionsAnsweredCounter': 0 };
       group.studentsOverallStats.push(studentOverallStats);
   }
}

function addStudentToLessonAndDefineGroupPosition(lesson, course, groupName, doc) {
    for(var i=0; i < course.groups.length; i++) {
        if(course.groups[i].groupName === groupName) {
            var groupPosition = { course: course._id, courseCode: lesson.B, groupIndex: i, groupName: course.groups[i].groupFullName };
            if (!checkIfGroupPositionIsNotExist(groupPosition, doc.groupsPosition)) {
                doc.groupsPosition.push(groupPosition);
            }
            if(doc.entity === constants.LECTURER) { //Lecturer finished the job here
                return;
            }

            var lessonInDb = returnLessonIfExists(lesson, course.groups[i].lessons);
            if(lessonInDb && !checkIfStudentExists(lessonInDb.students, doc._id)) {
                lessonInDb.students.push(doc._id);
                console.log("Added student to the lesson: " + lessonInDb.lessonName);
                addStudentToGroupStats(lessonInDb, course.groups[i]);
                return;
            }
            else {
                if(lessonInDb === null) {
                    console.log("Lesson: " + lesson.C + " isn't exists in the database.");
                }
                else {
                    console.log("Student already register for the lesson.");
                }
                return;
            }
        }
    }
}

function addStudentToCoursesAndDefineGroupsPosition(doc, courses) {
    return new Promise( function(resolve, reject) {
        var timeTable = JSON.parse(doc.timeTable);
        for (var lesson of timeTable.FileFromYedion) {
            console.log("Checking if need to add to course group and student to lesson in:" + lesson.C);
            var courseOfLesson = checkIfLessonIsInCoursesToSaveAndReturnCourse(courses, lesson);
            if(courseOfLesson === null) {
                console.log("Something went wrong with lesson, couldn't find it");
            }
            else {
                var groupName = returnGroupName(lesson.C);
                addStudentToLessonAndDefineGroupPosition(lesson, courseOfLesson, groupName, doc);
            }
        }

        if(doc.entity === constants.LECTURER) { 
            doc.queriesAndSurveys = buildQueriesAndSurveysForCourses(doc.groupsPosition);
        }

        doc.save();
        resolve(true);
    });
}

function uploadTimeTable(id, req, userDataCollection, courseDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {
        console.log("User id: " + id);
        var result = {"message" : ''};

        if(util.isEmpty(id)){
            resHttp.status(400);
            result.message = "Something went wrong with request of uploading time table file, got illegal request.";
            console.log(result.message);
            resolve(result);
        }
        else {
            userDataCollection.findById(id, function (err, doc) {
                if(err || !doc) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;
                    console.log(result.message);
                    resolve(result);
                }
                else {
                    console.log("The user: " + doc.username + " has been found, updating time table.");
                    var saveTo = "timeTable.xlsx";

                    req.pipe(req.busboy);
                    req.busboy.on('file', function (fieldname, file, filename) {
                        if(filename.endsWith(".XLSX") || filename.endsWith(".xlsx")) {
                              console.log("Uploading: " + filename); 

                              fstream = fs.createWriteStream(filename);
                              file.pipe(fstream);
                              fstream.on('close', function () {
                                    parseExcelFileToJson(filename, doc);
                                    fs.unlink(filename, (err) => {
                                        if (!err)
                                           console.log('successfully deleted ' + filename);
                                    });
                                    
                                    addCoursesIfNeeded(doc, courseDataCollection)
                                    .then((courses) => {
                                        addStudentToCoursesAndDefineGroupsPosition(doc, courses).then((response) => {
                                                result.message = "Updated the time table successfully.";
                                                util.printAllUsersInDataBase(userDataCollection);
                                                console.log(result.message);
                                                saveCourses(courses);
                                                resolve(result);
                                            });
                                    });  
                                });               
                        }
                        else {
                            resHttp.status(400);
                            result.message = "An error occurred: file isn't excell file.";
                            console.log(result.message);
                            resolve(result);
                        }
                    });
                }
            });    
        }
    });
}

function removeStudentFromGroupLessons(courseGroup, student) {
    var group = courseGroup.course.groups[courseGroup.groupIndex];
    for(var lesson of group.lessons) {
        var index = lesson.students.indexOf(student._id);
        if(index > -1) {
            lesson.students.splice(index, 1);
            console.log("Removed student from the lesson: " + lesson.lessonName);
            if(lesson.id === group.lessons[0].id) {
                group.studentsOverallStats.splice(index, 1);
            }
        }
        else {
            console.log("Student isn't found in the lesson.");
        }
    }
}

function removeStudentFromCourses(student, courseDataCollection) {
    return new Promise( function(resolve, reject) {
        var result = {"message" : ''};
        var path = "groupsPosition.course";
        student.populate(path,
            function (err, docAfter) {
                if (err || !docAfter) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;
                    console.log(result.message);
                    resolve(result);
                }
                else {
                    var coursesToSave = [];
                    for (var courseGroup of docAfter.groupsPosition) {
                        removeStudentFromGroupLessons(courseGroup, student);

                        if(!coursesToSave.includes(courseGroup.course)) {
                            coursesToSave.push(courseGroup.course);
                        }
                    }
                    saveCourses(coursesToSave);
                    result.message = "Successfully deleted student from courses.";
                    console.log(result.message);
                    resolve(result);
                }
        });
    });
}


function deleteTimeTableFromUser(id, userDataCollection, courseDataCollection, resHttp) {
    return new Promise(function(resolve, reject) {

        console.log("User id: " + id);
        var result = {"message" : ''};

        if(util.isEmpty(id)){
            resHttp.status(400);
            result.message = "Something went wrong with request of uploading time table file, got illegal request.";
            console.log(result.message);
            resolve(result);
        }
        else {
            userDataCollection.findById(id, function (err, doc) {
                if(err || !doc) {
                    resHttp.status(400);
                    result.message = "An error occurred: " + err;
                    console.log(result.message);
                    resolve(result);
                }
                else {
                    if(doc.timeTable) {
                        console.log("The user: " + doc.username + " has been found, deleting time table.");
                        if(doc.entity === constants.STUDENT) {
                            removeStudentFromCourses(doc, courseDataCollection)
                            .then((response) => {
                                doc.timeTable = undefined;
                                doc.groupsPosition = undefined;
                                doc.save();
                                result.message = "Deleted the time table successfully.";
                                console.log(result.message);
                                resolve(result);
                            });
                        }
                        else {
                            doc.timeTable = undefined;
                            doc.groupsPosition = undefined;
                            doc.save();
                            result.message = "Deleted the time table and groups position successfully.";
                            console.log(result.message);
                            resolve(result);
                        }
                    }
                    else {
                        result.message = "Deleted the time table and groups position successfully.";
                        console.log(result.message);
                        resolve(result);
                    }    
                }
            });    
        }
    });
}

module.exports = { uploadTimeTable, deleteTimeTableFromUser};