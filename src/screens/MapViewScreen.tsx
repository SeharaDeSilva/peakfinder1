import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type Props = {
  route: RouteProp<RootStackParamList, "MapViewScreen">;
};

const MapViewScreen: React.FC<Props> = ({ route }) => {
  const { mountain, trailPaths, trailConditions, timeNow } = route.params;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && Array.isArray(trailPaths) && trailPaths.length > 1) {
      mapRef.current.fitToCoordinates(trailPaths, {
        edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
        animated: true,
      });
    }
  }, [trailPaths]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: mountain.latitude,
          longitude: mountain.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* 🟢 Trail Line */}
        <Polyline
          coordinates={trailPaths.default}
          strokeColor="#00C853" // bright green
          strokeWidth={5}
        />

        {/* 🟣 Start Marker */}
        <Marker coordinate={trailPaths.default[0]} title="Trail Start" pinColor="blue" />

        {/* 🟠 End Marker */}
        <Marker
          coordinate={trailPaths.default[trailPaths.default.length - 1]}
          title="Trail End"
          description={`Estimated Time: ${timeNow?.toFixed(1)} hours`}
          pinColor="orange"
        />

      
      </MapView>
    </View>
  );
};

export default MapViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

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
