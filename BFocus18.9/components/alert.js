import { Alert } from 'react-native';


export const showAlert = (title, message, callback) => {
    Alert.alert(
      title,
      message,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => {
           console.log('OK Pressed');
           callback();
          }
        },
      ],
      { cancelable: false }
    )
  }