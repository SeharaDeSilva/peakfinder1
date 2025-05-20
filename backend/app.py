from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Load models
classifier_model = joblib.load('random_forest_classifier1.pkl')
regressor_distance_model = joblib.load('random_forest_regressor_distance1.pkl')
regressor_time_model = joblib.load('random_forest_regressor_time1.pkl')

app = Flask(__name__)

# ✅ Fix: Allow CORS for all requests (Frontend can access the API)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing

### ✅ 1. Trail Condition Classification
@app.route('/predict/classifier', methods=['POST'])
def predict_classifier():
    try:
        data = request.get_json()
        print("Received Data:", data)  # Debugging

        if not data or 'features' not in data:
            return jsonify({'error': 'Invalid input'}), 400

        features = np.array(data['features']).reshape(1, -1)
        prediction = classifier_model.predict(features)
        print("✅ Predicted trail condition:", prediction)

        return jsonify({'prediction': prediction.tolist()})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500



@app.route('/predict/travel', methods=['POST'])
def predict_travel():
    try:
        data = request.get_json()
        print("Received Data:", data)  # Debugging

        # Define the required keys based on the updated input features
        required_keys = [
            "elevation", "weatherEncoded", "temperatureRange", "humidityRange",
            "difficulty", "ageRange", "backpackWeightRange",
            "genderEncoded", "hikerExperienceEncoded"
        ]

        # Check if all required fields are present
        if not all(key in data for key in required_keys):
            return jsonify({'error': 'Missing required fields'}), 400

        # Extract values and convert to appropriate types
        elevation = float(data["elevation"])
        weather_encoded = int(data["weatherEncoded"])
        temperature_range = float(data["temperatureRange"])
        humidity_range = float(data["humidityRange"])
        difficulty_encoded = int(data["difficulty"])
        age_range = int(data["ageRange"])
        backpack_weight_range = float(data["backpackWeightRange"])
        gender_encoded = int(data["genderEncoded"])
        hiker_experience_encoded = int(data["hikerExperienceEncoded"])

        # Prepare the input feature array in the correct order
        input_features = np.array([[
            elevation, weather_encoded, temperature_range, humidity_range,
            difficulty_encoded, age_range, backpack_weight_range,
            gender_encoded, hiker_experience_encoded
        ]])

        # Make predictions using the trained models
        predicted_distance = regressor_distance_model.predict(input_features)[0]
        predicted_time = regressor_time_model.predict(input_features)[0]

        return jsonify({
            "distance": round(predicted_distance, 2),
            "time": round(predicted_time, 2)
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/get-pollen', methods=['GET'])
def get_pollen():
    try:
        lat = request.args.get('lat')
        lng = request.args.get('lng')

        if not lat or not lng:
            return jsonify({'error': 'Missing latitude or longitude'}), 400

        ambee_url = f"https://api.ambeedata.com/latest/pollen/by-lat-lng?lat={lat}&lng={lng}"
        headers = {
            "x-api-key": "7517319162d66e6287da5750ecea1b3148812974e63b6a0e3f32221d3761432a",
            "Content-type": "application/json"
        }

        import requests
        res = requests.get(ambee_url, headers=headers, timeout=5)
        print("🔎 Ambee Response:", res.status_code, res.text)  # 🧪 Add this line

        if res.status_code != 200:
            return jsonify({'error': 'Ambee API failed', 'details': res.text}), res.status_code

        return jsonify(res.json())

    except Exception as e:
        print("❌ Flask Error:", str(e))
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
