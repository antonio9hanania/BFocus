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
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import NavigationService from '../../components/NavigationService';
import { LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { FBLoginManager } from 'react-native-facebook-login';

GoogleSignin.configure();

const config = {
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


export default class LoginScreen extends Component {
	constructor(props) {
		super(props);

	}

	state = {
	}

	async checkIfIdIsExists() {
		try {
			const username = await AsyncStorage.getItem('username');
			const id = await AsyncStorage.getItem('id');
			console.log('LoginScreen comp id in asyncStorage is: ', id);

			console.log("Username is: " + username + ", Id is: " + id);

			//Debug 
			if (username && id) {
				//	this.signInByMail();
			}
			//

		}
		catch (error) {
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
		console.log('---> Login screen Component UNmounted:');
	}


	signInFacebook() {

		try {
			console.log('Sign in to facebook:  ');
			FBLoginManager.loginWithPermissions(["email", "public_profile"], function (error, data) {
				if (!error) {
					console.log("Login data: ", data);

					var profileData = JSON.parse(data.profile);
					username = profileData.name;
					email = profileData.email;
					accessToken = data.credentials.token;

					console.log('Data username->' + username);
					console.log('Data email->' + email);
					console.log('The accessToken: ' + accessToken);

					loginToServer(username, email, accessToken, "facebook", handleResponse);

				}
				else if (error.type !== "cancel") {
					console.log("Error: ", JSON.stringify(error));
					alert("Error: " + JSON.stringify(error));
				}
			});
		}
		catch (err) {
			console.log("An error catched: ", err);
			alert("An error catched: " + err);
		}
	}

	async signInGoogle() {
		console.log("Sign with google");

		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			console.log(JSON.stringify(userInfo));

			username = userInfo.user.name;
			email = userInfo.user.email;
			accessToken = userInfo.accessToken;

			console.log('Data username->' + username);
			console.log('Data email->' + email);
			console.log('The accessToken: ' + accessToken);

			loginToServer(username, email, accessToken, "google", handleResponse);

		} catch (error) {
			if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
				console.log("error occured: " + error);
				alert("Some error occured while login: " + error);
			}
		}
	}

	signInByMail = () => {
		this.props.navigation.navigate('EmailLogin');
	}

	static navigationOptions = {
		header: null
	}

	render() {
		return (
			<ImageBackground source={require('../../img/img_background_picture.png')} imageStyle={{ resizeMode: 'cover' }} style={{ flex: 1 }}>
				<ScrollView resizeMode="center">
					<View style={styles.container}>
						<Image style={styles.logo} source={require('../../img/BFOCUS_LOGO.png')} />

						<TouchableOpacity onPress={this.signInFacebook.bind(this)} style={[styles.opacity, { backgroundColor: '#3b5998' }]} >
							<Image source={require('../../img/facebookIcon.png')} style={[styles.signInIcon, styles.facebookLogo]} />
							<Text style={styles.textLogin}> Sign in with Facebook </Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={this.signInGoogle.bind(this)} style={[styles.opacity, { backgroundColor: '#dd4b39' }]} >
							<Image source={require('../../img/googleIcon.png')} style={styles.signInIcon} />
							<Text style={styles.textLogin}> Sign in with Google </Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={this.signInByMail} style={[styles.opacity, { backgroundColor: '#00BFFF' }]} >
							<Image source={require('../../img/emailIcon.png')} style={styles.signInIcon} />
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
		justifyContent: 'center',
		alignItems: 'center',
	},

	text: {
		marginTop: -14,
		fontSize: 30,
	},

	textLogin: {
		fontSize: 20,
		justifyContent: 'flex-end',
		position: 'absolute',
		marginLeft: 45,
		marginTop: 5,
	},

	opacity: {
		flex: 1,
		marginTop: 20,
		height: 40,
		width: '75%',
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

	if (status === 200) {
		navigateAfterSuccessfullLogin(responseJson);
	}
}
