var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
    text: { type: String },
    votersCounter: { type: Number }
});

var winnerSchmea = new Schema({
    username: { type: String },
    email: { type: String }
});

var publishedQueryOrSurveySchema = new Schema({
    question: { type: String, required: true },
    answers: [answerSchema],
    userAnswered: [String],
    expiryDate: {type: Date},
});

var queryOrSruveySchema = new Schema({
    question: { type: String, required: true },
    answers: [answerSchema],
});

var groupPosition = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'allCourses', required: true },
    courseCode: { type: Number, required: true },
    groupIndex: { type: Number, required: true },
    groupName: { type: String, required: true },
});

var queriesAndSurveysSchema = new Schema({
    courseName: { type: String },
    courseCode: { type: Number},
    groupsNames: [String],
    queries: [queryOrSruveySchema],
    surveys: [queryOrSruveySchema],
});

var studentUsageDailyScoreSchema = new Schema({
    groupId: {type: String},
    score: {type: Number},
});

var userSchema = new Schema({
    username:{ type: String, required: true },
    email:{ type: String, required: true },
    password:{ type: String },
    entity: { type: String },
    timeTable: { type: String },
    college: { type: String },
    accessToken: { type: String},
    status: { type: Boolean, }, //This property is status activity for student: if true, than the user will count as studying and the thread of the db will give him mark. else, no.
    groupsPosition: [groupPosition],
    lastTimeStampUpdate: {type: Date},
    queriesAndSurveys: [queriesAndSurveysSchema],
    studentUsageDailyScores: [studentUsageDailyScoreSchema],
});

var lessonSchema = new Schema({
    dates: [String],
    dayInWeek: { type: Number },
    lessonName: { type: String },
    lecturerName: { type: String },
    students: [ {type: Schema.Types.ObjectId, ref: 'allUsers'}],
    studentsActivityPercentage: [Number], 
});

var studentOverallStatsSchema = new Schema({
    studentAnswerPercentage:{ type: Number},
    studentLackUsageScore: { type: Number},

    totalScoresAddedCounter: { type: Number, default: 0 },
    totalScoresSum: { type: Number, default: 0 },
    totalQuestionsAnsweredCounter: { type: Number, default: 0 },
});

var dataForStatsSchema = new Schema({
    totalQuestionsCounter: { type: Number, default: 0 },
});

var groupSchema = new Schema({
    groupName: { type: String },
    groupFullName: { type: String },
    lessons: [lessonSchema],
    publishedQueries: [publishedQueryOrSurveySchema],
    publishedSurveys: [publishedQueryOrSurveySchema],
    studentsOverallStats: [studentOverallStatsSchema],
    totalQuestionsCounter: { type: Number, default: 0 },
});

var courseSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true,
    },
    groups: [groupSchema],
});

mongoose.model('allCourses', courseSchema);

mongoose.model('allUsers', userSchema);
