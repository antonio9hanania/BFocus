import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { loginToServerWithPassword, navigateAfterSuccessfullLogin } from '../../components/SendServerLogin';
import { Text, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-simple-toast';

export default class EmailLoginScreen extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      username: '',
      email: '',
      password: '',
      errorMessageEmail: '',
			errorMessagePassword: '',
    };

  }
  
  componentDidMount() {
    //loginToServerWithPassword("zz@xx.yy", "1234", this.handleResponse); //Lecturer1
    //loginToServerWithPassword("aa@bb.cc", "1234", this.handleResponse); //Lecturer2

    //loginToServerWithPassword("tt@yy.uu", "1234", this.handleResponse); //Student1
    //loginToServerWithPassword("ee@rr.tt", "1234", this.handleResponse); //Student2
    //loginToServerWithPassword("oo@pp.ll", "1234", this.handleResponse); //Student3
    //loginToServerWithPassword("pp@pp.pp", "1234", this.handleResponse); //Student3
  }
  
  handleResponse = ((status, responseJson) =>{
    console.log("Got to response handler.");
    var messagetoPresentToUser;

    if(status >= 400) {
      messagetoPresentToUser = responseJson.message;
      if(status === 401) {
        this.setState({ errorMessageEmail: messagetoPresentToUser });
      }
      else {
        this.setState({ errorMessagePassword: messagetoPresentToUser });
      }
    }
    else if( status === 200) {
       navigateAfterSuccessfullLogin(responseJson);
    }   
  });


  onLogin() {
    const {  email, password  } = this.state;
    this.setState({ errorMessageEmail: '', errorMessagePassword: '' });

  	loginToServerWithPassword(email, password, this.handleResponse);
  }

  render() {
    return (
      <ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
        <ScrollView> 
          <View style={styles.container}>
          <Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')}/>
            
            <Icon name='mail' size={24} color='black' style={styles.iconInput}/>
            <FormLabel labelStyle={styles.inputLabel}>Email</FormLabel>
            <FormInput
              value={this.state.email}
              onChangeText={(email) => this.setState({ email })}
              placeholder={'Enter your email here...'}
              placeholderTextColor="#000100"
              inputStyle={styles.input}/>
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessageEmail} </FormValidationMessage>

            <Icon name='lock' size={24} color='black' style={styles.iconInput}/>
            <FormLabel labelStyle={styles.inputLabel}>Password</FormLabel>
            <FormInput
              value={this.state.password}
              onChangeText={(password) => this.setState({ password })}
              placeholder={'Enter your password here...'}
              placeholderTextColor="#000100"
              secureTextEntry={true}
              inputStyle={styles.input} />
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessagePassword} </FormValidationMessage>

            <TouchableOpacity style={styles.opacity} onPress={this.onLogin.bind(this)}>
              <Icon name='check' size={25} color='black' style={styles.iconLogin}/>
              <Text style={styles.text}> Login </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.opacity} onPress={()=> this.props.navigation.navigate('EmailSignup')}>
              <Icon name='add-user' size={24} color='black' style={styles.iconButton}/>
              <Text style={styles.text1}> Don't have an account? Sign up! </Text>
            </TouchableOpacity>

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
  logo: {
		width: 200,
		height: 180,
		alignSelf: 'center',
		resizeMode: 'center',
		marginTop: -40,
   },
  text: {
    fontSize: 18,
    
  },
  text1: {
    fontSize: 16,
    marginTop: 4,
  },
  opacity: {
    flex: 1,
    backgroundColor: '#778899',
    marginLeft: 20,
    marginTop: 10,
    height: 40,
    width: 270,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 5,
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
    marginLeft: 6,
   },
   iconButton: {
   },
   iconLogin: {

   },
   iconInput: {
      marginLeft: 20,
   },
   errorMessage: {
    marginTop: -3,
   }
});