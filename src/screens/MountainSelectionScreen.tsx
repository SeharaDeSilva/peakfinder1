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
import { RootStackParamList } from '../../App'; 
import axios from "axios";
const mountains = [
  { name: "Adam's Peak", latitude: 6.8096, longitude: 80.4994, elevation: 2243, difficulty: "Hard", difficultyEncoded: 0 },
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

const trailPaths: { [key: string]: { latitude: number; longitude: number }[] } = {
  "Adam's Peak": [
    { latitude: 6.8096, longitude: 80.4994 },
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

const MountainSelectionScreen = () => {
 const navigation = useNavigation<NavigationProp<RootStackParamList, "MountainSelection">>();
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
  // const FLASK_API_URL = "http://192.168.1.6:5000/predict/classifier";
  const FLASK_API_URL = "https://seharabackend-460802.el.r.appspot.com/predict/classifier";

   const mountainImages: { [key: string]: any } = {
  "Adam's Peak": require("../../assets/images/adamspeak.jpg"),
  "Ella Rock": require("../../assets/images/ella_rock.jpg"),
  "Bible Rock": require("../../assets/images/Bible_Rock.jpg"),
  "Hanthana": require("../../assets/images/hanthana.jpg"),
  "Lakegala": require("../../assets/images/lakegala.jpg"),
  "Narangala Mountain": require("../../assets/images/narangala.jpg"),
  "Sigiriya": require("../../assets/images/sigiriya.jpg"),
  "Yahangala": require("../../assets/images/yahangala.jpg"),
};

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
  const getHumidityAdvice = (humidity: number): string => {
    const hour = new Date().getHours();
    const isMidday = hour >= 11 && hour <= 15;
  
    if (humidity > 90) {
      return isMidday
        ? "Extreme humidity — avoid hiking during midday."
        : "Extreme humidity — hike with caution and take breaks.";
    } else if (humidity > 70) {
      return " High humidity — stay hydrated and don’t overexert.";
    } else {
      return "Good humidity for hiking.";
    }
  };
  
  const getTemperatureAdvice = (temp: number): string => {
    if (temp >= 35) return " Very hot — avoid hiking, especially midday.";
    if (temp >= 30) return "Hot — hike early and hydrate often.";
    if (temp >= 20) return " Comfortable temperature.";
    if (temp >= 10) return "Cool — dress in layers.";
    return "❄️ Cold — dress warmly, avoid long rests.";
  };
  
  const getWeatherAdvice = (weather: string): string => {
    const w = weather.toLowerCase();
    if (w.includes("rain")) return "Rainy — carry waterproof gear.";
    if (w.includes("cloud")) return " Cloudy — cool but watch for showers.";
    if (w.includes("clear") || w.includes("sun")) return "Clear — wear sun protection.";
    if (w.includes("wind")) return "Windy — secure loose items.";
    return "Check detailed local weather before hiking.";
  };
  
  const [pollenPercentage, setPollenPercentage] = useState<number | null>(null);
const [pollenAdvice, setPollenAdvice] = useState<string>("");

const fetchPollenData = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(
      `https://seharabackend-460802.el.r.appspot.com/get-pollen?lat=${latitude}&lng=${longitude}`
    );

    console.log(" Full response:", response.data);

    const dataArray = response.data?.data;
    const count = dataArray?.[0]?.Count;

    if (
      count?.grass_pollen !== undefined &&
      count?.tree_pollen !== undefined &&
      count?.weed_pollen !== undefined
    ) {
      const avgPollen =
        (count.grass_pollen + count.tree_pollen + count.weed_pollen) / 3;
      const percentage = Math.round((avgPollen / 120) * 100); // Adjust scale if needed
      setPollenPercentage(percentage);

      if (avgPollen <= 25) {
        setPollenAdvice("🟢 Low pollen – Safe for all hikers.");
      } else if (avgPollen <= 60) {
        setPollenAdvice("🟡 Moderate pollen – Use mask if allergic.");
      } else {
        setPollenAdvice("🔴 High pollen – Take antihistamines or avoid hiking if sensitive.");
      }
    } else {
      throw new Error("Pollen data unavailable.");
    }
  } catch (error) {
    console.error(" Pollen API Error:", error);
    setPollenPercentage(null);
    setPollenAdvice(" Unable to load pollen data.");
  }
};


  // useEffect(() => {
  //   fetchWeatherEncoding();
  // }, [selectedMountain]);

  useEffect(() => {
    fetchWeatherEncoding();
    fetchPollenData(selectedMountain.latitude, selectedMountain.longitude); // fetch pollen
  }, [selectedMountain]);
  
   return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <TouchableOpacity style={styles.mountainPicker} onPress={() => setModalVisible(true)}>
        <Text style={styles.mountainName}>{selectedMountain.name}</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity> */}
        <TouchableOpacity
  style={styles.searchInputContainer}
  onPress={() => setModalVisible(true)}
>
  <Text style={styles.searchInputText}>{selectedMountain.name}</Text>
  <Ionicons name="chevron-down" size={22} color="#000" />
</TouchableOpacity>

<Modal visible={isModalVisible} animationType="fade" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Mountain..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          setFilteredMountains(
            text.trim() === ""
              ? mountains  // ✅ Show all when input is empty
              : mountains.filter(m =>
                  m.name.toLowerCase().includes(text.toLowerCase())
                )
          );
        }}
      />

      <FlatList
        data={filteredMountains}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {
              setSelectedMountain(item);
              setWeatherCondition("");
              setTemperature(null);
              setHumidity(null);
              setWeatherEncoded(null);
              setTrailConditions([]);
              setWeeklyForecast([]);
              setModalVisible(false);
              fetchWeatherEncoding();
            }}
          >
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

<View style={styles.imageContainer}>
  <ImageBackground
    source={mountainImages[selectedMountain.name]}
    style={styles.imageBackground}
    imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
  >
    <View style={styles.overlay} />
    <View style={styles.headerContent}>
      <Text style={styles.mountainName}>{selectedMountain.name}</Text>
      
      <View style={styles.row}>
        <MaterialIcons name="landscape" size={20} color="#eee" />
        <Text style={styles.mountainElevation}>{selectedMountain.elevation}m</Text>
      </View>
      
      <View style={styles.row}>
        <MaterialIcons name="trending-up" size={20} color="#eee" />
        <Text style={styles.mountainDifficulty}>{selectedMountain.difficulty}</Text>
      </View>
    </View>
  </ImageBackground>
</View>

<View style={styles.weatherCard}>
  <Text style={styles.sectionTitle}>Trail Forecast: Now, 3h, 6h</Text>
  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
    {[forecastNow, forecast3h, forecast6h].map((fc, idx) => {
      if (!fc) return null; // Skip if forecast is missing

      return (
        <View key={idx} style={{ alignItems: 'center', width: 100 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{["Now", "3h", "6h"][idx]}</Text>

          <MaterialCommunityIcons
            name={
              fc.weather.toLowerCase().includes("clear") ? "weather-sunny" :
              fc.weather.toLowerCase().includes("rain") ? "weather-rainy" :
              fc.weather.toLowerCase().includes("cloud") ? "weather-cloudy" :
              "weather-partly-cloudy"
            }
            size={24}
            color="#555"
          />
          <Text style={{ fontSize: 12 }}>{fc.weather}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialCommunityIcons name="thermometer" size={16} color="#e67e22" />
            <Text style={{ fontSize: 12, marginLeft: 4 }}>{fc.temp}°C</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <MaterialCommunityIcons name="water-percent" size={16} color="#3498db" />
            <Text style={{ fontSize: 12, marginLeft: 4 }}>{fc.humidity}%</Text>
          </View>

          <View
            style={{
              width: 40,
              height: 10,
              backgroundColor:
                trailConditions[idx]?.condition === "Dry"
                  ? "#2ecc71"
                  : trailConditions[idx]?.condition === "Moderate"
                  ? "#f1c40f"
                  : trailConditions[idx]?.condition === "Wet"
                  ? "#3498db"
                  : trailConditions[idx]?.condition === "Muddy"
                  ? "#8e44ad"
                  : "#e74c3c",
              borderRadius: 5,
              marginTop: 6,
            }}
          />
          <Text style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            {trailConditions[idx]?.condition}
          </Text>
        </View>
      );
    })}
  </View>
</View>

<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name="circle" size={12} color="#2ecc71" />
    <Text style={{ fontSize: 12, marginLeft: 4 }}>Dry</Text>
  </View>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name="circle" size={12} color="#f1c40f" />
    <Text style={{ fontSize: 12, marginLeft: 4 }}>Moderate</Text>
  </View>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name="circle" size={12} color="#3498db" />
    <Text style={{ fontSize: 12, marginLeft: 4 }}>Wet</Text>
  </View>

  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <MaterialCommunityIcons name="circle" size={12} color="#8e44ad" />
    <Text style={{ fontSize: 12, marginLeft: 4 }}>Muddy</Text>
  </View>
</View>


<View style={styles.weatherCard}>
  <Text style={styles.sectionTitle}> Hiking Advice Overview</Text>

  {[forecastNow, forecast3h, forecast6h].map((forecast, idx) => {
    if (!forecast) return null;

    const timeLabel = ["Now", "In 3 Hours", "In 6 Hours"][idx];
    const humidityAdvice = getHumidityAdvice(forecast.humidity);
    const tempAdvice = getTemperatureAdvice(forecast.temp);
    const weatherAdvice = getWeatherAdvice(forecast.weather);

    return (
      <View key={idx} style={styles.adviceCard}>
        <Text style={styles.adviceTime}>{timeLabel}</Text>

        {/* Weather */}
        <View style={styles.adviceRow}>
          <MaterialCommunityIcons name="weather-cloudy" size={20} color="#3498db" />
          <Text style={styles.adviceText}>{weatherAdvice}</Text>
        </View>

        {/* Temperature */}
        <View style={styles.adviceRow}>
          <MaterialCommunityIcons name="thermometer" size={20} color="#e67e22" />
          <Text style={styles.adviceText}>{tempAdvice}</Text>
        </View>

        {/* Humidity */}
        <View style={styles.adviceRow}>
          <MaterialCommunityIcons name="water-percent" size={20} color="#16a085" />
          <Text style={styles.adviceText}>{humidityAdvice}</Text>
        </View>
      </View>
    );
  })}
</View>

<View style={styles.weatherCard}>
  <Text style={styles.sectionTitle}>Pollen Report</Text>
  {pollenPercentage !== null ? (
    <>
      <Text style={styles.adviceLine}>Pollen Level: {pollenPercentage}%</Text>
      <Text style={styles.adviceLine}>{pollenAdvice}</Text>
    </>
  ) : (
    <Text style={styles.adviceLine}>Loading pollen data...</Text>
  )}
</View>

{selectedMountain && (

  <MapView
  style={styles.map}
  region={{
    latitude: selectedMountain.latitude,
    longitude: selectedMountain.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker
    coordinate={{
      latitude: selectedMountain.latitude,
      longitude: selectedMountain.longitude,
    }}
    title={selectedMountain.name}
    description={`Elevation: ${selectedMountain.elevation}m`}
  />

  {/* Pollen Circle */}
  {pollenPercentage !== null && (
    <Circle
      center={{
        latitude: selectedMountain.latitude,
        longitude: selectedMountain.longitude,
      }}
      radius={500}
      strokeColor="transparent"
      fillColor={
        pollenPercentage <= 25
          ? 'rgba(0,200,0,0.3)'
          : pollenPercentage <= 60
          ? 'rgba(255,200,0,0.4)'
          : 'rgba(255,0,0,0.4)'
      }
    />
  )}

  {/* Trail Path Polyline */}
  {trailPaths[selectedMountain.name] && (
    <Polyline
      coordinates={trailPaths[selectedMountain.name]}
      strokeColor={
        trailConditions[0]?.condition === "Dry"
          ? "#00cc00"
          : trailConditions[0]?.condition === "Moderate"
          ? "#ffcc00"
          : "#ff3333"
      }
      strokeWidth={4}
    />
  )}
</MapView>

)}
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => navigation.navigate("UserInput", {
          mountain: {
            name: selectedMountain.name,
            latitude: selectedMountain.latitude,
            longitude: selectedMountain.longitude,
            elevation: selectedMountain.elevation,
            difficulty: selectedMountain.difficultyEncoded,
            weatherEncoded: weatherEncoded ?? 0,
            temperature: temperature ?? 0,
            humidity: humidity ?? 0,
            trailConditions,
            forecastNow,
            forecast3h,
            forecast6h,
          }
        })}
      >
       

        <Text style={styles.proceedText}>Next: Enter Your Profile</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput style={styles.searchBox} placeholder="Search Mountain..." onChangeText={(text) => {
              setSearchText(text);
              setFilteredMountains(mountains.filter(m => m.name.toLowerCase().includes(text.toLowerCase())));
            }} />
            <FlatList
              data={filteredMountains}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setSelectedMountain(item);
                  setModalVisible(false);
                }}>
                  <Text style={styles.modalItem}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  mountainPicker: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  mountainName: { fontSize: 20, fontWeight: "bold", marginRight: 10 },
  detail: { fontSize: 16, marginVertical: 5 },
  weatherCard: { backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10, width: "100%", marginTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  weatherRow: { marginBottom: 8 },
  weatherText: { fontSize: 14 },
  proceedButton: { backgroundColor: "#34A853", padding: 15, marginTop: 20, borderRadius: 10, width: "100%", alignItems: "center" },
  proceedText: { color: "#fff", fontWeight: "bold" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContainer: { backgroundColor: "white", margin: 20, borderRadius: 10, padding: 20 },
  searchBox: { borderBottomWidth: 1, marginBottom: 10, padding: 8 },
  modalItem: { fontSize: 16, padding: 10 },
  closeModal: { marginTop: 10, textAlign: "center", fontWeight: "bold", color: "red" },
  adviceLine: {
    fontSize: 14,
    color: "#333",
    marginVertical: 2,
  },
  adviceTitle: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#007AFF",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: 200,
    marginTop: 15,
    borderRadius: 10,
  },
  adviceCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  
  adviceTime: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#007AFF",
  },
  
  adviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  
  adviceText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
  },
  
  searchInputText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  
  // modalContainer: {
  //   flex: 1,
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  //   justifyContent: "center",
  //   padding: 20,
  // },
  
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  
  searchInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 12,
  },
  
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
  
  closeButton: {
    textAlign: "center",
    marginTop: 10,
    color: "red",
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    height: 220,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  
  headerContent: {
    padding: 16,
  },
  
  // mountainName: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#fff",
  //   marginBottom: 4,
  // },
  
  mountainElevation: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  
  mountainDifficulty: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  
  
});
export default MountainSelectionScreen;