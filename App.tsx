// import 'react-native-gesture-handler';
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// // import { createStackNavigator } from '@react-navigation/stack';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { enableScreens } from 'react-native-screens';

// import MountainSelectionScreen from './src/screens/MountainSelectionScreen';
// import PredictionResultScreen from './src/screens/PredictionResultScreen';
// import UserInputScreen from './src/screens/UserInputScreen';

// enableScreens();

// // ---------- Types ----------
// export type ForecastData = {
//   time: string;
//   weather: string;
//   temp: number;
//   humidity: number;
// };

// export type RootStackParamList = {
//   MountainSelection: undefined;
//   UserInput: {
//     mountain: {
//       name: string;
//       elevation: number;
//       difficulty: number;
//       weatherEncoded: number;
//       temperature: number;
//       humidity: number;
//       trailConditions: { time: string; condition: string }[];
//       forecastNow: ForecastData;
//       forecast3h: ForecastData;
//       forecast6h: ForecastData;
//     };
//   };
//   PredictionResult: {
//     mountain: {
//       name: string;
//       elevation: number;
//       difficulty: number;
//       weatherEncoded: number;
//       temperature: number;
//       humidity: number;
//       trailConditions: { time: string; condition: string }[];
//       forecastNow: ForecastData;
//       forecast3h: ForecastData;
//       forecast6h: ForecastData;
//       ageRange: number;
//       backpackWeightRange: number;
//       genderEncoded: number;
//       hikerExperienceEncoded: number;
//     };
//   };
// };


// // ---------- Stack Navigator ----------
// // const Stack = createStackNavigator<RootStackParamList>();
// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="MountainSelection">
//         <Stack.Screen
//           name="MountainSelection"
//           component={MountainSelectionScreen}
//           options={{ title: 'Select Mountain' }}
//         />
//         <Stack.Screen
//           name="UserInput"
//           component={UserInputScreen}
//           options={{ title: 'Your Profile' }}
//         />
//         <Stack.Screen
//           name="PredictionResult"
//           component={PredictionResultScreen}
//           options={{ headerShown: false }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import MountainSelectionScreen from './src/screens/MountainSelectionScreen';
import UserInputScreen from './src/screens/UserInputScreen';
import PredictionResultScreen from './src/screens/PredictionResultScreen';
import MapViewScreen from './src/screens/MapViewScreen';

enableScreens();

export type ForecastData = {
  time: string;
  weather: string;
  temp: number;
  humidity: number;
};

export type RootStackParamList = {
  MountainSelection: undefined;
  UserInput: {
    mountain: {
      latitude: number;
      longitude: number;
      name: string;
      elevation: number;
      difficulty: number;
      weatherEncoded: number;
      temperature: number;
      humidity: number;
      trailConditions: { time: string; condition: string }[];
      forecastNow: ForecastData;
      forecast3h: ForecastData;
      forecast6h: ForecastData;
    };
  };
  PredictionResult: {
    mountain: {
      longitude: number;
      latitude: number;
      name: string;
      elevation: number;
      difficulty: number;
      weatherEncoded: number;
      temperature: number;
      humidity: number;
      trailConditions: { time: string; condition: string }[];
      forecastNow: ForecastData;
      forecast3h: ForecastData;
      forecast6h: ForecastData;
      ageRange: number;
      backpackWeightRange: number;
      genderEncoded: number;
      hikerExperienceEncoded: number;
    };
  };
//   MapViewScreen: {
//   mountain: {
//     name: string;
//     latitude: number;
//     longitude: number;
//     elevation: number;
//     forecastNow: {
//       weather: string;
//       temp: number;
//       humidity: number;
//     };
//   };
//   trailPaths: {
//     length: number;
//     default: { latitude: number; longitude: number }[];
//     alternative: { latitude: number; longitude: number }[];
//   };
//   trailConditions: { condition: string }[];
//   timeNow: number;
// };
MapViewScreen: {
  mountain: {
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    forecastNow: {
      weather: string;
      temp: number;
      humidity: number;
    };
    ageRange: number;
    backpackWeightRange: number;
    genderEncoded: number;
    hikerExperienceEncoded: number;
    difficulty: number;
  };
  trailPaths: {
    length: number;
    default: { latitude: number; longitude: number }[];
    alternative: { latitude: number; longitude: number }[];
  };
  trailConditions: { condition: string }[];
  timeNow: number;
};

};



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MountainSelection">
        <Stack.Screen
          name="MountainSelection"
          component={MountainSelectionScreen}
          options={{ title: 'Select Mountain' }}
        />
        <Stack.Screen
          name="UserInput"
          component={UserInputScreen}
          options={{ title: 'Your Profile' }}
        />
        <Stack.Screen
          name="PredictionResult"
          component={PredictionResultScreen}
          options={{ headerShown: false }}
        />

          <Stack.Screen
          name="MapViewScreen"
          component={MapViewScreen}
          options={{ title: 'Trail Map' }}
        />
      </Stack.Navigator>
     
    

    </NavigationContainer>
  );
}
