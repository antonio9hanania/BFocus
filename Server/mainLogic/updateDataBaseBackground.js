var util = require('../util/util.js');
var constants = require('../constants/constants.js');

const VALID_DATE_FORTY_MINUTES = 40 * 60 * 1000; // Valid date is when the student updated status last time, in less than 40 minutes

function checkIfLastTimeStampIsValid(currentDate, lastTimeStampUpdate) {
    if (util.isEmpty(lastTimeStampUpdate)) {
        return false;
    }

    var answer = (currentDate - lastTimeStampUpdate) < VALID_DATE_FORTY_MINUTES;
    console.log(answer);
    return answer;
}

function returnGroupStudentIfExists(student, group) {
    for (var option of student.studentUsageDailyScores) {
        if (option.groupId === group.id) {
            return option;
        }
    }

    return null;
}

async function updateStudentUsageScore(student, group) {
    var groupStudentScore = returnGroupStudentIfExists(student, group);
    if (groupStudentScore === null) {
        student.studentUsageDailyScores.push({ "groupId": group.id, "score": 50 });
    }
    else {
        if (student.status === true) {
            groupStudentScore.score = (groupStudentScore.score + 5) % 100;
        }
        else {
            groupStudentScore.score = (groupStudentScore.score - 5) < 0 ? 0 : groupStudentScore.score - 5;
        }
    }

    await student.save();
}

/*function updateCourseGroupStats(group) {
    if(group.dataForStats === undefined) {
        group.dataForStats = {'totalQuestionsCounter': 0};
    }
}*/

function updateLesson(course, groupIndex, lessonIndex) {
    return new Promise(function (resolve, reject) {
        var date = new Date();
        var lesson = course.groups[groupIndex].lessons[lessonIndex];

        if (lesson.students.length > 0 && date.getDay() === lesson.dayInWeek && util.checkIfTimeIsInTheMinuteOfLesson(date, lesson.dates[0], lesson.dates[lesson.dates.length - 1]) === true) {
            console.log("Lesson found active: " + lesson.lessonName);
            var counterActiveStudents = 0;
            var path = "groups." + groupIndex + ".lessons." + lessonIndex + ".students";

            course.populate(path, function (err, courseAfter) {
                var unactiveStudents = [];
                var i;
                if (err) { console.log("Error at update lesson: " + err); resolve(false); }
                var lessonsStudents = courseAfter.groups[groupIndex].lessons[lessonIndex].students;

                for (var student of lessonsStudents) {
                    if (student.status === true && checkIfLastTimeStampIsValid(date, student.lastTimeStampUpdate) === true) {
                        counterActiveStudents++;
                    }


                    updateStudentUsageScore(student, courseAfter.groups[groupIndex]);
                }

                var studentsActivityPercentage = Math.round((counterActiveStudents / lessonsStudents.length) * 100);
                var precentagePerTime = { utcDateOfActivity: new Date().toUTCString(), studentsActivityPercentage: studentsActivityPercentage }
                
                if(lesson.studentsActivityPercentage.length === 0 ){ //to get a starting grow graph from 0 y value
                    lesson.studentsActivityPercentage.push({ utcDateOfActivity: new Date().toUTCString(), studentsActivityPercentage: 0 })
                }
                else{
                    lesson.studentsActivityPercentage.push(precentagePerTime);
                }
                console.log("Pushed to lesson: " + lesson.lessonName + " " + studentsActivityPercentage + " percentage activity of students.");
                console.log("Pushed to lesson: " + lesson.lessonName + " total of: " + lesson.studentsActivityPercentage.length);
                resolve(true);
            });
        }
        else {
            resolve(false);
        }
    });
}

function calcTotalNumCourseLessons(course) {
    var result = 0;

    for (var i = 0; i < course.groups.length; i++) {
        for (var j = 0; j < course.groups[i].lessons.length; j++) {
            result++;
        }
    }

    return result;
}

async function deleteAllUsers(userDataCollection) {
    await userDataCollection.remove();
    console.log("deleted all users");
}

async function deleteArrayStudentDaily(userDataCollection) {
    /*await userDataCollection.find({}, async function(err, users) {
        users[1].studentUsageDailyScores.length = 0;
        await users[1].save();
        console.log("cleared7 array of student daily");
    });*/

    /* await userDataCollection.findByIdAndUpdate('5b8a956aa7b36f1b88936127', {studentUsageDailyScores: [] }, function(err, users) {
         console.log("cleared7 array of student daily");
     });*/
}

function updateDataBase(courseDataCollection, userDataCollection) {
    console.log("Updating the server on the background task...");
    courseDataCollection.find({}, async function (err, courses) {
        if (err) {
            console.log("Error updating datebase: " + err);
        }
        else if (courses.length === 0) {
            console.log("There isn't any courses to update yet.");
        }
        else {
            for (let course of courses) {
                let totalNumCourseLessons = calcTotalNumCourseLessons(course);
                let numFinisedTaskCourseLessons = 0;

                for (let i = 0; i < course.groups.length; i++) {
                    for (let j = 0; j < course.groups[i].lessons.length; j++) {
                        await updateLesson(course, i, j).then(() => {
                            console.log("Finished " + course.groups[i].lessons[j].lessonName);
                            numFinisedTaskCourseLessons++;

                            if (numFinisedTaskCourseLessons === totalNumCourseLessons) {
                                console.log("saving");
                                course.save();
                            }
                        });
                    }
                }
            }
        }
    });
}

function removeExpiredFromArray(array, currentDate) {
    var i = array.length;
    while (i--) {
        if (array[i].expiryDate - currentDate <= 0) {
            array.splice(i, 1);
        }
    }
}

function removeExpiredQueriesAndSurveys(group, date) {
    if (!util.isEmpty(group)) {
        removeExpiredFromArray(group.publishedQueries, date);
        removeExpiredFromArray(group.publishedSurveys, date);
    }
}

function updateQueriesAndSurveys(courseDataCollection) {
    console.log("Updating the server from expired queries and surveys...");
    courseDataCollection.find({}, function (err, courses) {
        if (err) {
            console.log("Error updating datebase: " + err);
        }
        else if (courses.length === 0) {
            console.log("There isn't any courses to update yet.");
        }
        else {
            var date = new Date();
            for (let course of courses) {
                for (let group of course.groups) {
                    removeExpiredQueriesAndSurveys(group, date);
                    console.log("Finished " + group.groupFullName);
                }

                course.save();
            }
        }
    });
}


function updateStudent(studentOverallStats, studentScoreGroup) {
    studentOverallStats.totalScoresSum += studentScoreGroup.score;
    studentOverallStats.totalScoresAddedCounter++;
    var num = studentOverallStats.totalScoresSum / studentOverallStats.totalScoresAddedCounter;
    studentOverallStats.studentLackUsageScore = Math.round(num * 100) / 100;
}

function updateStudentsScoresInGroup(course, groupIndex) {
    return new Promise(function (resolve, reject) {
        var lesson = course.groups[groupIndex].lessons[0];
        var group = course.groups[groupIndex];

        if (lesson.students.length > 0) {
            var path = "groups." + groupIndex + ".lessons.0.students";
            course.populate(path, function (err, courseAfter) {
                if (err) { console.log("Error at update group: " + err); resolve(false); }

                var lessonsStudents = courseAfter.groups[groupIndex].lessons[0].students;
                var indexStudent = 0;

                for (var student of lessonsStudents) {
                    var studentScoreGroup = returnGroupStudentIfExists(student, group);
                    if (studentScoreGroup !== null) {
                        updateStudent(group.studentsOverallStats[indexStudent], studentScoreGroup);
                        courseAfter.groups[groupIndex].lessons[0].students[indexStudent].save();
                    }

                    indexStudent++;
                }
                //reset students activity to this lesson
                if (lesson.studentsActivityPercentage.length > 0) {
                    console.log(">>>deleting array of lesson: " + lesson.lessonName);
                }
                lesson.studentsActivityPercentage = [];

                console.log(">>>" + lesson.lessonName + " length of array is: " + lesson.studentsActivityPercentage.length);


                resolve(true);
            });
        }
        else {
            resolve(false);
        }
    });
}

function deleteDailyUsageStudent(userDataCollection) {
    console.log("Deleting all daily courses in students db.");
    userDataCollection.updateMany({}, { studentUsageDailyScores: [] }, function (err, students) {
        if (err) {
            console.log("Error updating datebase: " + err);
        }
    });
}



function updateStudentsScoresInGroups(courseDataCollection, userDataCollection) {
    console.log("Updating the server on the students scores in groups...");
    courseDataCollection.find({}, async function (err, courses) {
        if (err) {
            console.log("Error updating datebase: " + err);
        }
        else if (courses.length === 0) {
            console.log("There isn't any courses to update yet.");
        }
        else {
            let finishedCourses = 0;
            let totalNumCourses = courses.length;

            for (let course of courses) {
                let totalNumCoursesGroups = course.groups.length;
                let numFinisedTaskCourseGroups = 0;

                for (let i = 0; i < course.groups.length; i++) {
                    await updateStudentsScoresInGroup(course, i).then(() => {
                        console.log("Finished " + course.groups[i].groupFullName);
                        numFinisedTaskCourseGroups++;

                        if (numFinisedTaskCourseGroups === totalNumCoursesGroups) {
                            console.log("saving");
                            course.save();

                            finishedCourses++;
                            if (finishedCourses === totalNumCourses) {
                                deleteDailyUsageStudent(userDataCollection);
                            }
                        }
                    });
                }
            }
        }
    });
}

module.exports = { updateDataBase, updateQueriesAndSurveys, updateStudentsScoresInGroups, deleteArrayStudentDaily };