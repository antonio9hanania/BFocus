import React, { Component } from 'react';
import { Alert, ImageBackground, AsyncStorage, View, Linking, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from 'react-native-elements';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import { SERVER_ADDR } from '../../constants/serverAddress';
import PTRView from 'react-native-pull-to-refresh';
import Toast from 'react-native-simple-toast';
import { showAlert } from '../../components/alert';
import { VictoryChart, VictoryZoomContainer, VictoryLine, VictoryAxis } from "victory-native";


export default class CourseGroupChartScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            groupPositionIndex: '',
            id: '',
            groupName: '',
            graphTextDescirption: '',
            startTime: '',
            endTime: '',
            dayInWeek: '',
            lessonTimePeriod: [],
            studentsOverallStats: [],
            tableHead: ['#', 'Name', '%', 'Score'],
            tableTitle: [],
            zoomDomain: {},
            studentsActivityPercentage: [],
        };

        this.getLessonsData = this.getLessonsData.bind(this);
        this.responseHandler = this.responseHandler.bind(this);
        this.convertToObjectDate = this.convertToObjectDate.bind(this);

    }

    async componentWillMount() {
        try {
            console.log("Query or survey did mount");
            const item = await this.props.navigation.getParam('item');
            const id = await AsyncStorage.getItem('id');
            console.log('check id>>>>>>>>>>>> :', id); // checked --> good
            this.setState({
                id: id,
                groupPositionIndex: item.groupPositionIndex,
                groupName: item.groupName,
            });

            console.log("group position index: " + this.state.groupPositionIndex);
            console.log("groupName is: " + this.state.groupName);
            this.getLessonsData(item.groupPositionIndex, id);
        }
        catch (error) {
            console.log("An error occured: " + error);
        }

    }

    buildArrayOfIndex(arraylength) {
        var result = [];
        for (i = 1; i <= arraylength; i++) {
            result.push(i);
        }

        return result;
    }

    getDayInWeekFromNumber(dayNumber) {
        var result = "יום ";
        switch (dayNumber) {
            case 0: { result += "א"; break; }
            case 1: { result += "ב"; break; }
            case 2: { result += "ג"; break; }
            case 3: { result += "ד"; break; }
            case 4: { result += "ה"; break; }
            case 5: { result += "ו"; break; }
            case 6: { result += "ש"; break; }
        }
        return result + "'";
    }

    responseHandler(status, responseJson) {
        if (status === 200) {
            var lesson = responseJson.currOrNextLesson;
            var graphTextDescirption = responseJson.isLessonInCurrentDay === true ? "Students activity during today's lesson:" : "Next lesson will be:";
            var dayInWeek = this.getDayInWeekFromNumber(lesson.dayInWeek);
            var dateBuilder = new Date().toLocaleDateString();
            var currentTimeStudentsActivityPercentage = this.convertToObjectDate(lesson.studentsActivityPercentage);
            this.setState({
                studentsActivityPercentage: currentTimeStudentsActivityPercentage,
                startTime: lesson.dates[0],
                endTime: lesson.dates[lesson.dates.length - 1],
                lessonTimePeriod: lesson.dates,
                studentsOverallStats: responseJson.studentsOverallStats,
                graphTextDescirption: graphTextDescirption,
                dayInWeek: dayInWeek,
                zoomDomain: (lesson.dates.length > 1) ? { x: [new Date(dateBuilder + ',' + lesson.dates[0]), new Date(dateBuilder + ',' + lesson.dates[lesson.dates.length - 1])], y: [0, 100] } : {},
            });

            console.log("lesson.studentsActivityPercentage[0].utcDateOfActivity: ", lesson.studentsActivityPercentage[0])
            console.log("Updated lessonsData: " + JSON.stringify(this.state.lessonsData)); //////////////undifined
        }
    }

    onRefresh = () => {
        return new Promise((resolve) => {
            Toast.show('Refreshing...', Toast.SHORT);
            this.getLessonsData(this.state.groupPositionIndex, this.state.id);
            setTimeout(() => { resolve(); }, 2200)
        });
    }
    convertToObjectDate(precentagePerTimeArr) {
        var i;
        var res = [];

        if (precentagePerTimeArr.length > 1) {

            for (i in precentagePerTimeArr) {
                res.push({ localDateOfActivity: new Date(precentagePerTimeArr[i].utcDateOfActivity), studentsActivityPercentage: precentagePerTimeArr[i].studentsActivityPercentage });
            }
            return res;
        }
        else {
            return precentagePerTimeArr;
        }

    }

    handleZoom(domain) {
        this.setState({ zoomDomain: domain });
    }

    getLessonsData(groupPositionIndex, id) {
        var status;
        url = SERVER_ADDR + "GetLessonsStudentsData";

        fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "id": id,
                "groupPositionIndex": groupPositionIndex,
            },
        })
            .then((response) => {
                status = response.status;
                return response.json();
            })
            .then((responseJson) => {
                console.log("Response from server: " + status);
                console.log(responseJson);
                this.responseHandler(status, responseJson);

            })
            .catch(error => {
                console.log(`Fetch Error in getLessonsData =\n`, error);
            });
    }

    downloadFromNewWindow(filePath) {
        url = SERVER_ADDR + "DownloadExcelFile?" + 'filePath=' + filePath;
        console.log("Downloaing excel file from new window with url: " + url);

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + this.state.url);
            }
        });
    }


    downloadExcellFile = () => {
        var reqerId = this.state.id;
        showAlert("Download table", "You will download the Students Analysis table to your device, are you sure?", () => {
            var status;
            url = SERVER_ADDR + "ExportToExcelFile?";
            console.log("tableHead: ", this.state.tableHead);
            data = { data: this.state.studentsOverallStats, headerData: this.state.tableHead };

            fetch(url, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Content-Type": "application/json",
                    "id": this.state.id,
                },
                body: JSON.stringify(data), // body data type must match "Content-Type" header
            })
                .then((response) => {
                    status = response.status;
                    return response.json();
                })
                .then((responseJson) => {
                    console.log("Response from server: " + status);
                    console.log(responseJson);
                    if (status === 200) {
                        this.downloadFromNewWindow(responseJson.filePath);
                    }
                })
                .catch(error => {
                    console.log(`Fetch Error excell =\n`, error);
                });
        });
    }

    render() {

        data = this.state.studentsActivityPercentage;

        const arrSizeOfTable = [3, 9, 6, 6];
        const arrWidthTable = [40, 90, 60, 60];

        return (
            <ImageBackground source={require('../../img/img_background_picture.png')} imageStyle={{ resizeMode: 'cover' }} style={{ flex: 1 }}>
                <PTRView onRefresh={this.onRefresh.bind(this)} >

                    <ScrollView resizeMode="center">
                        <View style={styles.container}>

                            <TouchableOpacity onPress={this.downloadExcellFile.bind(this)} style={styles.opacity} >
                                <Icon name='file-excel' style={styles.iconTable} size={25} color='black' />
                                <Text style={styles.textIconTable}> Download Table </Text>
                            </TouchableOpacity>

                            <View style={styles.containerTable}>
                                <Text style={styles.headerGuide} h4> Students Analysis:  {'\n'} </Text>
                                <Table>
                                    <Row data={this.state.tableHead} flexArr={arrSizeOfTable} widthArr={arrWidthTable} style={styles.head} textStyle={styles.text} />
                                    <TableWrapper style={styles.wrapper}>
                                        {/*<Col data={this.state.tableTitle} style={styles.title} heightArr={[28,28]} textStyle={styles.text}/>*/}
                                        <Rows data={this.state.studentsOverallStats} flexArr={arrSizeOfTable} widthArr={arrWidthTable} style={styles.row} textStyle={styles.text} />
                                    </TableWrapper>
                                </Table>
                            </View>

                            <Text> {'\n\n'} </Text>

                            <Text style={styles.headerGuide} h4> {this.state.graphTextDescirption} </Text>
                            <Text style={styles.header}> {this.state.groupName} </Text>
                            <Text style={styles.header}> {this.state.dayInWeek} {this.state.startTime}-{this.state.endTime}</Text>

                            {this.state.studentsActivityPercentage && this.state.studentsActivityPercentage.length > 1 ?
                                <View style={styles.graphContainer}>
                                    <VictoryChart scale={{ x: "time", y: "linear" }}
                                        containerComponent={
                                            <VictoryZoomContainer
                                                zoomDimension="x"
                                                zoomDomain={this.state.zoomDomain}
                                                onZoomDomainChange={this.handleZoom.bind(this)}
                                            />
                                        }
                                    >
                                        {/* <VictoryAxis // converting a 12h time to 24h at x axis
                                            tickFormat={(x) => new Date(x).toTimeString().substring(0,2) + ':' + new Date(x).toTimeString().substring(3,5)}
                                        />

                                        <VictoryAxis dependentAxis tickFormat={(tick) => tick + '%'} // display also the y axis with % appended to the value
                                        /> */}
                                        <VictoryLine
                                            style={{
                                                data: { stroke: "tomato" }
                                            }}
                                            data={this.state.studentsActivityPercentage}
                                            x="localDateOfActivity"
                                            y="studentsActivityPercentage"
                                        />
                                    </VictoryChart>

                                </View>

                                :
                                <Text style={styles.textNoData} > There isn't data to show </Text>
                            }

                            <Text> {'\n\n\n\n'} </Text>
                        </View>
                    </ScrollView>
                </PTRView>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    textIconTable: {
        fontSize: 13,
        color: 'black',
    },
    graphContainer: {
        height: 200,
        padding: 8,
        flexDirection: 'row',
        marginLeft: '7%',

    },
    iconTable: {
        marginLeft: 5,
    },
    opacity: {
        alignSelf: 'flex-start',
        marginTop: 15,
        height: 35,
        width: 100,

        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',

        paddingLeft: 15,
    },
    chart: {
        height: 200,
        width: 280,
        backgroundColor: 'white',
    },
    textNoData: {
        alignSelf: 'center',
        color: "black"
    },

    dateStyle: {
        transform: [{ rotate: '30deg' }],
        color: 'black'
    },
    containerDates: {
        maxWidth: 280,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    headerGuide: {
        textAlign: 'center',
        width: 250,
        alignSelf: 'center',
        color: 'black'
    },
    head: { height: 36, backgroundColor: '#f1f8ff' },
    header: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'black' },
    wrapper: { flexDirection: 'row' },
    title: { flex: 1, backgroundColor: '#f6f8fa', color: 'black' },
    row: { height: 34 },
    text: { textAlign: 'center', color: 'black' },
    containerTable: { flex: 1, padding: 8, paddingTop: 30 },
});