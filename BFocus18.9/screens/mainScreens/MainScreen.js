/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Image, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';

import { createBottomTabNavigator, createStackNavigator} from 'react-navigation';

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
    NavigationService.setCurrentlocation("Main");
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

/*
const MenuImage = ({navigation}) => {
    if(!navigation.state.isDrawerOpen){
        return <Icon1 name="menu" size={25} color="gray"  style={{marginLeft: 5}} />;
    }else{
        return <Icon1 name="keyboard-arrow-left" size={25} color="gray" />;
    }
}

const AppDrawlerNavigator = createDrawerNavigator({
  Home: {
    screen: AppTabNavigator,
    navigationOptions: () => ({ drawerLabel: () => <Text style={styles.labelMenu}>Home</Text>,  drawerIcon: () =>  <Icon1 name="home" size={25} color="black" />  })
   
  },
  
  QueryUpload:{
    screen: QueryOrSurveyUploadScreen,
    navigationOptions: () => ({ drawerLabel: () => <Text style={styles.labelMenu}>Query Upload</Text>,  drawerIcon: () =>  <Icon1 name="home" size={25} color="black" />  })
  }, 
 /* SurveyUpload:{
    screen: SurveyUploadScreen,
    navigationOptions: () => ({ drawerLabel: () => <Text style={styles.labelMenu}>Survey Upload</Text>,  drawerIcon: () =>  <Icon1 name="home" size={25} color="black" />  })
  }, */
/*});

const StackNavigator = createStackNavigator({
    
  //important: key and screen name (i.e. DrawerNavigator) should be same while using the drawer navigator inside stack navigator.
  
  DrawerNavigator:{
      screen: AppDrawlerNavigator
  }
  
},{
  navigationOptions: ({ navigation }) => ({
      title: 'BFocus',  // Title to appear in status bar
      headerLeft: 
      <TouchableOpacity  onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())} }>
          <MenuImage style="styles.bar" navigation={navigation}/>
      </TouchableOpacity>,
      headerStyle: {
          backgroundColor: '#333',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },

  })
});*/

const styles = StyleSheet.create({
  labelMenu: {
    color: 'black',
  },
});



