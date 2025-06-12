# Import necessary libraries
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib

dataset_path = "C:\\Users\\CHARITHA BODIGE\\Desktop\\ML\\brfssdataset_dropped3.csv"

# Load the dataset into a Pandas DataFrame
df = pd.read_csv(dataset_path)

# Select relevant features
selected_features = ['HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker',
                      'Stroke', 'Diabetes', 'PhysActivity', 'Fruits', 'Veggies',
                      'HvyAlcoholConsump', 'GenHlth',
                      'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age']

# Extract features and target variable
X = df[selected_features]
y = df['HeartDiseaseorAttack']

# Convert categorical variables to dummy/indicator variables
X = pd.get_dummies(X)

# Feature Scaling with feature names
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Create a logistic regression model with increased max_iter
model = LogisticRegression(max_iter=2000)

# Train the model
model.fit(X_train, y_train)
print('Coefficients:', model.coef_[0])

joblib.dump(model, 'model.joblib')
joblib.dump(scaler, 'scaler.joblib')