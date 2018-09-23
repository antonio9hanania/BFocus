import React, { Component } from 'react';
import { AsyncStorage, ScrollView, ImageBackground, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-simple-toast';

export default class QueryOrSurveyUploadScreen extends Component {
   constructor(props) {
		super(props);
		this.state = {
				greeting : '',
				id: '',
				editMode: '',
				queryOrSurvey: '',
				submitText: 'Submit',
				coursePositionIndex: 0,

				username: '',
				isQuery: '',
				question: '',
				answer1: '',
				answer2: '',
				answer3: '',
				answer4: '',
				answer5: '',
				errorMessageQuestion: '',
				errorMessageAnswer1: '',
				errorMessageAnswer2: '',
				errorMessageAnswer3: '',
				errorMessageAnswer4: '',
				errorMessageAnswer5: '',
			};

			this.updateContent = this.updateContent.bind(this);
  }

  updateContent() {

	if(this.state.editMode === true) {
		this.setState({
			question: this.state.queryOrSurvey.question,
			answer1: this.state.queryOrSurvey.answers[0].text,
			answer2: this.state.queryOrSurvey.answers[1].text,
			answer3: this.state.queryOrSurvey.answers[2].text,
			answer4: this.state.queryOrSurvey.answers[3].text,
			submitText: "Save changes",
		}, () => console.log("update state."));

		if(!this.state.isQuery) {
			this.setState({
				answer5: this.state.queryOrSurvey.answers[4].text,
			});
		}
	}
	else if(!this.state.isQuery) {
		this.setState({
			answer1: 'Excellent',
			answer2: 'Good',
			answer3: 'Mediocre',
			answer4: 'Bad',
			answer5: 'Crummy',
		});
	}
  }

   
  async componentDidMount() {
		try {
			console.log("Query or survey did mount");
			const username = await AsyncStorage.getItem('username');
			const id = await AsyncStorage.getItem('id');
			const isQuery = await this.props.navigation.getParam('isQuery');
			const editMode = await this.props.navigation.getParam('editMode');
			const coursePositionIndex = await this.props.navigation.getParam('coursePositionIndex');
			const queryOrSurvey = '';
			const groupPositionIndex = 0;

			if(editMode === true) {
				queryOrSurvey = await this.props.navigation.getParam('queryOrSurvey');
				groupPositionIndex = await this.props.navigation.getParam('groupPositionIndex');
			}
			
			console.log("Username is: " + username + ", Id is: " + id + this.state.isQuery ? "Query" : "Survey" + " request");
			this.setState({
				username: username,
				greeting: 'Hi ' + username + ',',
				id: id,
				isQuery: isQuery,
				groupPositionIndex: groupPositionIndex,
				queryOrSurvey: queryOrSurvey,
				editMode: editMode,
				coursePositionIndex: coursePositionIndex,
			});
			
			this.updateContent();			
			console.log("isQuery is: " + this.state.isQuery);

		}
		catch(error) {
			console.log("An error occured: " + error);
		}
  }

	responseHandler(status, responseJson){
		Toast.show(responseJson.message, Toast.LONG);

		if(status === 200) {
			if(this.state.editMode === true) {
				this.props.navigation.pop(3);
			}
			else {
				this.props.navigation.pop(2);
			}
		}
		else if(status === 401) {
			this.setState({
				errorMessageQuestion: responseJson.message,
			});
		}
}

  onSubmit() {
	    this.setState({ errorMessageQuestion: '', errorMessageAnswer1: '', errorMessageAnswer2: '', errorMessageAnswer3: '', errorMessageAnswer4: '', errorMessageAnswer5: '' });
		var status;
		url = "http://192.168.14.145:3000/UploadQueryOrSurvey";
		data = {"editMode": this.state.editMode, "queryOrSurvey": this.state.queryOrSurvey, "coursePositionIndex": this.state.coursePositionIndex, "question" : this.state.question, "answer1": this.state.answer1, "answer2": this.state.answer2, "answer3": this.state.answer3, "answer4": this.state.answer4, "answer5": this.state.answer5};

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
		this.responseHandler(status, responseJson);
	 })
	.catch(error => {
		console.log(`Fetch Error =\n`, error);
	});
  }

  render() {

    return (
	<ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
		<ScrollView resizeMode="center">
		<View style={styles.container}>
			<Text style={styles.headList} h2> { this.state.isQuery ? "Query" : "Survey" } Upload </Text>
			
			<Icon name='question-answer' size={24} color='black' style={styles.iconInput}/>
			<FormLabel labelStyle={styles.inputLabel}>Question</FormLabel>
			<FormInput  value={this.state.question}
						onChangeText={(question) => this.setState({ question })}
						placeholder={'Enter you question here...'}
						placeholderTextColor="#000100"
						inputStyle={styles.input} />
			<FormValidationMessage style={styles.errorMessage}>{this.state.errorMessageQuestion}</FormValidationMessage>
			
			<Icon name='insert-comment' size={24} color='black' style={styles.iconInput}/>
			<FormLabel labelStyle={styles.inputLabel}>Answer1</FormLabel>
			<FormInput  value={this.state.answer1}
						onChangeText={(answer1) => this.setState({ answer1 })}
						placeholder={'Enter you answer here...'} 
						placeholderTextColor="#000100"
						inputStyle={styles.input}/>
			<FormValidationMessage>{this.state.errorMessageAnswer1}</FormValidationMessage>
			
			<Icon name='insert-comment' size={24} color='black' style={styles.iconInput}/>
			<FormLabel labelStyle={styles.inputLabel}>Answer2</FormLabel>
			<FormInput  value={this.state.answer2}
						onChangeText={(answer2) => this.setState({ answer2 })}
						placeholder={'Enter you answer here...'} 
						placeholderTextColor="#000100"
						inputStyle={styles.input}/>
			<FormValidationMessage>{this.state.errorMessageAnswer2}</FormValidationMessage>
			
			<Icon name='insert-comment' size={24} color='black' style={styles.iconInput}/>
			<FormLabel labelStyle={styles.inputLabel}>Answer3</FormLabel>
			<FormInput  value={this.state.answer3}
						onChangeText={(answer3) => this.setState({ answer3 })}
						placeholder={'Enter you answer here...'}
						placeholderTextColor="#000100"
						inputStyle={styles.input} />
			<FormValidationMessage>{this.state.errorMessageAnswer3}</FormValidationMessage>
			
			<Icon name='insert-comment' size={24} color='black' style={styles.iconInput}/>
			<FormLabel labelStyle={styles.inputLabel}>Answer4</FormLabel>
			<FormInput  value={this.state.answer4}
						onChangeText={(answer4) => this.setState({ answer4 })}
						placeholder={'Enter you answer here...'}
						placeholderTextColor="#000100"
						inputStyle={styles.input} />
			<FormValidationMessage>{this.state.errorMessageAnswer4}</FormValidationMessage>
				
			{!this.state.isQuery ? <Icon name='insert-comment' size={24} color='black' style={styles.iconInput}/> : null }
			{!this.state.isQuery ? <FormLabel labelStyle={styles.inputLabel}>Answer5</FormLabel> : null }
			{!this.state.isQuery ? <FormInput  value={this.state.answer5}
						onChangeText={(answer5) => this.setState({ answer5 })}
						placeholder={'Enter you answer here...'}
						placeholderTextColor="#000100"
						inputStyle={styles.input} /> : null }
			{!this.state.isQuery ? <FormValidationMessage>{this.state.errorMessageAnswer5}</FormValidationMessage>  : null }
			
			<TouchableOpacity onPress={this.onSubmit.bind(this)} style={styles.opacity}> 
				<Icon name='playlist-add-check' size={25} color='black' style={styles.iconButton}/>
				<Text style={styles.text}> {this.state.submitText} </Text>
			</TouchableOpacity>
			
			<Text> {'\n\n'} </Text>
			
		</View>
		</ScrollView>
	</ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headList: {
	alignSelf: 'center',
  },
  logo: {
		width: 200,
		height: 180,
		alignSelf: 'center',
		resizeMode: 'center',
		marginTop: -30,
   },
    opacity: {
		flex: 1,
		backgroundColor: '#778899',
		alignSelf: 'center',
		marginTop: 10,
		height: 40,
		width: 200,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 5,
  },
   greetings: {
		marginTop: 20,
  },
  textLogin: {
	  fontSize: 22,
	  justifyContent: 'center',
	  textAlign: 'center',
	  marginTop: 4,
	 
  },
  errorMessage: {
	marginTop: -50,
	
  },
  inputLabel: {
    marginTop: -20,
	marginLeft: 50,
	color: "black",
  },
  input: {
	color: "black",
  },
  iconButton: {
	
  },
   iconInput: {
      marginLeft: 20,
   },
   text: {
    fontSize: 19,
    
  },
});