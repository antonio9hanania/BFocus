import React, { Component } from 'react';
import { Alert, Button, AsyncStorage, ScrollView, Picker, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Text, FormValidationMessage } from 'react-native-elements';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import {showAlert} from '../../components/alert';

import { Text1} from 'react-native-svg';
import * as shape from 'd3-shape';

export default class QueryOrSurveyScreen extends Component {
   constructor(props) {
		super(props);
		this.state = {
                id: '',
                queryOrSurvey: '',
				isQuery: '',
                groupPositionIndex: '',
                groupName: '',
                question: '',
                selectedAnswerIndex: '',
				answer1: '',
				answer2: '',
				answer3: '',
				answer4: '',
				answer5: '',
                isLecturer: '',
                disabled: false,
                votersCounter1: 0,
                votersCounter2: 0,
                votersCounter3: 0,
                votersCounter4: 0,
                votersCounter5: 0,
                
                manageMode: false,
                coursePositionIndex: 0,
                coursesGroups: [],  
                courseGroup: '',
                groupPositionIndex: '',
                isDateTimePickerVisible: false,
                expiryDate: '',
                errorExpiryDate: '',
                errorGroupSelection: '',
            };
        this.uploadToServer = this.uploadToServer.bind(this);
  }
   
  async componentDidMount() {
		try {   /* queryOrSurvey: item.value, groupPositionIndex: item.groupPositionIndex , groupName: item.groupName, disabled: item.disabled */
            console.log("Query or survey did mount");
            const item = await this.props.navigation.getParam('item');
			const id = await AsyncStorage.getItem('id');
            const queryOrSurvey = item.value;
            const isLecturer = await AsyncStorage.getItem('isLecturer');
            const coursesGroups =  await AsyncStorage.getItem('coursesGroups');
            const manageMode = await this.props.navigation.getParam('manageMode');
            const groupPositionIndex = 0;
            const coursePositionIndex = item.coursePositionIndex;

			console.log("Id is: " + id + this.state.isQuery ? "Query" : "Survey" + " request");
			this.setState({
				id: id,
				isQuery: this.props.navigation.getParam('isQuery'),
                groupPositionIndex: item.groupPositionIndex,
                queryOrSurvey: queryOrSurvey,
                groupName: item.groupName,
                isLecturer: JSON.parse(isLecturer),
                disabled: item.disabled || manageMode,
                coursesGroups: JSON.parse(coursesGroups),
                manageMode: manageMode,
                coursePositionIndex: coursePositionIndex,
            });

            const queryOrSurveyString = this.state.isQuery ? "Query" : "Survey";
            console.log("question of: " + queryOrSurveyString + "is: " + queryOrSurvey.question + " group position index: " + this.state.groupPositionIndex);
            console.log("Object is: " + JSON.stringify(queryOrSurvey));
            console.log("Is lecturer: " + this.state.isLecturer);
            console.log("Manage mode: " + this.state.manageMode);
            console.log("disabled: " + this.state.disabled);
            console.log("coursePositionIndex: " + coursePositionIndex);

            this.setState({
                question: queryOrSurvey.question,
                answer1: queryOrSurvey.answers[0].text,
                answer2: queryOrSurvey.answers[1].text,
                answer3: queryOrSurvey.answers[2].text,
                answer4: queryOrSurvey.answers[3].text,
                votersCounter1: queryOrSurvey.answers[0].votersCounter,
                votersCounter2: queryOrSurvey.answers[1].votersCounter,
                votersCounter3: queryOrSurvey.answers[2].votersCounter,
                votersCounter4: queryOrSurvey.answers[3].votersCounter,
            });

            if(!this.state.isQuery) {
                this.setState({
                    answer5: queryOrSurvey.answers[4].text,
                    votersCounter5: queryOrSurvey.answers[4].votersCounter,
                });
            }
		}
		catch(error) {
			console.log("An error occured: " + error);
		}
	
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
 
  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
 
  _handleDatePicked = (date) => {
    console.log('A date has been picked: ', date);
	this.setState({ expiryDate: date });
	this._hideDateTimePicker();
  };

  uploadToServer(url, callback) {
    var status;
	data = {"groupPositionIndex": this.state.groupPositionIndex, "queryOrSurveyId" : this.state.queryOrSurvey._id, "selectedAnswerIndex": this.state.selectedAnswerIndex, coursePositionIndex: this.state.coursePositionIndex, queryOrSurvey: this.state.queryOrSurvey, expiryDate: this.state.expiryDate};
    console.log("this.state.selectedAnswerIndex: " + this.state.selectedAnswerIndex);
    fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
                "Content-Type": "application/json",
                "id": this.state.id,
                "isQuery": this.state.isQuery
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
	})
	.then((response) => {
		status = response.status;
		return response.json()
	})
	.then((responseJson) => {
		console.log("Response from server: " + status);
        console.log(responseJson);

        Toast.show(responseJson.message, Toast.LONG);
		callback(status, responseJson);
	 })
	.catch(error => {
		console.log(`Fetch Error =\n`, error);
	});
  }

  publishQueryOrSurvey() {
   this.setState({errorExpiryDate: '', errorGroupSelection:'' });
   if(this.state.groupPositionIndex === 0) {
        message = 'You have to choose a course group';
        this.setState({errorGroupSelection: message });
        Toast.show(message, Toast.LONG);
    }
   else { 
    this.setState({groupPositionIndex: this.state.groupPositionIndex - 1 }, () => {
        this.uploadToServer("http://192.168.14.145:3000/PublishQueryOrSurvey", (status, responseJson) => {
            console.log("return to function publish");
            if(status === 200) {
                this.props.navigation.pop(2);
            }
            else if(status === 401) {
                this.setState({
                    errorExpiryDate: responseJson.message,
                });
            }
        });
    });
  }
}

  uploadAnswerToQueryOrSurvey(index) {
    this.setState({ selectedAnswerIndex: index}, () => {
        console.log("Index chose: " + this.state.selectedAnswerIndex);
        this.uploadToServer("http://192.168.14.145:3000/UploadAnswerToQueryOrSurvey", (status, responseJson) => {
            this.props.navigation.pop(2);
        });
    });
  }

  edit() {
    this.props.navigation.navigate('QueryOrSurveyUpload', { isQuery: this.state.isQuery, editMode: true, coursePositionIndex: this.state.coursePositionIndex, queryOrSurvey: this.state.queryOrSurvey });
  }

  delete() {
    showAlert("Delete document", "You will delete this document, are you sure?", () => {
        this.uploadToServer("http://192.168.14.145:3000/DeleteQueryOrSurvey", (status, responseJson) => {
            this.props.navigation.pop(2);
        });
    });
  }

  render() { 

    let coursesGroupsList = this.state.coursesGroups.map( (s, i) => {
		return <Picker.Item key={i} value={s} label={s.groupName} />
    });
    
    const color1 = '#B22222';
    const color2 = '#228B22';
    const color3 = '#87CEFA';
    const color4 = '#F4A460';
    const color5 = '#663399';

    data = [
        {
            value: this.state.votersCounter1,
            svg: {
                fill: color1,
            },
        },
        {
            value: this.state.votersCounter2,
            svg: {
                fill: color2,
            },
        },
        {
            value: this.state.votersCounter3,
            svg: {
                fill: color3,
            },
        },
        {
            value: this.state.votersCounter4,
            svg: {
                fill: color4,
            },
        },   
    ];

    if(!this.state.isQuery) {
        data.push( {
            value: this.state.votersCounter5,
            svg: {
                fill: color5,
            },
        });
    }

    dataCounter = data.map((item, index)=> <Text key={index} style={[styles.textDataCounter ,{color: item.svg.fill}]}> {item.value} </Text> )

    return (
	<ScrollView resizeMode="center">
      <View style={styles.container}>

        {this.state.manageMode === true ? 
        <TouchableOpacity onPress={this.edit.bind(this)} style={styles.editOpacity}>
            <Icon2 name='edit' size={24} color='black' style={styles.iconEdit}/>
        </TouchableOpacity> : null }
        
        {this.state.manageMode === true ? 
        <TouchableOpacity onPress={this.delete.bind(this)} style={styles.editOpacity}>
            <Icon1 name='delete' size={24} color='black' style={styles.iconEdit}/>
        </TouchableOpacity> : null }
       

        <Text style={styles.head} h4> {this.state.groupName} </Text>
		<Text style={[styles.head, styles.question]}> {this.state.question} </Text>
        
        <TouchableOpacity onPress={this.uploadAnswerToQueryOrSurvey.bind(this, 0)} disabled={this.state.disabled} style={[styles.opacity, {backgroundColor: color1}]}>
            <Text style={styles.text}> {this.state.answer1} </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.uploadAnswerToQueryOrSurvey.bind(this, 1)} disabled={this.state.disabled} style={[styles.opacity, {backgroundColor: color2}]}>
            <Text style={styles.text}> {this.state.answer2} </Text>
        </TouchableOpacity>

          <TouchableOpacity onPress={this.uploadAnswerToQueryOrSurvey.bind(this, 2)} disabled={this.state.disabled} style={[styles.opacity, {backgroundColor: color3}]}>
            <Text style={styles.text}> {this.state.answer3} </Text>
        </TouchableOpacity>

          <TouchableOpacity onPress={this.uploadAnswerToQueryOrSurvey.bind(this, 3)} disabled={this.state.disabled} style={[styles.opacity, {backgroundColor: color4}]}>
            <Text style={styles.text}> {this.state.answer4} </Text>
        </TouchableOpacity>

        {!this.state.isQuery ? 
        <TouchableOpacity onPress={this.uploadAnswerToQueryOrSurvey.bind(this, 4)} disabled={this.state.disabled} style={[styles.opacity, {backgroundColor: color5}]}>
            <Text style={styles.text}> {this.state.answer5} </Text>
        </TouchableOpacity>  
        : null }

        {this.state.manageMode === true ? 
        <View style={styles.container}> 
            <Icon1 name='group' size={24} color='black' style={styles.courseGroupIcon}/>
            <Text style={styles.courseGroupText} h6> Please choose a course group: </Text>
            <Picker style={styles.picker}
                    selectedValue={this.state.courseGroup}
                    onValueChange={(itemValue, itemIndex) => this.setState({courseGroup: itemValue, groupPositionIndex: itemIndex}) }>
                    <Picker.Item key={'none'} value={'none'} label={"Choose a course group"} />
                    {coursesGroupsList}
            </Picker> 
            <FormValidationMessage labelStyle={styles.errorMessage}>{this.state.errorGroupSelection}</FormValidationMessage>

            <TouchableOpacity onPress={this._showDateTimePicker} style={styles.opacity}>
                <Icon1 name='schedule' size={25} color='black' style={styles.iconExpiryDate}/>
                <Text style={styles.text}>Pick expiry date</Text>
            </TouchableOpacity>
            <FormValidationMessage labelStyle={styles.errorMessage}>{this.state.errorExpiryDate}</FormValidationMessage>
            <DateTimePicker isVisible={this.state.isDateTimePickerVisible} onConfirm={this._handleDatePicked} onCancel={this._hideDateTimePicker}/>


            <TouchableOpacity onPress={this.publishQueryOrSurvey.bind(this)} style={styles.opacity}>
                <Icon1 name='publish' size={25} color='black' style={styles.iconButton}/>
                <Text style={[styles.text, styles.publish]}> Publish </Text>
            </TouchableOpacity>  
        </View> 
       : null }   

        {this.state.disabled && !this.state.manageMode ? 
        <View style={styles.container}> 
            <Text style={styles.head} h3> {'\n'}Students Results </Text>  
            <BarChart
                    style={{ height: 200 }}
                    data={data}
                    gridMin={0}
                    svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                    yAccessor={({ item }) => item.value}
                    contentInset={{ top: 20, bottom: 20 }}
                    >
            <Grid/>
            </BarChart>

            <View style={styles.dataCounterView}>
                {dataCounter}
            </View>

        </View> : null } 

        <Text> {'\n\n'} </Text>
        </View>
	</ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#ecf0f1',
    marginTop: 20,
  },
  dataCounterView:{
    flex: 1,
    marginTop: -12,
    marginRight: 10,
    justifyContent: 'space-around',
    flexDirection: 'row',
    width: 280,
    
  },
  textDataCounter: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  textDataCounter1: {
    marginTop: 0,
  },
  head: {
    alignSelf: 'center',
  },
  question: {
      fontSize: 19,
  },
  opacity: {
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#778899',
    marginTop: 10,
    height: 40,
    width: 200,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 5,
  },
  iconButton: {
  
  },
  courseGroupText: {
    marginTop: -20,
    marginLeft: 40,
  },
  text: {
    fontSize: 19,
  },
  publish: {
      
  },
  courseGroupIcon: {
   marginLeft: 10,
 },
  editOpacity: {
   
    width: 50,
  },
  picker: {
    width: 250,
  },
  iconEdit: {

  },
  iconExpiryDate: {
    marginRight: 5,
  },
  errorMessage: {
	alignSelf: 'center',
  },
});