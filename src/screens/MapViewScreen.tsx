// import React, { useEffect, useRef } from "react";
// import { View, StyleSheet } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import { RouteProp } from "@react-navigation/native";
// import { RootStackParamList } from "../../App";

// type Props = {
//   route: RouteProp<RootStackParamList, "MapViewScreen">;
// };

// const MapViewScreen: React.FC<Props> = ({ route }) => {
//   const { mountain, trailPaths, trailConditions, timeNow } = route.params;
//   const mapRef = useRef<MapView>(null);

//   useEffect(() => {
//     if (mapRef.current && Array.isArray(trailPaths) && trailPaths.length > 1) {
//       mapRef.current.fitToCoordinates(trailPaths, {
//         edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
//         animated: true,
//       });
//     }
//   }, [trailPaths]);

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           latitude: mountain.latitude,
//           longitude: mountain.longitude,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         }}
//       >
//         {/* 🟢 Trail Line */}
//         <Polyline
//           coordinates={trailPaths.default}
//           strokeColor="#00C853" // bright green
//           strokeWidth={5}
//         />

//         {/* 🟣 Start Marker */}
//         <Marker coordinate={trailPaths.default[0]} title="Trail Start" pinColor="blue" />

//         {/* 🟠 End Marker */}
//         <Marker
//           coordinate={trailPaths.default[trailPaths.default.length - 1]}
//           title="Trail End"
//           description={`Estimated Time: ${timeNow?.toFixed(1)} hours`}
//           pinColor="orange"
//         />

      
//       </MapView>
//     </View>
//   );
// };

// export default MapViewScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
// });
///////////////////////////////////////////////////////////////////////////
// MapViewScreen.tsx (Enhanced with ORS and Mapbox Trail Fetch)
// import React, { useEffect, useRef, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import { RouteProp } from "@react-navigation/native";
// import { RootStackParamList } from "../../App";

// const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VoYXJhMDcyNCIsImEiOiJjbWF5d3lkcnQwNTdpMmxzNzNsMGNrdnowIn0.3FLkfhkxsHmdQmpacZCJsA"; // Replace with your token
// const ORS_TOKEN = "5b3ce3597851110001cf62480b3f035ef834446bbfa15fe3aa064b09"; // Replace with your ORS token

// type Props = {
//   route: RouteProp<RootStackParamList, "MapViewScreen">;
// };

// const MapViewScreen: React.FC<Props> = ({ route }) => {
//   const { mountain, trailConditions, timeNow } = route.params;
//   const mapRef = useRef<MapView>(null);
//   const [useAlternative, setUseAlternative] = useState(false);
//   const [trailPaths, setTrailPaths] = useState({ default: [], alternative: [] });

//   useEffect(() => {
//     const fetchMapboxRoutes = async () => {
//      const start = `${mountain.longitude},${mountain.latitude}`;
//       const end = `${mountain.longitude + 0.005},${mountain.latitude + 0.005}`;

//       const response = await fetch(
//         `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?alternatives=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
//       );
//       const data = await response.json();

//       const defaultPath = data.routes[0].geometry.coordinates.map(
//         ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
//       );
//       const alternativePath = data.routes[1]?.geometry.coordinates.map(
//         ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon })
//       ) || [];

//       setTrailPaths({ default: defaultPath, alternative: alternativePath });
//     };

//     fetchMapboxRoutes();
//   }, []);

//   useEffect(() => {
//     const badWeather = mountain.forecastNow.weather.toLowerCase().includes("rain");
//     const badTrail = trailConditions.some((c) =>
//       ["Muddy", "Wet", "Dry"].includes(c.condition)
//     );
//     if (badWeather || badTrail) {
//       setUseAlternative(true);
//     }
//   }, [mountain.forecastNow, trailConditions]);

//   useEffect(() => {
//     const path = useAlternative ? trailPaths.alternative : trailPaths.default;
//     if (mapRef.current && path && path.length > 1) {
//       mapRef.current.fitToCoordinates(path, {
//         edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
//         animated: true,
//       });
//     }
//   }, [useAlternative, trailPaths]);

//   const currentPath = useAlternative ? trailPaths.alternative : trailPaths.default;

//   return (
//     <View style={styles.container}>
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={{
//           latitude: mountain.latitude,
//           longitude: mountain.longitude,
//           latitudeDelta: 0.02,
//           longitudeDelta: 0.02,
//         }}
//       >
//         {/* Always show both paths */}
//         {trailPaths.default.length > 0 && (
//           <Polyline
//             coordinates={trailPaths.default}
//             strokeColor="#00C853" // Green
//             strokeWidth={5}
//           />
//         )}

//         {trailPaths.alternative.length > 0 && (
//           <Polyline
//             coordinates={trailPaths.alternative}
//             strokeColor="#FF3B30" // Red
//             strokeWidth={5}
//             lineDashPattern={[10, 5]}
//           />
//         )}

//         {/* Markers for Default Trail Start and End */}
//         {trailPaths.default.length > 0 && (
//           <Marker coordinate={trailPaths.default[0]} title="Start (Default)" pinColor="#007AFF" />
//         )}

//         {trailPaths.default.length > 0 && (
//           <Marker
//             coordinate={trailPaths.default[trailPaths.default.length - 1]}
//             title="End (Default)"
//             pinColor="#34C759"
//           />
//         )}

//         {/* Markers for Alternative Trail Start and End */}
//         {trailPaths.alternative.length > 0 && (
//           <Marker coordinate={trailPaths.alternative[0]} title="Start (Alt)" pinColor="#FF9500" />
//         )}

//         {trailPaths.alternative.length > 0 && (
//           <Marker
//             coordinate={trailPaths.alternative[trailPaths.alternative.length - 1]}
//             title="End (Alt)"
//             pinColor="#FF3B30"
//           />
//         )}
//       </MapView>

//       {useAlternative && (
//         <View style={styles.alertBanner}>
//           <Text style={styles.alertText}>
//             ⚠️ Bad trail or weather detected — using safer alternative route.
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default MapViewScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   alertBanner: {
//     position: "absolute",
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: "#fff3cd",
//     padding: 10,
//     borderRadius: 8,
//     borderColor: "#ffeeba",
//     borderWidth: 1,
//     elevation: 3,
//   },
//   alertText: {
//     textAlign: "center",
//     color: "#856404",
//     fontWeight: "bold",
//   },
// });
// MapViewScreen.tsx – Full logic to select best trail based on weather & condition
// MapViewScreen.tsx – Full logic to select best trail based on weather & condition
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

interface TrailPoint {
  latitude: number;
  longitude: number;
}

interface Trail {
  name: string;
  path: TrailPoint[];
}

interface Evaluation extends Trail {
  condition: string;
  score: number;
}

type Props = {
  route: RouteProp<RootStackParamList, "MapViewScreen">;
};

const weatherEncoding: Record<string, number> = {
  Clear: 3,
  Rainy: 2,
  "Light Rain": 0,
  "Moderate Rain": 2,
  "Heavy Rain": 2,
  Cloudy: 0,
  Windy: 4,
  Foggy: 1,
};

const encodeTemperature = (temp: number) => (temp < 10 ? 1 : temp < 20 ? 2 : temp < 30 ? 3 : 0);
const encodeHumidity = (hum: number) => (hum >= 75 ? 0 : hum >= 50 ? 1 : 2);

const MapViewScreen: React.FC<Props> = ({ route }) => {
  const { mountain } = route.params;

  const mapRef = useRef<MapView>(null);
  const [trailPaths, setTrailPaths] = useState<{ best: TrailPoint[]; alternatives: TrailPoint[][] }>({ best: [], alternatives: [] });
  const [trailNames, setTrailNames] = useState<{ best: string; alternatives: string[] }>({ best: '', alternatives: [] });
  const [loading, setLoading] = useState(true);

   const allTrails: Record<string, Trail[]> = {
    "Adam's Peak": [
      { name: "Nallathanniya", path: [ { latitude: 6.825606496458684, longitude: 80.52232037582651 }, { latitude: 6.813739387214272, longitude: 80.49936990978294 } ] },
      { name: "Palabaddala", path: [ { latitude: 6.7891080187127875, longitude: 80.46110272073578 }, { latitude: 6.813739387214272, longitude: 80.49936990978294 } ] },
      { name: "Erathna", path: [ { latitude: 6.83513231435775, longitude: 80.40813624617341 }, { latitude: 6.813739387214272, longitude: 80.49936990978294 } ] },
      { name: "Malimboda", path: [ { latitude: 6.881414879383267, longitude: 80.44128777053167 }, { latitude: 6.813739387214272, longitude: 80.49936990978294 } ] },
    ],
    "Bible Rock": [
      { name: "Batalegala Trail", path: [ { latitude: 7.189550620934665, longitude: 80.43037656620513 }, { latitude:7.1887968721586475 , longitude: 80.43474955528232
 } ] },
    ],
    "Ella Rock": [
      { name: "Ella Train Station", path: [ { latitude: 6.875858774163701, longitude: 81.04742059806401 }, { latitude: 6.852176002375643, longitude: 81.052708352559 } ] },
      { name: "Ella Rock Trail Head", path: [ { latitude: 6.858036196858422, longitude: 81.04403456009447 }, { latitude: 6.852176002375643, longitude: 81.052708352559 } ] },
    ],
    "Hanthana": [
      { name: "Ceylon Tea Museum", path: [ { latitude: 7.268594156668073, longitude: 80.6327038608267 }, { latitude: 7.250184406712957, longitude: 80.62750697945098 } ] },
      { name: "Hanthana Tea Estate", path: [ { latitude: 7.24943665932203, longitude: 80.6318654304596 }, { latitude: 7.250184406712957, longitude: 80.62750697945098 } ] },
      { name: "Bird Park", path: [ { latitude: 7.26867929760646, longitude: 80.6346913210719 }, { latitude: 7.250184406712957, longitude: 80.62750697945098 } ] },
      { name: "Udawalawa Road", path: [ { latitude: 7.244417626009322, longitude: 80.63767862051071 }, { latitude: 7.250184406712957, longitude: 80.62750697945098 } ] },
    ],
    "Lakegala": [
      { name: "Meemure", path: [ { latitude: 7.4327405234461255, longitude: 80.84615372556546 }, { latitude: 7.460758265046539, longitude: 80.84343300498597 } ] },
      { name: "Narangamuwa", path: [ { latitude: 7.480537999746493, longitude: 80.82960959709567 }, { latitude: 7.460758265046539, longitude: 80.84343300498597 } ] },
      { name: "Atanwale", path: [ { latitude: 7.509129565531039, longitude: 80.76062630573813 }, { latitude: 7.460758265046539, longitude: 80.84343300498597 } ] },
    ],
    "Narangala Mountain": [
      { name: "Keenakele View Point", path: [ { latitude: 7.057412146001978, longitude: 81.01574729259582 }, { latitude: 7.460758265046539, longitude: 80.84343300498597 } ] },
      { name: "Thangamale Sanctuary", path: [ { latitude: 7.043852576087607, longitude: 81.02265672418 }, { latitude: 7.460758265046539, longitude: 80.84343300498597 } ] },
    ],
    "Sigiriya": [
      { name: "Sigiriya Main", path: [ { latitude: 7.957148131056979, longitude: 80.76024690494899 }, { latitude: 7.957148131056979, longitude: 80.76024690494899 } ] },
    ],
    "Yahangala": [
      { name: "Udadumbara", path: [ { latitude: 7.319558431674243, longitude: 80.8810961274503 }, { latitude: 7.4141269687338545, longitude: 80.90617634786847 } ] },
      { name: "Hasalaka", path: [ { latitude: 7.358093064474109, longitude: 80.95433784308818 }, { latitude: 7.4141269687338545, longitude: 80.90617634786847 } ] },
      { name: "Maudullkele", path: [ { latitude: 7.397881447171221, longitude: 80.73387280252712 }, { latitude: 7.4141269687338545, longitude: 80.90617634786847 } ] },
    ],
  };


  useEffect(() => {
    const forecast = mountain.forecastNow;
    const trails = allTrails[mountain.name] || [];

    const evaluations: Evaluation[] = trails.map((t) => {
      const conditionEncoded = weatherEncoding[forecast.weather] ?? 0;
      const score = conditionEncoded === 3 ? 3 : conditionEncoded === 2 ? 2 : 1;
      return { ...t, condition: forecast.weather, score };
    });

    evaluations.sort((a, b) => b.score - a.score);
    setTrailPaths({
      best: evaluations[0].path,
      alternatives: evaluations.slice(1).map((e) => e.path),
    });
     setTrailNames({
      best: evaluations[0].name,
      alternatives: evaluations.slice(1).map((e) => e.name),
    });
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: mountain.latitude,
            longitude: mountain.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Polyline coordinates={trailPaths.best} strokeColor="#00C853" strokeWidth={6} />
          {trailPaths.alternatives.map((alt, idx) => (
            <Polyline
              key={idx}
              coordinates={alt}
              strokeColor="#FF3B30"
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          ))}

          {trailPaths.best.length > 0 && (
            <Marker coordinate={trailPaths.best[0]} title={`Start: ${trailNames.best}`} pinColor="blue" />
          )}
          {trailPaths.alternatives.map((alt, idx) => (
            <Marker key={`alt-${idx}`} coordinate={alt[0]} title={`Alt: ${trailNames.alternatives[idx]}`} pinColor="red" />
          ))}
          {trailPaths.best.length > 0 && (
            <Marker
              coordinate={trailPaths.best[trailPaths.best.length - 1]}
              title="End (Best)"
              pinColor="orange"
            />
          )}
        </MapView>
      )}
    </View>
  );
};

export default MapViewScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
