import React, { Component } from 'react';
import { Image, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

import { createBottomTabNavigator, createStackNavigator } from 'react-navigation';

import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/Foundation';
//import Icon3 from 'react=react-native-vector-icons/SimpleLineIcons';

import HomeScreen from './HomeScreen';
import CourseGroupChartScreen from './CourseGroupChartScreen';
import QueriesListScreen from '../QueriesAndSurveysScreens/QueriesListScreen';
import SurveysListScreen from '../QueriesAndSurveysScreens/SurveysListScreen';
import QueryOrSurveyScreen from '../QueriesAndSurveysScreens/QueryOrSurveyScreen';
import QueryOrSurveyUploadScreen from '../QueriesAndSurveysScreens/QueryOrSurveyUploadScreen';
import QueryOrSurveyCoursesScreen from '../QueriesAndSurveysScreens/QueryOrSurveyCoursesScreen';
import NavigationService from '../../components/NavigationService';

export default class MainScreen extends Component {

  static navigationOptions = {
    header: null
  }

  componentWillMount() {
    console.log('---!!!!> Main screen Component mounted:');
    NavigationService.setCurrentlocation("Main");
  }

  componentWillUnmount() {
    console.log('---!!!!> Main screen Component UNmounted:');
  }

  render() {
    return (
      <AppTabNavigator />
    );
  }
}

const AppStackNavigator1 = createStackNavigator({
  Home: HomeScreen,
  CourseGroupChart: CourseGroupChartScreen,
});

const AppStackNavigator2 = createStackNavigator({
  Queries: QueriesListScreen,
  QueryOrSurveyCourses: QueryOrSurveyCoursesScreen,
  QueryOrSurveyUpload: QueryOrSurveyUploadScreen,
  QueryOrSurvey: QueryOrSurveyScreen,
});

const AppStackNavigator3 = createStackNavigator({
  Surveys: SurveysListScreen,
  QueryOrSurveyCourses: QueryOrSurveyCoursesScreen,
  QueryOrSurveyUpload: QueryOrSurveyUploadScreen,
  QueryOrSurvey: QueryOrSurveyScreen,
});

const AppTabNavigator = createBottomTabNavigator({
  Home: AppStackNavigator1,
  Queries: AppStackNavigator2,
  Surveys: AppStackNavigator3,
},
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

        if (routeName === 'Home') {
          iconName = `home`;
          return <Icon1 name={iconName} size={25} color={tintColor} />;
        }
        else if (routeName === 'Queries') {
          iconName = `question-answer`;
          return <Icon1 name={iconName} size={25} color={tintColor} />;

        }
        else if (routeName === 'Surveys') {
          iconName = `clipboard-pencil`;
          return <Icon2 name={iconName} size={25} color={tintColor} />;

        }
      }
    }),
    tabBarOptions: {
      activeTintColor: 'blue',
      inactiveTintColor: 'gray',
    },

  }
);


const styles = StyleSheet.create({
  labelMenu: {
    color: 'black',
  },
});



