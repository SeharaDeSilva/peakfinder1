import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  ImageBackground
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import axios from "axios";
const mountains = [
  { name: "Adam's Peak", latitude: 6.8094, longitude: 80.4999, elevation: 2243, difficulty: "Hard", difficultyEncoded: 0 },
  { name: "Bible Rock", latitude: 7.1000, longitude: 80.3333, elevation: 798, difficulty: "Hard", difficultyEncoded: 0 },
  { name: "Ella Rock", latitude: 6.8667, longitude: 81.0386, elevation: 1141, difficulty: "Hard", difficultyEncoded: 0 },
  { name: "Hanthana", latitude: 7.2500, longitude: 80.6333, elevation: 1200, difficulty: "Moderate", difficultyEncoded: 1 },
  { name: "Lakegala", latitude: 7.5833, longitude: 80.9500, elevation: 1310, difficulty: "Hard", difficultyEncoded: 0 },
  { name: "Narangala Mountain", latitude: 7.2167, longitude: 80.8833, elevation: 1527, difficulty: "Moderate", difficultyEncoded: 1 },
  { name: "Sigiriya", latitude: 7.9566, longitude: 80.7595, elevation: 349, difficulty: "Moderate", difficultyEncoded: 1 },
  { name: "Yahangala", latitude: 7.4000, longitude: 81.0000, elevation: 1220, difficulty: "Hard", difficultyEncoded: 0 },
];

const weatherEncoding: { [key: string]: number } = {
  Clear: 3,
  Rainy: 2,
  "Light Rain": 0,
  "Moderate Rain": 2,
"Heavy Rain": 2,
  Cloudy: 0,
  Windy: 4,
  Foggy:1
};


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


const MountainSelectionScreen = () => {
  const navigation = useNavigation();
  const [selectedMountain, setSelectedMountain] = useState(mountains[0]);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [weatherEncoded, setWeatherEncoded] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<string>("");
  const [trailConditions, setTrailConditions] = useState<any[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<any[]>([]);
  const [forecastNow, setForecastNow] = useState<any | null>(null);
  const [forecast3h, setForecast3h] = useState<any | null>(null);
  const [forecast6h, setForecast6h] = useState<any | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredMountains, setFilteredMountains] = useState(mountains);


  const WEATHER_API_KEY = "5b1d50dc4c9d25a46417835c506a0644";
  const FLASK_API_URL = "http://192.168.1.16:5000/predict/classifier";

  const fetchWeatherEncoding = async () => {
    try {
      const { latitude, longitude } = selectedMountain;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
       const forecasts = response.data.list.slice(0, 3).map((entry: any, index: number) => ({
        time: index === 0 ? "Now" : index === 1 ? "In 3 Hours" : "In 6 Hours",
        weather: entry.weather[0].main,
        temp: entry.main.temp,
        humidity: entry.main.humidity,
      }));
       console.log("🔍 Forecast Weather Breakdown:");
      forecasts.forEach((f: { time: any; weather: any; temp: any; humidity: any; }) => {
  console.log(`${f.time}: Weather = ${f.weather}, Temp = ${f.temp}°C, Humidity = ${f.humidity}%`);
});

      const weather = response.data.list[0].weather[0].main;
      const temp = response.data.list[0].main.temp;
      const hum = response.data.list[0].main.humidity;
     setForecastNow(forecasts[0]);
      setForecast3h(forecasts[1]);
      setForecast6h(forecasts[2]);

      setTemperature(forecasts[0].temp);
      setHumidity(forecasts[0].humidity);

      const normalizedWeather = normalizeWeather(forecasts[0].weather);
      const encoded = weatherEncoding[normalizedWeather] ?? 0;
      setWeatherEncoded(encoded);
      if (encoded !== null) {
        predictTrailConditions(forecasts, encoded);
      }


    } catch (err) {
      console.log("Weather fetch error", err);
    }
  };

 const normalizeWeather = (weatherDesc: string): string => {
    const lowerCaseWeather = weatherDesc.toLowerCase();
    console.log("🔍 Raw Weather from API:", weatherDesc); // Add Debugging Log
    
    if (lowerCaseWeather.includes("clear") || lowerCaseWeather.includes("sun")) {
      return "Clear";
    }
    if (lowerCaseWeather.includes("light rain")) {
      return "Cloudy";  // NEW: Differentiating rain intensity
    }
    if (lowerCaseWeather.includes("moderate rain")) {
      return "Cloudy";
    }
    if (lowerCaseWeather.includes("heavy rain") || lowerCaseWeather.includes("intense rain")) {
      return "Rainy";
    }
    if (lowerCaseWeather.includes("rain")) {
      return "Rainy";
    }
    if (lowerCaseWeather.includes("cloud")) {
      return "Cloudy";
    }
    if (lowerCaseWeather.includes("wind")) {
      return "Windy";
    }
    return "Unknown"; // Default case
  };

  const predictTrailConditions = async (forecasts: any[], encodedWeather: number) => {
    try {
      const predictions = await Promise.all(
        forecasts.map(async (forecast) => {
          const payload = {
            features: [encodedWeather, encodeTemperature(forecast.temp), encodeHumidity(forecast.humidity)],
          };

          const response = await axios.post(
            FLASK_API_URL,
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          return { time: forecast.time, condition: response.data.prediction[0] };
        })
      );

      setTrailConditions(predictions);
    } catch (error) {
      console.error("❌ Trail Condition Prediction Error:", error);
    }
  };
  useEffect(() => {
    fetchWeatherEncoding();
  }, [selectedMountain]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.searchInputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.searchInputText}>{selectedMountain.name}</Text>
        {/* <Ionicons name="chevron-down" size={22} color="#000" /> */}
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Mountain..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
            <FlatList
              data={mountains.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()))}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setSelectedMountain(item);
                  setModalVisible(false);
                }}>
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.sectionTitle}>Current Weather</Text>
      {forecastNow && (
        <View>
          <Text>{forecastNow.weather}</Text>
          <Text>Temp: {forecastNow.temp}°C</Text>
          <Text>Humidity: {forecastNow.hum}%</Text>
        </View>
      )}

      <TouchableOpacity style={styles.proceedButton}>
        <Text style={styles.proceedText}>Next: Enter Your Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  proceedButton: { backgroundColor: "#34A853", padding: 15, marginTop: 20, borderRadius: 10, width: "100%", alignItems: "center" },
  proceedText: { color: "#fff", fontWeight: "bold" },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10
  },
  searchInputText: { fontSize: 16, fontWeight: "500", color: "#333" },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContent: { backgroundColor: "white", margin: 20, borderRadius: 10, padding: 20 },
  searchInput: { borderBottomWidth: 1, borderColor: "#ccc", paddingVertical: 8, marginBottom: 12 },
  listItemText: { fontSize: 16, padding: 10 },
  closeButton: { textAlign: "center", marginTop: 10, color: "red", fontWeight: "bold" },
});

export default MountainSelectionScreen;
