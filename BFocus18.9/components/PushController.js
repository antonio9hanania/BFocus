import React, { Component } from 'react';
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

export default class PushController extends Component {
	componentDidMount() {
		PushNotification.configure({

			// (required) Called when a remote or local notification is opened or received
			onNotification: function(notification) {
				console.log( 'NOTIFICATION:', notification );

				// process the notification

				// required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
				if(Platform.OS === 'ios') {
					notification.finish(PushNotificationIOS.FetchResult.NoData);
				}
			},

			// IOS ONLY (optional): default: all - Permissions to register.
			permissions: {
				alert: true,
				badge: true,
				sound: true
			},

			// Should the initial notification be popped automatically
			// default: true
			popInitialNotification: true,

			/**
			  * (optional) default: true
			  * - Specified if permissions (ios) and token (android and ios) will requested or not,
			  * - if not, you must call PushNotificationsHandler.requestPermissions() later
			  */
			requestPermissions: true,
		});
	}
	
	render() {
		return null;
	}
}