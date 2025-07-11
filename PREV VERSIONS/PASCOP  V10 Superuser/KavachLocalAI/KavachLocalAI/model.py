

import pandas as pd
import joblib
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.axes as ax
from matplotlib.animation import FuncAnimation
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer 
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from django.db import models
from django.http import JsonResponse




dtype_dict = {
    'Requestid': int,
    'StatusCode': int,
    'ip': str,  # Read IP initially as a string
    'url': str,
    'type': str,
    'timestamp': str,
    'tableid': int,
    'fromcache': bool,
    'method': str,
    'target': str  
}


df = pd.read_csv(r'C:\Users\acer\Desktop\CYBER HYGIENE TOOL V9 Superuser\KavachLocalAI\urls.csv')
print(df)


label_encoder = LabelEncoder()

print(df)



y = df['target']
print(y)



X = df.drop('target', axis=1)
print(X)


from sklearn.model_selection import train_test_split


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=100)


print(X_train)

print(X_test)


# Encoding categorical variables
encoder = LabelEncoder()
df['ip'] = encoder.fit_transform(df['ip'])
df['url'] = encoder.fit_transform(df['url'])
df['type'] = encoder.fit_transform(df['type'])
df['method'] = encoder.fit_transform(df['method'])
df['target'] = encoder.fit_transform(df['target'])

# Clean the dataset, replacing 'undefined' with NaN and dropping NaN values
df_clean = df.replace('undefined', pd.NA).dropna().reset_index(drop=True)




encoder = LabelEncoder()
df['ip'] = encoder.fit_transform(df['ip'])
df['type'] = encoder.fit_transform(df['type'])
df['method'] = encoder.fit_transform(df['method'])
df['target'] = encoder.fit_transform(df['target'])  # Encoding the target for regression

# Splitting the data into features and target variable
X = df.drop('target', axis=1)
y = df['target']

# Splitting the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Creating and training the LinearRegression model
linear_reg = LinearRegression()
linear_reg.fit(X_train, y_train)









# Evaluating the model
LR_accuracy = linear_reg.score(X_test, y_test)
print(f"Accuracy of the Linear Regression model: {LR_accuracy}")





from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import RandomForestClassifier
lr = RandomForestClassifier()
lr.fit(X_train, y_train)









y_lr_train_pred = lr.predict(X_train)
y_lr_test_pred = lr.predict(X_test)



print(y_lr_train_pred)



print(y_lr_test_pred)



from sklearn.metrics import mean_squared_error, r2_score

lr_train_mse = mean_squared_error(y_train, y_lr_train_pred)
lr_train_r2 = r2_score(y_train, y_lr_train_pred)

lr_test_mse = mean_squared_error(y_test, y_lr_test_pred)
lr_test_r2 = r2_score(y_test, y_lr_test_pred)



print('LR MSE (Train): ', lr_train_mse)
print('LR R2 (Train): ', lr_train_r2)
print('LR MSE (Test): ', lr_test_mse)
print('LR R2 (Test): ', lr_test_r2)




lr_results = pd.DataFrame(['Linear regression', lr_train_mse, lr_train_r2, lr_test_mse, lr_test_r2]).transpose()
lr_results.columns = ['Method', 'Training MSE', 'Training R2', 'Test MSE', 'Test R2']



print(lr_results)




from sklearn.ensemble import RandomForestRegressor

rf = RandomForestRegressor(max_depth=2, random_state=100)
rf.fit(X_train, y_train)



# GENERATE MODEL



y_rf_train_pred = rf.predict(X_train)
y_rf_test_pred = rf.predict(X_test)





from sklearn.metrics import mean_squared_error, r2_score

rf_train_mse = mean_squared_error(y_train, y_rf_train_pred)
rf_train_r2 = r2_score(y_train, y_rf_train_pred)

rf_test_mse = mean_squared_error(y_test, y_rf_test_pred)
rf_test_r2 = r2_score(y_test, y_rf_test_pred)





rf_results = pd.DataFrame(['Random forest', rf_train_mse, rf_train_r2, rf_test_mse, rf_test_r2]).transpose()
rf_results.columns = ['Method', 'Training MSE', 'Training R2', 'Test MSE', 'Test R2']
print(rf_results)




df_models = pd.concat([lr_results, rf_results], axis=0)


df_models.reset_index(drop=True)



import matplotlib.pyplot as plt
import numpy as np

plt.figure(figsize=(5,5))
plt.scatter(x=y_train, y=y_lr_train_pred, c="#7CAE00" ,alpha=0.3)

z = np.polyfit(y_train, y_lr_train_pred, 1)
p = np.poly1d(z)

plt.plot(y_train, p(y_train), '#F8766D')
plt.ylabel('Predict target')
plt.xlabel('Experimental target')




# GENERATE MODEL
rf = RandomForestRegressor(max_depth=2, random_state=100)
rf.fit(X_train, y_train)

# Generate model file
model_filename = r'C:\Users\acer\Desktop\CYBER HYGIENE TOOL V9 Superuser\KavachLocalAI\KavachLocalAI\random_forest_model.joblib'
joblib.dump(rf, model_filename)

print(f"Random Forest model saved at: {model_filename}")


# GENERATE MODEL
linear_reg = LinearRegression()
linear_reg.fit(X_train, y_train)

# Generate model file for Linear Regression
linear_model_filename = r'C:\Users\acer\Desktop\CYBER HYGIENE TOOL V9 Superuser\KavachLocalAI\KavachLocalAI\linear_regression_model.joblib'
joblib.dump(linear_reg, linear_model_filename)

print(f"Linear Regression model saved at: {linear_model_filename}")










# Inside mycode.py
def generate_output():
    # Your code logic to generate output
    output = X,df,y,X,y_test,y_train,X_test,X_train,LR_accuracy
    return output 












