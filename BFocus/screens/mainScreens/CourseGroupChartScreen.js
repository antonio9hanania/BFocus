import React, { Component } from 'react';
import { Alert, ImageBackground, AsyncStorage, View, StyleSheet, ScrollView } from 'react-native';
import { AreaChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from 'react-native-elements';
import { Path } from 'react-native-svg';
import * as shape from 'd3-shape';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import {SERVER_ADDR} from '../../constants/serverAddress';

export default class CourseGroupChartScreen extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
          groupPositionIndex: '',
          id: '',
          groupName: '',
          lessonsData: [],
          studentsActivityPercentage: [],
          startTime: '',
          endTime: '',
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

  responseHandler(status, responseJson) {
      if(status === 200) {
         this.setState({ lessonsData: responseJson.lessonsData,
             studentsActivityPercentage: responseJson.lessonsData[0].studentsActivityPercentage, 
             startTime: responseJson.lessonsData[0].dates[0], 
             endTime: responseJson.lessonsData[0].dates[responseJson.lessonsData[0].dates.length - 1],
             lessonTimePeriod: responseJson.lessonsData[0].dates,
             studentsOverallStats: responseJson.studentsOverallStats,
            });

         console.log("Updated lessonsData: " + JSON.stringify(this.state.lessonsData));
      } 
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
            <ScrollView resizeMode="center">
            <View style={styles.container}>
                <Text style={styles.headerGuide} h4> Last lesson students data: </Text>
                <Text style={styles.header}> {this.state.groupName} </Text> 
                <Text style={styles.header}> {this.state.startTime}-{this.state.endTime}</Text> 
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
                        
                        {this.state.studentsActivityPercentage.length > 0 ? 
                        <View style={styles.containerDates}> 
                            {this.state.lessonTimePeriod.map((value, index) => {
                            return (
                                <Text key={index} style={styles.dateStyle}>
                                    {value}
                                </Text>
                                );
                            })
                            }
                        </View> : null }
                        
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
                                />*/}

                    </View>  
                </View>
                
    
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

            </View>
            </ScrollView>
        </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
    
  },
  chart: {
	height: 200,
    width: 280,
    backgroundColor: 'white',
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
      marginTop: 50,
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