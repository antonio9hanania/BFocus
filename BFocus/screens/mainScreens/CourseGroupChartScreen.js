import React, { Component } from 'react';
import { Alert, ImageBackground, AsyncStorage, View, StyleSheet, ScrollView } from 'react-native';
import { AreaChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from 'react-native-elements';
import { Path } from 'react-native-svg';
import * as shape from 'd3-shape';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import {SERVER_ADDR} from '../../constants/serverAddress';
import PTRView from 'react-native-pull-to-refresh';
import Toast from 'react-native-simple-toast';

export default class CourseGroupChartScreen extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
          groupPositionIndex: '',
          id: '',
          groupName: '',
          graphTextDescirption: '',
          studentsActivityPercentage: [],
          startTime: '',
          endTime: '',
          dayInWeek: '',
          lessonTimePeriod: [],
          studentsOverallStats: [],
          tableHead: ['#', 'Name', '%', 'Score'],
          tableTitle: [],
        };

        this.getLessonsData = this.getLessonsData.bind(this);
        this.responseHandler = this.responseHandler.bind(this);
      }

      async componentDidMount() {
		try {   
            console.log("Query or survey did mount");
            const item = await this.props.navigation.getParam('item');
			const id = await AsyncStorage.getItem('id');

			this.setState({
				id: id,
                groupPositionIndex: item.groupPositionIndex,
                groupName: item.groupName,            
            });

            console.log("group position index: " + this.state.groupPositionIndex);
            console.log("groupName is: " + this.state.groupName );
            this.getLessonsData(item.groupPositionIndex, id);
		}
		catch(error) {
			console.log("An error occured: " + error);
		}
  }

  buildArrayOfIndex(arraylength) {
    var result = []; 
    for(i = 1; i <= arraylength; i++) {
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
      if(status === 200) {
        var lesson = responseJson.currOrNextLesson;
        var graphTextDescirption = responseJson.isLessonInCurrentDay === true ? "Students activity during today's lesson:" : "Next lesson will be at:";
        var dayInWeek = this.getDayInWeekFromNumber(lesson.dayInWeek);

        this.setState({ 
             studentsActivityPercentage: lesson.studentsActivityPercentage, 
             startTime: lesson.dates[0],
             endTime: lesson.dates[lesson.dates.length - 1],
             lessonTimePeriod: lesson.dates,
             studentsOverallStats: responseJson.studentsOverallStats,
             graphTextDescirption: graphTextDescirption,
             dayInWeek: dayInWeek,
            });

         console.log("Updated lessonsData: " + JSON.stringify(this.state.lessonsData));
      } 
  }

  onRefresh = () => {
    return new Promise((resolve) => {
      Toast.show('Refreshing...', Toast.SHORT);
      this.getLessonsData();
      setTimeout(() => { resolve(); }, 2200)
    });
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
        console.log(`Fetch Error =\n`, error);
    });
  }
  

    render() {

        data = this.state.studentsActivityPercentage;
        xDataTimes = this.state.lessonTimePeriod;
        const xAxisHeight = 0;
        const axesSvg = { fontSize: 10, fill: 'black' };
        const verticalContentInset = { top: 10, bottom: 10 };
        
        const Line = ({ line }) => (
            <Path
                key={'line'}
                d={line}
                stroke={'rgb(134, 65, 244)'}
                fill={'none'}
            />
        )

        const arrSizeOfTable = [3, 9, 6, 6];
        const arrWidthTable = [40, 90, 60, 60];

        return (
        <ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
              <PTRView onRefresh={this.onRefresh.bind(this)} >

            <ScrollView resizeMode="center">
            <View style={styles.container}>

                
            <View style={styles.containerTable}>
                <Text style={styles.headerGuide} h4> Students Analysis:  {'\n'} </Text> 
                <Table>
                    <Row data={this.state.tableHead} flexArr={arrSizeOfTable} widthArr={arrWidthTable} style={styles.head} textStyle={styles.text}/>
                    <TableWrapper style={styles.wrapper}>
                        {/*<Col data={this.state.tableTitle} style={styles.title} heightArr={[28,28]} textStyle={styles.text}/>*/}
                        <Rows data={this.state.studentsOverallStats} flexArr={arrSizeOfTable} widthArr={arrWidthTable} style={styles.row} textStyle={styles.text}/>
                    </TableWrapper>
                </Table>
            </View> 
            
            <Text> {'\n\n'} </Text>

            <Text style={styles.headerGuide} h4> {this.state.graphTextDescirption} </Text>
            <Text style={styles.header}> {this.state.groupName} </Text> 
            <Text style={styles.header}> {this.state.dayInWeek} {this.state.startTime}-{this.state.endTime}</Text> 
            
            {this.state.studentsActivityPercentage && this.state.studentsActivityPercentage.length > 0 ? 
            <View style={{ height: 200, padding: 8, flexDirection: 'row', marginLeft: '5%' }}>
                <YAxis
                        data={data}
                        style={{ marginBottom: xAxisHeight,  }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                    />
                <View style={{ flex: 1, marginLeft: 3,}}>
                    <AreaChart
                        style={styles.chart}
                        data={ data }
                        contentInset={{ top: 30, bottom: 30 }}
                        curve={ shape.curveNatural }
                        svg={{ fill: 'rgba(134, 65, 244, 0.2)' }}
                    >
                        <Grid/>
                        <Line/>
                    </AreaChart>
                    
                    
                    <View style={styles.containerDates}> 
                        {this.state.lessonTimePeriod.map((value, index) => {
                        return (
                            <Text key={index} style={styles.dateStyle}>
                                {value}
                            </Text>
                            );
                        })
                        }
                    </View> 
                    
                    {/*<XAxis
                            style={{ marginHorizontal: 0, height: 10, width: 280 }}
                            data={xDataTimes}

                            //xAccessor={ ({ item }) => item.date }
                            formatLabel={ (value) => value }

                            contentInset={{ left: 10, right: 10 }}
                            svg={ {
                                rotation: 20,
                                originY: 30,
                                y: 5, 
                                }}
                            />*/ }
                            
                    <Text> {'\n\n'} </Text>
                            
                </View>  
                
            </View>
                
            : 
            <Text style={styles.textNoData} > There isn't data to show </Text>
          }


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
    justifyContent: 'center',
    
    
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
    transform: [{ rotate: '30deg'}],
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
  head: {  height: 36,  backgroundColor: '#f1f8ff'  },
  header: {textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'black'},
  wrapper: { flexDirection: 'row' },
  title: { flex: 1, backgroundColor: '#f6f8fa', color: 'black' },
  row: {  height: 34  },
  text: { textAlign: 'center', color: 'black' },
  containerTable: {flex: 1, padding: 8, paddingTop: 30},
});