from django.shortcuts import render
from .model import generate_output  # Import the function from model.py





# Output we get from models.py ------ output,df,y,X,y_test,y_train,X_test,X_train,LR_accuracy

def display_output(request):
    # Call the function from model.py to generate output
    output_data = generate_output()  # Call the function to get output

    return render(request, r'C:\Users\acer\Desktop\CYBER HYGIENE TOOL V9 Superuser\KavachLocalAI\KavachLocalAI\templates\index.html', {'output_data': output_data})
