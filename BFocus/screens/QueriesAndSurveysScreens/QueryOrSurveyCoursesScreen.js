import React, { Component } from 'react';
import { AsyncStorage, FlatList, ScrollView, ImageBackground, TouchableOpacity, View, StyleSheet } from 'react-native';
import { List, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';


export default class QueryOrSurveyCoursesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      selected: '',
      coursePositionIndex: 0,
      queriesOrSurveys: [],
      isLecturer: '',
      courseName: '',
      isQuery: '',
      queryOrSurveyString: '',
    };
  }

  async componentDidMount() {
    console.log("->>>>>>> Queries or Surveys courses screen did mount");

    try {
        const id = await AsyncStorage.getItem('id');
        const isLecturer = await AsyncStorage.getItem('isLecturer');
        const item = await this.props.navigation.getParam('item');
        const isQuery = await this.props.navigation.getParam('isQuery');
        const coursePositionIndex = await this.props.navigation.getParam('coursePositionIndex');

        this.setState({
            id: id,
            queriesOrSurveys: isQuery === true ? item.queries : item.surveys,
            isQuery: isQuery,
            isLecturer: JSON.parse(isLecturer),
            courseName: item.courseName,
            queryOrSurveyString: isQuery === true ? "Queries" : "Surveys",
            coursePositionIndex: coursePositionIndex,
        });
        
        console.log("coursePositionIndex: " + coursePositionIndex);
	}
    catch(error) {
        console.log("An error occured: " + error);
    }
  }

  componentWillUnmount() {
    console.log( '---> Queries or Surveys courses screen UNmounted:');
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
        console.log(`Fetch Error in getFromServer=\n`, error);
    });
  }

  uploadNewQuery() {
    this.props.navigation.navigate("QueryOrSurveyUpload", { isQuery: this.state.isQuery, coursePositionIndex: this.state.coursePositionIndex });
  }

  onPressItem = (item) => {
    this.props.navigation.navigate('QueryOrSurvey', { isQuery: this.state.isQuery, manageMode: true, item: {value: item, coursePositionIndex: this.state.coursePositionIndex, groupPositionIndex: 0} });
  };

  renderItemGroupList = ({item}) => (
      <ListItem
        id = {item._id}
        onPress = {this.onPressItem.bind(this, item)}
        title = {item.question}
        containerStyle={{borderBottomWidth: 1}}
        titleStyle= {{color:'black'}}
        subtitleStyle= {{color:'black'}}
      />
    );
    
    renderHeader = ()=> {
      return <Text style={styles.HeadList} h5> {this.state.queryOrSurveyString} </Text> 
    }

    ListEmptyView = ()=> {
      return <Text style={styles.emptyMessage}> There are no {this.state.queryOrSurveyString} to present. </Text> 
    }

  render() {
    return (
      <ImageBackground source={require('../../img/img_background_picture.png')}  imageStyle={{resizeMode: 'cover'}} style={{flex:1}}>
      <ScrollView resizeMode="center">
          <View style={styles.container}>
          
          <Text style={styles.courseNameHeader} h3> {this.state.courseName} </Text> 

          <TouchableOpacity onPress={this.uploadNewQuery.bind(this)} style={styles.opacity}> 
            <Icon name='upload' size={21} color='black' style={styles.iconButton}/>
            <Text style={styles.text}> Upload {this.state.isQuery === true ? "Query" : "Survey"} </Text>
          </TouchableOpacity>

          <List containerStyle={styles.listStyle}> 
            <FlatList
              data={this.state.queriesOrSurveys}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderItemGroupList}
              ListHeaderComponent={() => this.renderHeader()}
              ListEmptyComponent={this.ListEmptyView}
            />        
          </List>

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
    marginTop: 20,
  },
  opacity: {
    alignSelf: 'center',
		flex: 1,
		backgroundColor: 'rgba(59,89,152,0.6)',
		marginTop: 25,
		height: 40,
		width: 150,
    borderRadius: 10,
    flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 5,
  },
   text: {
    fontSize: 17,
    color: "black",
  },
  HeadList: {
    alignSelf: 'center',
    color: "black",
  },
  iconButton: {
    marginRight: 5,
  },
  listStyle:{
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
  },
  courseNameHeader: {
    alignSelf: 'center',
  },
});

