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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
