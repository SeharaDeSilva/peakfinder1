import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { RootStackParamList } from "../../App";

type ForecastData = {
  temp: number;
  humidity: number;
  weather: string;
};

type PredictionResultScreenProps = {
  route: RouteProp<RootStackParamList, "PredictionResult">;
  navigation: NativeStackNavigationProp<RootStackParamList, "PredictionResult">;
};

const genderMap = ["Female", "Male"];
const experienceMap = ["Advanced", "Beginner", "Intermediate"];
const ageRangeMap = ["Adult", "Child", "Senior", "Young Adult"];
const backpackWeightMap = ["Light (0 - 7kg)", "Medium (5-10kg)", "Heavy (>10kg)"];

const PredictionResultScreen: React.FC<PredictionResultScreenProps> = ({
  route,
  navigation,
}) => {
  const { mountain } = route.params;
  const [loading, setLoading] = useState(true);
  const [timeNow, setTimeNow] = useState<number | null>(null);
  const [time3h, setTime3h] = useState<number | null>(null);
  const [time6h, setTime6h] = useState<number | null>(null);

  const encodeTemperature = (temp: number): number => {
    if (temp >= 1 && temp < 10) return 1;
    if (temp >= 10 && temp < 20) return 2;
    if (temp >= 20 && temp < 30) return 3;
    return 0;
  };

  const encodeHumidity = (humidity: number): number => {
    if (humidity >= 75) return 0;
    if (humidity >= 50) return 1;
    return 2;
  };

  const trailPaths: { [key: string]: { latitude: number; longitude: number }[] } = {
  "Adam's Peak": [
    { latitude: 6.8080, longitude: 80.4980 },
    { latitude: 6.8092, longitude: 80.4995 },
    { latitude: 6.8105, longitude: 80.5010 },
  ],
  "Bible Rock": [
    { latitude: 7.0980, longitude: 80.3310 },
    { latitude: 7.0995, longitude: 80.3325 },
    { latitude: 7.1008, longitude: 80.3340 },
  ],
  "Ella Rock": [
    { latitude: 6.8650, longitude: 81.0370 },
    { latitude: 6.8665, longitude: 81.0385 },
    { latitude: 6.8680, longitude: 81.0400 },
  ],
  "Hanthana": [
    { latitude: 7.2480, longitude: 80.6320 },
    { latitude: 7.2495, longitude: 80.6335 },
    { latitude: 7.2510, longitude: 80.6350 },
  ],
  "Lakegala": [
    { latitude: 7.5815, longitude: 80.9480 },
    { latitude: 7.5828, longitude: 80.9495 },
    { latitude: 7.5840, longitude: 80.9510 },
  ],
  "Narangala Mountain": [
    { latitude: 7.2150, longitude: 80.8815 },
    { latitude: 7.2165, longitude: 80.8830 },
    { latitude: 7.2180, longitude: 80.8845 },
  ],
  "Sigiriya": [
    { latitude: 7.9550, longitude: 80.7580 },
    { latitude: 7.9560, longitude: 80.7595 },
    { latitude: 7.9575, longitude: 80.7610 },
  ],
  "Yahangala": [
    { latitude: 7.3985, longitude: 80.9980 },
    { latitude: 7.3998, longitude: 80.9995 },
    { latitude: 7.4010, longitude: 81.0010 },
  ],
};
  const predictTime = async (forecast?: ForecastData) => {
    if (!forecast) return null;
    const payload = {
      elevation: mountain.elevation,
      weatherEncoded: mountain.weatherEncoded ?? 0,
      temperatureRange: encodeTemperature(forecast.temp),
      humidityRange: encodeHumidity(forecast.humidity),
      difficulty: mountain.difficulty,
      ageRange: mountain.ageRange,
      backpackWeightRange: mountain.backpackWeightRange,
      genderEncoded: mountain.genderEncoded,
      hikerExperienceEncoded: mountain.hikerExperienceEncoded,
    };

    try {
      const response = await fetch("https://seharabackend-460802.el.r.appspot.com/predict/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return data.time;
    } catch (error) {
      console.error("Prediction error:", error);
      return null;
    }
  };

const difficultyMap = ["Hard", "Moderate", "Easy"];
const handleFeedback = (response: string) => {
  Alert.alert("Thank you!", `You marked the prediction as "${response}".`);

  // Optional: Send to backend/database here
  // Example: saveFeedbackToFirebase({ mountain: mountain.name, result: response, time: timeNow });
};


  useEffect(() => {
    const runPredictions = async () => {
      try {
        const nowTime = await predictTime(mountain.forecastNow);
        const timeIn3h = await predictTime(mountain.forecast3h);
        const timeIn6h = await predictTime(mountain.forecast6h);
        setTimeNow(nowTime);
        setTime3h(timeIn3h);
        setTime6h(timeIn6h);
      } catch (err) {
        Alert.alert("Error", "Prediction failed.");
      } finally {
        setLoading(false);
      }
    };
    runPredictions();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#007AFF" />
          </TouchableOpacity>

          <Text style={styles.header}>{mountain.name}</Text>
          <Text style={styles.subtitle}>
            Estimated hiking time is based on your profile, mountain difficulty, and current weather.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hiking Profile</Text>
           <Text>Age Range: {ageRangeMap[mountain.ageRange]}</Text>
          <Text>Backpack: {backpackWeightMap[mountain.backpackWeightRange]}</Text>
            <Text>Gender: {genderMap[mountain.genderEncoded]}</Text>
           <Text>Experience: {experienceMap[mountain.hikerExperienceEncoded]}</Text>
         <Text>Difficulty: {difficultyMap[mountain.difficulty]}</Text>
          </View>
          <View style={styles.card}>
  <Text style={styles.cardTitle}>Current Weather</Text>
  <Text>Temperature: {mountain.forecastNow?.temp}°C</Text>
  <Text>Humidity: {mountain.forecastNow?.humidity}%</Text>
  <Text>Weather: {mountain.forecastNow?.weather}</Text>
</View>


<View style={styles.card}>
  <Text style={styles.cardTitle}> Estimated Hiking Time (Now)</Text>
  <Text style={styles.mainTime}>
    {timeNow?.toFixed(1)} hours
  </Text>
  <Text style={styles.note}>
    * This estimate is based on your profile and the current weather forecast.
  </Text>
</View>


<View style={styles.card}>
  <Text style={styles.cardTitle}>Prediction Comparison Summary</Text>

  <View style={styles.compareRow}>
    <Text style={styles.compareHeader}>Factor</Text>
    <Text style={styles.compareHeader}>Now</Text>
    <Text style={styles.compareHeader}>In 3h</Text>
    <Text style={styles.compareHeader}>In 6h</Text>
  </View>

  <View style={styles.compareRow}>
    <Text style={styles.compareLabel}>Weather</Text>
    <Text style={styles.compareValue}>{mountain.forecastNow?.weather}</Text>
    <Text style={styles.compareValue}>{mountain.forecast3h?.weather}</Text>
    <Text style={styles.compareValue}>{mountain.forecast6h?.weather}</Text>
  </View>

  <View style={styles.compareRow}>
    <Text style={styles.compareLabel}>Temp (°C)</Text>
    <Text style={styles.compareValue}>{mountain.forecastNow?.temp}°</Text>
    <Text style={styles.compareValue}>{mountain.forecast3h?.temp}°</Text>
    <Text style={styles.compareValue}>{mountain.forecast6h?.temp}°</Text>
  </View>

  <View style={styles.compareRow}>
    <Text style={styles.compareLabel}>Humidity (%)</Text>
    <Text style={styles.compareValue}>{mountain.forecastNow?.humidity}%</Text>
    <Text style={styles.compareValue}>{mountain.forecast3h?.humidity}%</Text>
    <Text style={styles.compareValue}>{mountain.forecast6h?.humidity}%</Text>
  </View>

  
</View>

<View style={styles.card}>
  <Text style={styles.cardTitle}>Estimated Time Progression</Text>

  <View style={styles.progressBarWrapper}>
    <View style={[styles.progressStep, { backgroundColor: "#007AFF" }]}>
      <Text style={styles.progressLabel}>{timeNow?.toFixed(1)}h</Text>
      <Text style={styles.progressSub}>Now</Text>
    </View>

    <View style={styles.progressLine} />

    <View style={[styles.progressStep, { backgroundColor: "#FF9500" }]}>
      <Text style={styles.progressLabel}>{time3h?.toFixed(1)}h</Text>
      <Text style={styles.progressSub}>+3h</Text>
    </View>

    <View style={styles.progressLine} />

    <View style={[styles.progressStep, { backgroundColor: "#FF3B30" }]}>
      <Text style={styles.progressLabel}>{time6h?.toFixed(1)}h</Text>
      <Text style={styles.progressSub}>+6h</Text>
    </View>
  </View>

  <Text style={styles.note}>
    * As conditions change, hiking time may increase due to heat, humidity, or rain.
  </Text>
</View>
{/* 
<TouchableOpacity
  style={styles.mapButton}
  onPress={() => navigation.navigate("MapViewScreen", {
    mountain: {
      ...mountain,
      latitude: trailPaths[mountain.name]?.[0]?.latitude ?? 0,
      longitude: trailPaths[mountain.name]?.[0]?.longitude ?? 0,
    },
   trailPaths: {
  length: (trailPaths[mountain.name] || []).length,
  default: trailPaths[mountain.name] || [],
  alternative: [], // you can load a real one later or leave empty
},
    trailConditions: mountain.trailConditions,
    timeNow: timeNow!,
  })}
>
  <Text style={styles.mapButtonText}>🗺️ View Trail on Map</Text>
</TouchableOpacity> */}
<TouchableOpacity
  style={styles.mapButton}
  onPress={() =>
    navigation.navigate("MapViewScreen", {
      mountain: {
        name: mountain.name,
        latitude: mountain.latitude,
        longitude: mountain.longitude,
        elevation: mountain.elevation,
        forecastNow: mountain.forecastNow,
        ageRange: mountain.ageRange,
        backpackWeightRange: mountain.backpackWeightRange,
        genderEncoded: mountain.genderEncoded,
        hikerExperienceEncoded: mountain.hikerExperienceEncoded,
        difficulty: mountain.difficulty,
      },
      trailPaths: {
        length: (trailPaths[mountain.name] || []).length,
        default: trailPaths[mountain.name] || [],
        alternative: [],
      },
      trailConditions: mountain.trailConditions,
      timeNow: timeNow!,
    })
  }
>
  <Text style={styles.mapButtonText}>🗺️ View Trail on Map</Text>
</TouchableOpacity>


        </ScrollView>
      )}
    </View>
  );
};

export default PredictionResultScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { alignItems: "center", paddingVertical: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontStyle: "italic", color: "#555", marginBottom: 20 },
  backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
  card: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#007AFF", marginBottom: 8 },
  value: { fontSize: 22, fontWeight: "bold", color: "#34A853" },
  compareRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 6,
},

compareHeader: {
  flex: 1,
  fontWeight: "bold",
  fontSize: 14,
  color: "#007AFF",
},

compareLabel: {
  flex: 1,
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
},

compareValue: {
  flex: 1,
  fontSize: 14,
  textAlign: "center",
  color: "#444",
},

note: {
  fontSize: 12,
  color: "#888",
  fontStyle: "italic",
  marginTop: 8,
  textAlign: "center",
},
mainTime: {
  fontSize: 24,           // reduced from 32
  fontWeight: "bold",
  color: "#007AFF",
  textAlign: "center",
  marginVertical: 6,
},
progressBarWrapper: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 10,
  marginBottom: 4,
},

progressStep: {
  width: 70,
  height: 70,
  borderRadius: 35,
  justifyContent: "center",
  alignItems: "center",
  elevation: 2,
},

progressLabel: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},

progressSub: {
  color: "#fff",
  fontSize: 12,
  marginTop: 2,
},

progressLine: {
  flex: 1,
  height: 2,
  backgroundColor: "#ccc",
  marginHorizontal: 6,
},
mapButton: {
  backgroundColor: "#007AFF",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  marginTop: 20,
},

mapButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},



});
