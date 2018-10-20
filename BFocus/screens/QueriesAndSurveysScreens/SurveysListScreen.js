import React, { Component } from 'react';
import { AsyncStorage, FlatList, ScrollView, ImageBackground, TouchableOpacity, View, StyleSheet } from 'react-native';
import { List, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import PTRView from 'react-native-pull-to-refresh';
import { SERVER_ADDR } from '../../constants/serverAddress';

export default class SurveysListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: '',
      selected: '',
      coursesGroups: [],
      surveys: [],
      refreshing: false,
      isLecturer: '',
      courses: '',
    };
  }

  static navigationOptions = {
    header: null
  }

  async componentDidMount() {
    console.log("->>>>>>> Surveys Component did mount");

    try {
      const id = await AsyncStorage.getItem('id');
      const isLecturer = await AsyncStorage.getItem('isLecturer');

      console.log("Id is: " + id);
      this.setState({
        id: id,
        coursesGroups: this.props.navigation.getParam('coursesGroups'),
        isLecturer: JSON.parse(isLecturer),
      }, () => {
        if (this.state.isLecturer === true) {
          this.getLecturerCoursesQueriesAndSurveys();
        }
      });

      this.refreshQueriesAndSurveys();
      this.props.navigation.addListener('willFocus', (route) => {
        console.log("tab changed");
        this.refreshQueriesAndSurveys();
        if (this.state.isLecturer === true) {
          this.getLecturerCoursesQueriesAndSurveys();
        }
      });
    }
    catch (error) {
      console.log("An error occured: " + error);
    }
  }

  componentWillUnmount() {
    console.log('---> Surveys Component UNmounted:');
  }

  responseHandlerRefresh = (status, responseJson) => {
    var message;

    if (status === 200) {
      console.log("updating surveys list.");
      this.setState({ surveys: responseJson.surveys });
      if (responseJson.surveys.length === 0) {
        message = "There is not any surveys in the moment.";
      }
      else {
        message = "Successfully updated surveys";
      }
    }

    console.log(message);
  }

  responseHandlerCourses = (status, responseJson) => {
    if (status === 200) {
      console.log("Updating courses qureies and surveys list.");
      this.setState({ courses: responseJson.courses });
    }
  }

  getLecturerCoursesQueriesAndSurveys() {
    console.log("Fetching from server the courses");
    url = SERVER_ADDR + "GetCoursesQueriesAndSurveysForLecturer";
    this.getFromServer(url, this.responseHandlerCourses);
  }

  refreshQueriesAndSurveys() {
    console.log("refreshing from the server published courses");
    Toast.show('Refreshing...', Toast.SHORT);
    url = SERVER_ADDR + "RefreshQueriesAndSurveys";
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
        console.log(`Fetch Error in getFromServer =\n`, error);
      });
  }

  onPressCourse = (item) => {
    var coursePositionIndex, i = 0;

    for (var iteminList of this.state.courses) {
      if (iteminList.courseCode === item.courseCode) {
        coursePositionIndex = i;
        break;
      }
      i++;
    }

    console.log("Course position index is:" + coursePositionIndex);
    this.props.navigation.navigate('QueryOrSurveyCourses', { isQuery: false, coursePositionIndex: coursePositionIndex, item: item });
  };

  onPressItem = (item) => {
    this.props.navigation.navigate('QueryOrSurvey', { isQuery: false, item: item });
  };

  renderItemGroupList = ({ item }) => (
    <ListItem
      id={item.value.id}
      onPress={this.onPressItem.bind(this, item)}
      title={item.groupName}
      subtitle={item.value.question}
      containerStyle={{ borderBottomWidth: 1 }}
      titleStyle={{ color: 'black' }}
      subtitleStyle={{ color: 'black' }}
    />
  );

  renderItemCourseList = ({ item }) => (
    <ListItem
      id={item.courseCode}
      onPress={this.onPressCourse.bind(this, item)}
      title={item.courseName}
      subtitle={item.courseCode}
      containerStyle={{ borderBottomWidth: 1 }}
      titleStyle={{ color: 'black' }}
      subtitleStyle={{ color: 'black' }}
    />
  );

  renderHeader = () => {
    return <Text style={styles.HeadList} h5>  {this.state.isLecturer === true ? "Published Surveys:" : ""} </Text>
  }

  renderManageHeader = () => {
    return <Text style={styles.HeadList} h5> Surveys Per Course: </Text>
  }

  ListEmptyView = () => {
    return <Text style={styles.emptyMessage}> There are no surveys to present. </Text>
  }

  onRefresh = () => {
    return new Promise((resolve) => {
      this.refreshQueriesAndSurveys();
      setTimeout(() => { resolve(); }, 2200)
    });
  }

  render() {
    return (
      <ImageBackground source={require('../../img/img_background_picture.png')} imageStyle={{ resizeMode: 'cover' }} style={{ flex: 1 }}>
        <PTRView onRefresh={this.onRefresh.bind(this)} >
          <ScrollView resizeMode="center">
            <View style={styles.container}>

              <Text style={styles.HeadList} h2> Surveys </Text>

              <List containerStyle={styles.listStyle}>
                <FlatList
                  data={this.state.surveys}
                  keyExtractor={item => item.value._id}
                  renderItem={this.renderItemGroupList}
                  ListHeaderComponent={() => this.renderHeader()}
                  ListEmptyComponent={this.ListEmptyView}
                />
              </List>

              {this.state.isLecturer ?
                <List containerStyle={styles.listStyle}>
                  <FlatList
                    data={this.state.courses}
                    keyExtractor={(item) => item.courseCode.toString()}
                    renderItem={this.renderItemCourseList}
                    ListHeaderComponent={() => this.renderManageHeader()}
                  />
                </List>
                : null}

            </View>
          </ScrollView>
        </PTRView>
      </ImageBackground>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    justifyContent: 'center',
  },
  opacity: {
    flex: 1,
    backgroundColor: 'rgba(59,89,152,0.6)',
    marginTop: 25,
    height: 40,
    width: 150,
    borderRadius: 10,
  },
  text: {

  },
  HeadList: {
    alignSelf: 'center',
    color: "black",
  },
  iconButton: {
    marginTop: 15,
    marginLeft: 15,
  },
  inputLabel: {
    marginTop: -17,
    marginLeft: 35,
  },
  listStyle: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 270,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  emptyMessage: {
    alignSelf: 'center',
    marginTop: 10,
    fontSize: 17,
    color: "black",
  }
});

