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
      const response = await fetch("http://192.168.8.200:5000/predict/travel", {
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
            <Text style={styles.cardTitle}>Your Hiking Profile</Text>
            <Text>Age Range: {mountain.ageRange}</Text>
            <Text>Backpack: {mountain.backpackWeightRange}</Text>
            <Text>Gender: {genderMap[mountain.genderEncoded]}</Text>
            <Text>Experience: {experienceMap[mountain.hikerExperienceEncoded]}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Estimated Hiking Time</Text>
            <Text>Now: {timeNow?.toFixed(1)} hours</Text>
            <Text>In 3h: {time3h?.toFixed(1)} hours</Text>
            <Text>In 6h: {time6h?.toFixed(1)} hours</Text>
          </View>
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
});
