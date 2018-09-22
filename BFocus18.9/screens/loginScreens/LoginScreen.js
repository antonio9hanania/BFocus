/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
	View,
	AsyncStorage,
  TouchableOpacity,
  Image,
  ScrollView,
	Alert,
	ImageBackground,
} from 'react-native';
import OAuthManager from 'react-native-oauth';
import PushController from '../../components/PushController';
import { loginToServer, navigateAfterSuccessfullLogin } from '../../components/SendServerLogin';
import Toast from 'react-native-simple-toast';
import NavigationService from '../../components/NavigationService';
import { LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
  
 const config =  {
  google: {
    callback_url: `com.googleusercontent.apps.1060920161462-i2q3m9burgnpp9snfolk5n1vh82lku17:/google`,
    client_id: '1060920161462-h6svfmk98m3crou6i1tii9197i34ftei.apps.googleusercontent.com',
    client_secret: 'nMCITPgj8EAfPLnGrcQQx1UN'
  },
  github: {
    client_id: 'Iv1.6de047c2e0254e2f',
    client_secret: '4b104e59694a4e6b3c939de7600be1ad11f40b77'
  }
};

const manager = new OAuthManager('BFocus');

type Props = {};
export default class LoginScreen extends Component<Props> {
	constructor(props) {
		super(props);
		
	}
	
	state = { 
  }
	
	 async checkIfIdIsExists () {
		 try {
			const username = await AsyncStorage.getItem('username');
			const id = await AsyncStorage.getItem('id');
			
			console.log("Username is: " + username + ", Id is: " + id);

			//Debug 
			if(username && id) {
			//	this.signInByMail();
			}
			//

		 }
		catch(error) {
			console.log("error: " + error);
		}
	}
   
  componentDidMount() {
		console.log("->>>>>>> Login Coomponent did mount");
		manager.configure(config);
		this.checkIfIdIsExists();
		NavigationService.setCurrentlocation("Login");
	}
	
  componentWillUnmount() {
		console.log( '---> Login screen Component UNmounted:');
  }
	
	/*activateExample =()=> {
	  ScreenBridge.exampleMethod();
  };*/
	
  /* for(var key in resp.provider) {
			console.log(key + ": " + resp[key]);
			
		  }
		  */

  signInFacebook() { 
		//LoginManager.logOut();
		console.log('Sign in to facebook:  ');
		LoginManager.logInWithReadPermissions(["public_profile", "email"]).then(
			function(result) {
				if (result.isCancelled) {
					console.log('Login cancelled');
				} else {
					console.log('Login success with permissions: '	+ result.grantedPermissions.toString());

					new GraphRequestManager().addRequest(new GraphRequest('/me?fields=id,email,name', null,
					((error, result) => { 
						if(error) {
							console.log('an error occured while fetching data');
						}
						else {
							username = result.name;
							email = result.email;
							console.log('Data name->', username);
							console.log('Data email->', email);
					
							loginToServer(username, email, "1111", "facebook", handleResponse);		
						}
					 }),
					)).start();	
				}
			},
			function(error) {
				console.log('Login fail with error: ' + error);
			}
		);




	  /*manager.authorize('facebook', {scopes: 'public_profile,email',})
	  .then((resp) => {
		  if(resp.authorized) {
			  manager.makeRequest('facebook', '/me?fields=email,name')
			   .then(answer => {
				
				console.log('Data name->', answer.data.name);
				console.log('Data email->', answer.data.email);
				accessToken= resp.response.credentials.accessToken,
				username = answer.data.name;
				email = answer.data.email;

			  loginToServer(username, email, accessToken, "facebook", this.handleResponse);
			  
				console.log('The accessToken: ' + accessToken);
				
			  });
		    }
		  })
	  .catch(err => {
		   console.log('there was a problem' + err);
		   Alert.alert('there was a problem' + err);
		});*/
  }
  
  signInGoogle() {
	  manager.authorize('google', {scopes: 'email'})
	  .then((resp) => {
		  if(resp.authorized) {
			 const googleUrl = 'https://www.googleapis.com/plus/v1/people/me';
			 manager.makeRequest('google', googleUrl)
			 .then(answer => {
				for(var key in answer) {
					console.log(key + ": " + answer[key]);
					
				}
				 console.log('Data username->', answer.data.displayName);
				 console.log('Data email->', answer.data.emails[0].value);
				 username= answer.data.displayName;
				 email = answer.data.emails[0].value;
				 accessToken= resp.response.credentials.accessToken;

				 loginToServer(username, email, accessToken, "google", handleResponse);
				 
				 console.log('The accessToken: ' + accessToken);
			 }); 
		  }		  
	  })
	  .catch(err => {
	    console.log('there was a problem' + err);
	  	Alert.alert('there was a problem' + err);
	  });
  }
  
  signInByMail = () => {
	  this.props.navigation.navigate('EmailLogin');
  }
  
  static navigationOptions = {
		header: null
	}
	
  render() {
    return (
			<ImageBackground source={require('../../img/backgroundPicture.jpg')} style={{flex:1}}>
			<ScrollView resizeMode="center">
				<View style={styles.container}>
					<Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')}/>

					<TouchableOpacity onPress={this.signInFacebook.bind(this)} style={[styles.opacity, {backgroundColor: '#3b5998'}]} >
						<Image source={require('../../img/facebookIcon.png')} style={[styles.signInIcon, styles.facebookLogo]} />
						<Text style={styles.textLogin}> Sign in with Facebook </Text>
					</TouchableOpacity>
						
					<TouchableOpacity onPress={this.signInGoogle.bind(this)} style={[styles.opacity, {backgroundColor: '#dd4b39'}]} >
						<Image source={require('../../img/googleIcon.png')} style={styles.signInIcon}/>
						<Text style={styles.textLogin}> Sign in with Google </Text>
					</TouchableOpacity>
					
					<TouchableOpacity onPress={this.signInByMail} style={[styles.opacity, {backgroundColor: '#00BFFF'}]} >
						<Image source={require('../../img/emailIcon.png')} style={styles.signInIcon}/>
						<Text style={styles.textLogin}> Sign in with Email </Text>
					</TouchableOpacity>
					<PushController />

				</View>
			</ScrollView>
		</ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    justifyContent:'center',
		alignItems: 'center',
	},
	
  text: {
	  marginTop: -14,
	  fontSize: 30,
  },
  
  textLogin: {
	  fontSize: 22,
	  justifyContent: 'flex-end',
	  position: 'absolute',
	  marginLeft: 45,
  },
  
   opacity: {
		flex: 1,
		marginTop: 20,
		height: 40,
		width: 270,
		borderRadius: 10,
  },
  logo: {
		width: 200,
		height: 180,
		marginTop: -30,
		alignSelf: 'center',
		resizeMode: 'center',
   },
  signInIcon: {
	  width: 40,
		height: 40,
	  resizeMode: 'contain',
		alignSelf: 'auto',
		justifyContent: 'flex-start',
		marginLeft: 7,
   },
  facebookLogo: {
	  width: 30,
	  height: 30,  
  },
});

function handleResponse(status, responseJson) {
	console.log("Got to response handler.");

	if( status === 200) {
			navigateAfterSuccessfullLogin(responseJson);
	}   
}

export const logout = () => {
	console.log("got to logout");
	AsyncStorage.getItem('loginPlace', (err, loginPlace) => {
		if(err || loginPlace === null) {
			console.log("Not need to deautorize");
		}
		else {
			console.log("login place is: " + loginPlace);
			if(loginPlace === "facebook") {
				console.log("deauthorizing..");
				LoginManager.logOut();
			}
			else if(loginPlace) {
				console.log("deauthorizing..");
				manager.deauthorize(loginPlace);
			}
		}
	});
}