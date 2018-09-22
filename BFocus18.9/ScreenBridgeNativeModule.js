//  Created by react-native-create-bridge

import { NativeModules, NativeEventEmitter, Alert } from 'react-native'

const { ScreenBridge } = NativeModules

const ScreenEmitter = new NativeEventEmitter(ScreenBridge);

export default {
  exampleMethod () {
    return ScreenBridge.exampleMethod()
  },

  emitter: ScreenEmitter, 
  
  EXAMPLE_CONSTANT: ScreenBridge.EXAMPLE_CONSTANT
}
