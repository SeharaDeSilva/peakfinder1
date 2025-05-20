import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { Alert } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "UserInput">;

const UserInputScreen = ({ route, navigation }: Props) => {
  const { mountain } = route.params;

  const [ageRange, setAgeRange] = useState<number>(0);
  const [backpackWeightRange, setBackpackWeightRange] = useState<number>(0);
  const [genderEncoded, setGenderEncoded] = useState<number>(0);
  const [hikerExperienceEncoded, setHikerExperienceEncoded] = useState<number>(0);

  const handleSubmit = () => {
    if (!mountain) {
      Alert.alert("Error", "Your message here");
      return;
    }

    navigation.navigate("PredictionResult", {
      mountain: {
        ...mountain,
        ageRange,
        backpackWeightRange,
        genderEncoded,
        hikerExperienceEncoded,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tell Us About You</Text>

      <Text style={styles.label}>Age Range</Text>
      <Picker
        selectedValue={ageRange}
        onValueChange={setAgeRange}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Adult" value={0} />
        <Picker.Item label="Child" value={1} />
        <Picker.Item label="Senior" value={2} />
        <Picker.Item label="Young Adult" value={3} />
      </Picker>

      <Text style={styles.label}>Backpack Weight</Text>
      <Picker
        selectedValue={backpackWeightRange}
        onValueChange={setBackpackWeightRange}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Light (0-7 kg)" value={0} />
        <Picker.Item label="Medium (7-12 kg)" value={1} />
        <Picker.Item label="Heavy (12+ kg)" value={2} />
      </Picker>

      <Text style={styles.label}>Gender</Text>
      <Picker
        selectedValue={genderEncoded}
        onValueChange={setGenderEncoded}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Female" value={0} />
        <Picker.Item label="Male" value={1} />
      </Picker>

      <Text style={styles.label}>Hiker Experience</Text>
      <Picker
        selectedValue={hikerExperienceEncoded}
        onValueChange={setHikerExperienceEncoded}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Advanced" value={0} />
        <Picker.Item label="Beginner" value={1} />
        <Picker.Item label="Intermediate" value={2} />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Predict Distance & Time</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserInputScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 5,
    color: "#000",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#34A853",
    padding: 15,
    borderRadius: 10,
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  pickerItem: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    height: 50,
  },
});
