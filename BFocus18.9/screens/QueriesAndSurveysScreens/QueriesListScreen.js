import React, { Component } from 'react';
import { AsyncStorage, FlatList, ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { List, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import PTRView from 'react-native-pull-to-refresh';


export default class QueriesListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      selected: '',
      coursesGroups: [],
      queries: [],
      refreshing: false,
      isLecturer: '',
      courses: '',
    };
  }

  static navigationOptions = {
		header: null
  }

  async componentDidMount() {
    console.log("->>>>>>> Queries Component did mount");

    try {
        const id = await AsyncStorage.getItem('id');
        const isLecturer = await AsyncStorage.getItem('isLecturer');

        console.log("Id is: " + id);
        this.setState({
            id: id,
            coursesGroups: this.props.navigation.getParam('coursesGroups'),
            isLecturer: JSON.parse(isLecturer),
        }, () => {
          if(this.state.isLecturer === true) {
            this.getLecturerCoursesQueriesAndSurveys();
          }
        });

        this.refreshQueriesAndSurveys();
        this.props.navigation.addListener('willFocus', (route) => {
            console.log("tab changed");
            this.refreshQueriesAndSurveys();
            if(this.state.isLecturer === true) {
              this.getLecturerCoursesQueriesAndSurveys();
            }
         });
	  }
    catch(error) {
        console.log("An error occured: " + error);
    }
  }

  componentWillUnmount() {
    console.log( '---> Queries Component UNmounted:');
  }

  responseHandlerRefresh = (status, responseJson) => {
    var message;

    if(status === 200) {
        console.log("updating queries list.");
        this.setState({ queries: responseJson.queries});
        if(responseJson.queries.length === 0) {
            message = "There is not any queries in the moment.";
        }
        else {
            message = "Successfully updated queries";
        }
      }

      console.log(message); 
  }

  responseHandlerCourses = (status, responseJson) => {
    if(status === 200) {
      console.log("Updating courses qureies and surveys list.");
      this.setState({ courses: responseJson.courses});
    }
  }
  
  getLecturerCoursesQueriesAndSurveys() {
    console.log("Fetching from server the courses");
    url = "http://192.168.14.145:3000/GetCoursesQueriesAndSurveysForLecturer";
    this.getFromServer(url, this.responseHandlerCourses);
  }
  
  refreshQueriesAndSurveys() {
    console.log("refreshing from the server published courses");
    Toast.show('Refreshing...', Toast.SHORT);
    url = "http://192.168.14.145:3000/RefreshQueriesAndSurveys";
    this.getFromServer(url, this.responseHandlerRefresh);
  }

  getFromServer(url, callback) {
    var status;
    url = url;

    fetch(url, {
        headers: {
                "Content-Type": "application/json",
                "id": this.state.id,
        },
	})
	.then((response) => {
		status = response.status;
		return response.json();
	})
	.then((responseJson) => {
		console.log("Response from server: " + status);
		console.log(responseJson);
    callback(status, responseJson);
	 })
	.catch(error => {
        console.log(`Fetch Error =\n`, error);
    });
  }

  onPressItem = (item) => {
    this.props.navigation.navigate('QueryOrSurvey', { isQuery: true, item: item });
  };

  onPressCourse = (item) => {
    var coursePositionIndex, i = 0;

    for(var iteminList of this.state.courses) {
      if(iteminList.courseCode === item.courseCode) {
        coursePositionIndex = i;
        break;
      }
      i++;
    }

    console.log("Course position index is:" + coursePositionIndex);
    this.props.navigation.navigate('QueryOrSurveyCourses', { isQuery: true, coursePositionIndex: coursePositionIndex, item: item });
  };

  renderItemGroupList = ({item}) => (
      <ListItem
        id = {item.value.id}
        onPress = {this.onPressItem.bind(this, item)}
        title = {item.groupName}
        subtitle = {item.value.question}
        containerStyle={{borderBottomWidth: 1}}
      />
    );
    
    renderItemCourseList = ({item}) => (
      <ListItem
        id = {item.courseCode}
        onPress = {this.onPressCourse.bind(this, item)}
        title = {item.courseName}
        subtitle = {item.courseCode}
        containerStyle={{borderBottomWidth: 1}}
      />
    );

    renderHeader = ()=> {
      return <Text style={styles.HeadList} h5>  {this.state.isLecturer === true ? "Published Queries:" : ""} </Text> 
    }

    renderManageHeader = ()=> {
      return <Text style={styles.HeadList} h5> Queries Per Course: </Text>
    }

    ListEmptyView = ()=> {
      return <Text style={styles.emptyMessage}> There are no queries to present. </Text> 
    }

    onRefresh = () => {
      return new Promise((resolve) => {
        this.refreshQueriesAndSurveys();
        setTimeout(() => { resolve(); }, 2200)
      });
    }

    /*onRefresh = () => {
      this.setState({refreshing: true});
      refreshQueriesAndSurveys().then(() => {
        setTimeout( () => this.setState({refreshing: false}), 1000);
      });
    }*/

  render() {
    return (
  <PTRView onRefresh={this.onRefresh.bind(this)} >
	<ScrollView resizeMode="center">
      <View style={styles.container}>    
        
      <Text style={styles.HeadList} h2> Queries </Text>

      <List containerStyle={styles.listStyle}> 
        <FlatList
          data={this.state.queries}
          keyExtractor={item => item.value._id}
          renderItem={this.renderItemGroupList}
          ListHeaderComponent={() => this.renderHeader()}
          ListEmptyComponent={this.ListEmptyView}
        />        
      </List>

      { this.state.isLecturer ?   
       <List containerStyle={styles.listStyle}> 
        <FlatList
          data={this.state.courses}
          keyExtractor={(item) => item.courseCode.toString()}
          renderItem={this.renderItemCourseList}
          ListHeaderComponent={() => this.renderManageHeader()}
        />        
      </List>
      : null }

      </View>
	</ScrollView>
  </PTRView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  opacity: {
		flex: 1,
		backgroundColor: '#778899',
		marginTop: 25,
		height: 40,
		width: 150,
		borderRadius: 10,
  },
   text: {
	 
  },
  HeadList: {
    alignSelf: 'center',
    backgroundColor: '#ecf0f1',
  },
  iconButton: {
    marginTop: 15,
    marginLeft: 15,
  },
  inputLabel: {
    marginTop: -17,
    marginLeft: 35,
  },
  listStyle:{
    alignSelf: 'center',
    justifyContent: 'center',
    width: 270,
    backgroundColor: '#ecf0f1',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  emptyMessage: {
    alignSelf: 'center',
    marginTop: 10,
  }
});

