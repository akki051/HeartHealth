import os
import sys
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler


#print("Current Directory:", os.getcwd())


script_directory = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_directory, 'model.joblib')
scaler_path = os.path.join(script_directory, 'scaler.joblib')

#print("Model Path:", model_path)
#print("Scaler Path:", scaler_path)

selected_features = ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker',
                      'Stroke', 'Diabetes', 'PhysActivity', 'Fruits', 'Veggies',
                      'HvyAlcoholConsump', 'GenHlth',
                      'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age']

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)


if hasattr(model, 'coef_'):
    new_input_array = [float(arg) for arg in sys.argv[1:]]
    new_input_dict = dict(zip(selected_features, new_input_array))
    new_input_df = pd.DataFrame([new_input_dict], columns=selected_features)

 
    new_input_scaled = scaler.transform(pd.get_dummies(new_input_df))

    new_probabilities = model.predict_proba(new_input_scaled)[:, 1]
    print(new_probabilities[0] * 100)

else:
    print("Error:Couldnt compute prediction.Please contact system administrator for more help.")