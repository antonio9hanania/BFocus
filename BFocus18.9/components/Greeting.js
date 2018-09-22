import React, { Component } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { showAlert } from './alert';
import NavigationService from './NavigationService';

export default class Greeting extends Component {
    logout() {
        showAlert('Logout from user', 'Are you sure you want to logout?', () => {
          NavigationService.navigate('Login', {});
        });
      }

    render() {
        return (
            <View>
                <Text id="greetings" style={styles.greetings}> Hi {this.props.name}, </Text>
            
                <TouchableOpacity onPress={this.logout.bind(this)} style={styles.logoutOpacity} >
                <Icon name='logout' size={18} color='black' style={styles.iconButton}/>
                <Text style={styles.textLogout}> Logout </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
    },
    greetings: {
      marginLeft: 15,
    },
    logoutOpacity: {
      marginTop: 5,
      height: 30,
      width: 80,
      borderRadius: 10,
      marginLeft: 10,
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 5,
    },
    
    iconButton: {
      
    },
    textLogout: {
        fontSize: 14,
        marginLeft: 5,
      },
  });
  
  