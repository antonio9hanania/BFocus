import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { signUpToServer, navigateAfterSuccessfullLogin } from '../../components/SendServerLogin';
import { Text, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Entypo';
import Toast from 'react-native-simple-toast';

export default class EmailSignupScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      errorMessageEmail: '',
      errorMessageUsername: '',
      errorMessagePassword: '',
      errorMessageConfirmPassword: '',
    };
    console.log('EmailSignupScreen comp id is: ', this.state.id);
  }

  componentDidMount() {
    console.log('EmailSignupScreen comp did mount id is: ', this.state.id);

  }

  componentWillUnmount() {
    console.log(">>>>Sign up email UNmounted");
  }


  handleResponse = ((status, responseJson) => {
    console.log("Got to response handler.");
    var messagetoPresentToUser;

    if (status >= 400) {
      messagetoPresentToUser = responseJson.message;
      if (status === 401) {
        this.setState({ errorMessageEmail: messagetoPresentToUser });
      }
      else if (status === 402) {
        this.setState({ errorMessageUsername: messagetoPresentToUser });
      }
      else if (status === 403) {
        this.setState({ errorMessagePassword: messagetoPresentToUser });
      }
      else if (status === 404) {
        this.setState({ errorMessageConfirmPassword: messagetoPresentToUser });
      }
    }
    else if (status === 200) {
      Toast.show("Signed up successfully!", Toast.LONG);
      navigateAfterSuccessfullLogin(responseJson);
    }
  });

  onLogin() {

    const { username, email, password, confirmPassword } = this.state;
    this.setState({ errorMessageEmail: '', errorMessageUsername: '', errorMessagePassword: '', errorMessageConfirmPassword: '' });
    console.log('EmailSignupScreen comp onLogin before id is: ', this.state.id);

    signUpToServer(username, email, password, confirmPassword, this.handleResponse);
    console.log('EmailSignupScreen comp onLogin after id is: ', this.state.id);

  }

  render() {
    return (
      <ImageBackground source={require('../../img/img_background_picture.png')} imageStyle={{ resizeMode: 'cover' }} style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.container}>
            <Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')} />

            <Icon name='mail' size={24} color='black' style={styles.iconInput} />
            <FormLabel labelStyle={styles.inputLabel}>Email</FormLabel>
            <FormInput
              value={this.state.email}
              onChangeText={(email) => this.setState({ email })}
              placeholder={'Enter your email here...'}
              placeholderTextColor="#000100"
              inputStyle={styles.input} />
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessageEmail} </FormValidationMessage>

            <Icon name='user' size={24} color='black' style={styles.iconInput} />
            <FormLabel labelStyle={styles.inputLabel}>Username</FormLabel>
            <FormInput
              value={this.state.username}
              onChangeText={(username) => this.setState({ username })}
              placeholder={'Enter your username here...'}
              placeholderTextColor="#000100"
              inputStyle={styles.input} />
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessageUsername} </FormValidationMessage>

            <Icon name='lock' size={24} color='black' style={styles.iconInput} />
            <FormLabel labelStyle={styles.inputLabel}>Password</FormLabel>
            <FormInput
              value={this.state.password}
              onChangeText={(password) => this.setState({ password })}
              placeholder={'Enter your password here...'}
              placeholderTextColor="#000100"
              secureTextEntry={true}
              inputStyle={styles.input} />
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessagePassword} </FormValidationMessage>

            <Icon name='lock' size={24} color='black' style={styles.iconInput} />
            <FormLabel labelStyle={styles.inputLabel}>Confirm Password</FormLabel>
            <FormInput
              value={this.state.confirmPassword}
              onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
              placeholder={'Enter your password confirmation here...'}
              placeholderTextColor="#000100"
              secureTextEntry={true}
              inputStyle={styles.input} />
            <FormValidationMessage labelStyle={styles.errorMessage}> {this.state.errorMessageConfirmPassword} </FormValidationMessage>

            <TouchableOpacity style={styles.opacity} onPress={this.onLogin.bind(this)}>
              <Icon name='check' size={25} color='black' style={styles.iconButton} />
              <Text style={styles.text}> Sign Up </Text>
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
  input: {
    color: "black",

  },
  opacity: {
    flex: 1,
    backgroundColor: 'rgba(59,89,152,0.6)',
    alignSelf: 'center',
    marginTop: 10,
    height: 40,
    width: '60%',
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
  iconButton: {


  },
  iconInput: {
    marginLeft: 20,
  },
  errorMessage: {
    marginTop: -3,
  }
});