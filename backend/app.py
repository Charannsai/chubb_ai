from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from werkzeug.utils import secure_filename
import json
import time
from openai import OpenAI
from lime.lime_tabular import LimeTabularExplainer
import warnings

# Suppress all warnings for cleaner output
warnings.filterwarnings('ignore')
os.environ['PYTHONWARNINGS'] = 'ignore'

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
MODEL_PATH = 'xgb_model.pkl'
OPENAI_API_KEY = 'API_KEY'

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global storage for current dataset and explanations
current_dataset = None
current_explanations = {}

# GPU Configuration
def check_gpu_availability():
    """
    Check if GPU is available for XGBoost
    """
    try:
        import xgboost as xgb
        # Try to create a simple GPU-based model to test
        gpu_available = False
        try:
            # Check if CUDA is available
            import subprocess
            result = subprocess.run(['nvidia-smi'], capture_output=True, text=True, timeout=2)
            if result.returncode == 0:
                gpu_available = True
        except:
            pass
        
        return gpu_available
    except Exception as e:
        print(f"GPU check error: {str(e)}")
        return False

# Check GPU availability at startup
GPU_AVAILABLE = check_gpu_availability()
print(f"GPU Acceleration: {'ENABLED ✓' if GPU_AVAILABLE else 'DISABLED (CPU mode)'}")

def configure_model_for_gpu(model):
    """
    Configure XGBoost model to use GPU if available (XGBoost 2.0+ compatible)
    Note: We use CPU for prediction to avoid device mismatch warnings
    """
    if GPU_AVAILABLE and hasattr(model, 'set_params'):
        try:
            # Use CPU for predictions to avoid device mismatch
            # (Model training was GPU, but prediction on CPU is faster for small batches)
            model.set_params(
                tree_method='hist',
                device='cpu'
            )
            print("Model configured for optimized prediction")
        except Exception as e:
            print(f"Could not configure model: {str(e)}")
    return model

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_serializable(obj):
    """
    Convert numpy types to Python native types for JSON serialization
    """
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif pd.isna(obj):
        return None
    else:
        return obj

def preprocess_input_data(input_df):
    """
    Preprocess the input data:
    1. Handle missing values
    2. Handle outliers
    3. Encode categorical features
    """
    # Store original column names and data for reference
    original_columns = input_df.columns.tolist()
    
    # 1. Handle Missing Values:
    # Drop columns with more than 50% missing values
    missing_percentages = input_df.isnull().sum() / len(input_df) * 100
    high_missing_cols = missing_percentages[missing_percentages > 50].index.tolist()
    input_df = input_df.drop(columns=high_missing_cols)

    # Fill missing values for the remaining columns
    for col in input_df.columns:
        if input_df[col].dtype == 'object':  # Categorical columns
            if not input_df[col].mode().empty:
                input_df[col] = input_df[col].fillna(input_df[col].mode()[0])
        else:  # Numerical columns
            input_df[col] = input_df[col].fillna(input_df[col].median())

    print("Missing values handled.")

    # 2. Handle Outliers (using IQR method):
    numerical_cols = input_df.select_dtypes(include=np.number).columns.tolist()
    for col in numerical_cols:
        Q1 = input_df[col].quantile(0.25)
        Q3 = input_df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        input_df[col] = np.where(input_df[col] < lower_bound, lower_bound, input_df[col])
        input_df[col] = np.where(input_df[col] > upper_bound, upper_bound, input_df[col])

    print("Outliers handled.")

    # 3. Feature Encoding (Label Encoding for categorical variables):
    categorical_cols = input_df.select_dtypes(include=['object', 'category']).columns.tolist()
    label_encoders = {}
    for col in categorical_cols:
        label_encoder = LabelEncoder()
        input_df[col] = label_encoder.fit_transform(input_df[col].astype(str))
        label_encoders[col] = label_encoder

    print("Categorical features label encoded.")

    return input_df, label_encoders

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Flask API is running'}), 200

@app.route('/api/dataset/status', methods=['GET'])
def dataset_status():
    """Check if dataset is loaded in memory"""
    global current_dataset
    
    if current_dataset is None:
        return jsonify({
            'loaded': False,
            'message': 'No dataset in memory. Please upload a CSV file.'
        }), 200
    
    return jsonify({
        'loaded': True,
        'customer_count': len(current_dataset.get('customers', [])),
        'columns': len(current_dataset.get('columns', [])),
        'has_model': 'model' in current_dataset,
        'message': 'Dataset is loaded and ready for analysis'
    }), 200

def generate_ai_explanation(lime_features, customer_data, churn_probability):
    """
    Generate AI-powered explanation using OpenAI based on LIME feature importances
    """
    try:
        # Format LIME features for the prompt
        features_text = "\n".join([f"- {feature}: {importance:.4f}" for feature, importance in lime_features])
        
        # Create prompt for OpenAI
        prompt = f"""You are an expert data analyst specializing in customer churn prediction. 
        
Based on the following LIME explainability metrics and customer data, provide a clear, concise explanation 
of why this customer is predicted to have a {churn_probability:.2f}% churn probability.

LIME Feature Importances (positive values increase churn risk, negative values decrease it):
{features_text}

Customer Profile:
{json.dumps(customer_data, indent=2)}

Please provide:
1. 3-5 bullet points explaining the key factors contributing to this churn prediction
2. Each bullet should be actionable and easy to understand
3. Focus on the most significant factors (highest absolute importance values)
4. Use simple, business-friendly language

Format your response as bullet points only, without any introduction or conclusion."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert customer churn analyst who provides clear, actionable insights."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        explanation = response.choices[0].message.content.strip()
        return explanation
    except Exception as e:
        print(f"Error generating AI explanation: {str(e)}")
        return "Unable to generate explanation at this time."

def generate_lime_explanations(model, processed_data, original_data, feature_names, num_features=5):
    """
    Generate LIME explanations for all instances in the dataset
    """
    try:
        # Create LIME explainer
        explainer = LimeTabularExplainer(
            processed_data.values,
            feature_names=feature_names,
            class_names=['Low Risk', 'High Risk'],
            mode='classification',
            discretize_continuous=True
        )
        
        explanations = {}
        
        # Generate explanations for each customer
        for idx in range(len(processed_data)):
            try:
                # Get LIME explanation
                exp = explainer.explain_instance(
                    processed_data.values[idx],
                    model.predict_proba,
                    num_features=num_features
                )
                
                # Get feature importances
                lime_features = exp.as_list()
                
                # Get customer data and convert numpy types to Python native types
                customer_data = original_data.iloc[idx].to_dict()
                customer_data = convert_to_serializable(customer_data)
                
                # Get churn probability
                churn_prob = model.predict_proba(processed_data.values[idx].reshape(1, -1))[0][1] * 100
                
                # Generate AI explanation
                ai_explanation = generate_ai_explanation(lime_features, customer_data, churn_prob)
                
                # Convert numpy types to Python native types for JSON serialization
                lime_features_serializable = [(str(feature), convert_to_serializable(importance)) for feature, importance in lime_features]
                churn_prob_serializable = convert_to_serializable(churn_prob)
                
                explanations[idx] = {
                    'lime_features': lime_features_serializable,
                    'ai_explanation': ai_explanation,
                    'churn_probability': churn_prob_serializable
                }
            except Exception as e:
                print(f"Error generating explanation for index {idx}: {str(e)}")
                explanations[idx] = {
                    'lime_features': [],
                    'ai_explanation': 'Unable to generate explanation for this customer.',
                    'churn_probability': 0
                }
        
        return explanations
    except Exception as e:
        print(f"Error in generate_lime_explanations: {str(e)}")
        return {}

@app.route('/api/predict', methods=['POST'])
def predict_churn():
    """
    API endpoint to handle CSV upload and return churn predictions
    """
    global current_dataset, current_explanations
    
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check if file is CSV
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        print(f"File uploaded: {filename}")
        
        # 1. Load the CSV data
        input_df = pd.read_csv(filepath)
        
        # Drop any unnamed columns (artifacts from Excel/CSV conversion)
        unnamed_cols = [col for col in input_df.columns if 'Unnamed' in str(col)]
        if unnamed_cols:
            print(f"Dropping unnamed columns: {unnamed_cols}")
            input_df = input_df.drop(columns=unnamed_cols)
        
        # Store ONLY the original input column names (before any preprocessing)
        original_input_columns = input_df.columns.tolist()
        print(f"Dataset loaded: {len(input_df)} rows, {len(original_input_columns)} columns")
        print(f"Input columns: {original_input_columns}")
        
        # Keep a copy of original data with ONLY input columns
        original_df = input_df[original_input_columns].copy()
        
        # 2. Preprocess the data
        processed_df, label_encoders = preprocess_input_data(input_df)
        print("Data preprocessing completed")
        
        # 3. Load the trained model
        if not os.path.exists(MODEL_PATH):
            return jsonify({'error': 'Model file not found'}), 500
        
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully")
        
        # Configure model for GPU acceleration
        model = configure_model_for_gpu(model)
        
        # 4. Make predictions (GPU-accelerated if available)
        import time
        start_time = time.time()
        
        predicted_probabilities = model.predict_proba(processed_df)
        predicted_classes = np.argmax(predicted_probabilities, axis=1)
        
        prediction_time = time.time() - start_time
        print(f"Predictions completed in {prediction_time:.2f} seconds")
        
        # 5. Prepare results (LIME explanations will be generated on-demand)
        # Create result dataframe with ONLY original input columns + predictions
        result_df = original_df.copy()
        result_df['Churn_Probability'] = (predicted_probabilities[:, 1] * 100).round(2)
        result_df['Churn_Prediction'] = ['High Risk' if p == 1 else 'Low Risk' for p in predicted_classes]
        result_df['Predicted_Class'] = predicted_classes
        
        # Calculate summary statistics
        total_customers = len(result_df)
        high_risk_customers = int((predicted_classes == 1).sum())
        low_risk_customers = total_customers - high_risk_customers
        avg_churn_probability = round(float(result_df['Churn_Probability'].mean()), 2)
        
        # Replace NaN values with None for valid JSON (before converting to dict)
        result_df = result_df.replace({np.nan: None, np.inf: None, -np.inf: None})
        
        # Convert ONLY the necessary columns to dictionary
        # Keep only original input columns + prediction columns
        columns_to_export = original_input_columns + ['Churn_Probability', 'Churn_Prediction', 'Predicted_Class']
        result_df_filtered = result_df[columns_to_export]
        customers_data = result_df_filtered.to_dict('records')
        
        # Format ONLY the original input column names for display
        formatted_columns = []
        for col in original_input_columns:
            # Replace underscores with spaces and capitalize each word
            formatted = col.replace('_', ' ').title()
            formatted_columns.append({
                'key': col,  # Original column name for data access
                'label': formatted  # Formatted name for display
            })
        
        print(f"Returning {len(original_input_columns)} input columns: {original_input_columns}")
        
        # Store current dataset, model, and other necessary data for on-demand explanations
        current_dataset = {
            'original_df': original_df,
            'processed_df': processed_df,
            'result_df': result_df,
            'columns': formatted_columns,
            'customers': customers_data,
            'model': model,
            'feature_names': processed_df.columns.tolist()
        }
        current_explanations = {}  # Will be populated on-demand
        
        # Debug log
        print(f"✅ Dataset stored in memory: {len(customers_data)} customers")
        print(f"✅ Current dataset is ready for chat and explanations")
        
        # Clean up: remove uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        # 7. Return response
        response = {
            'success': True,
            'summary': {
                'total_customers': total_customers,
                'high_risk_customers': high_risk_customers,
                'low_risk_customers': low_risk_customers,
                'average_churn_probability': avg_churn_probability,
                'high_risk_percentage': round((high_risk_customers / total_customers) * 100, 2)
            },
            'columns': formatted_columns,  # Send formatted column information
            'customers': customers_data,
            'message': 'Predictions completed successfully',
            'gpu_accelerated': GPU_AVAILABLE,
            'processing_time': {
                'prediction': round(prediction_time, 2),
                'total': round(prediction_time, 2)
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/explain/<int:customer_index>', methods=['GET'])
def explain_customer(customer_index):
    """
    API endpoint to generate LIME explanation for a specific customer on-demand
    """
    global current_dataset, current_explanations
    
    try:
        # Check if we have data loaded
        if current_dataset is None:
            return jsonify({
                'success': False,
                'error': 'No dataset loaded. Please upload data first.'
            }), 400
        
        # Validate customer index
        if customer_index < 0 or customer_index >= len(current_dataset['customers']):
            return jsonify({
                'success': False,
                'error': f'Invalid customer index. Must be between 0 and {len(current_dataset["customers"]) - 1}'
            }), 400
        
        # Check if explanation is already cached
        if customer_index in current_explanations:
            print(f"Returning cached explanation for customer {customer_index}")
            return jsonify({
                'success': True,
                'explanation': current_explanations[customer_index]['ai_explanation'],
                'lime_features': current_explanations[customer_index]['lime_features'],
                'churn_probability': current_explanations[customer_index]['churn_probability'],
                'cached': True
            }), 200
        
        # Generate new explanation
        print(f"Generating new explanation for customer {customer_index}...")
        start_time = time.time()
        
        model = current_dataset['model']
        processed_df = current_dataset['processed_df']
        original_df = current_dataset['original_df']
        feature_names = current_dataset['feature_names']
        
        # Create LIME explainer
        explainer = LimeTabularExplainer(
            processed_df.values,
            feature_names=feature_names,
            class_names=['Low Risk', 'High Risk'],
            mode='classification',
            discretize_continuous=True
        )
        
        # Get LIME explanation for this specific customer
        exp = explainer.explain_instance(
            processed_df.values[customer_index],
            model.predict_proba,
            num_features=5
        )
        
        # Get feature importances
        lime_features = exp.as_list()
        
        # Get customer data and convert numpy types to Python native types
        customer_data = original_df.iloc[customer_index].to_dict()
        customer_data = convert_to_serializable(customer_data)
        
        # Get churn probability
        churn_prob = model.predict_proba(processed_df.values[customer_index].reshape(1, -1))[0][1] * 100
        
        # Generate AI explanation
        ai_explanation = generate_ai_explanation(lime_features, customer_data, churn_prob)
        
        # Convert numpy types to Python native types for JSON serialization
        lime_features_serializable = [(str(feature), convert_to_serializable(importance)) for feature, importance in lime_features]
        churn_prob_serializable = convert_to_serializable(churn_prob)
        
        # Cache the explanation
        current_explanations[customer_index] = {
            'lime_features': lime_features_serializable,
            'ai_explanation': ai_explanation,
            'churn_probability': churn_prob_serializable
        }
        
        generation_time = time.time() - start_time
        print(f"Generated explanation for customer {customer_index} in {generation_time:.2f} seconds")
        
        return jsonify({
            'success': True,
            'explanation': ai_explanation,
            'lime_features': lime_features_serializable,
            'churn_probability': churn_prob_serializable,
            'cached': False,
            'generation_time': round(generation_time, 2)
        }), 200
        
    except Exception as e:
        print(f"Error generating explanation for customer {customer_index}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    API endpoint to handle chat queries about the uploaded data
    """
    global current_dataset, current_explanations
    
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        user_message = data['message']
        
        # Debug: Log the state of current_dataset
        print(f"Chat request received. current_dataset is None: {current_dataset is None}")
        if current_dataset is not None:
            print(f"Dataset has {len(current_dataset.get('customers', []))} customers")
        
        # Check if we have data loaded
        if current_dataset is None or not current_dataset.get('customers'):
            return jsonify({
                'success': True,
                'response': "Please upload a dataset first to analyze. I'll be able to provide insights once you've uploaded your churn data."
            }), 200
        
        # Prepare context about the dataset
        customers = current_dataset.get('customers', [])
        summary = {
            'total_customers': len(customers),
            'high_risk_count': sum(1 for c in customers if c.get('Churn_Prediction') == 'High Risk'),
            'low_risk_count': sum(1 for c in customers if c.get('Churn_Prediction') == 'Low Risk'),
            'avg_churn_probability': sum(c.get('Churn_Probability', 0) for c in customers) / len(customers) if customers else 0,
            'columns': [col['label'] for col in current_dataset.get('columns', [])]
        }
        
        # Sample some customer data (first 3 high risk and 3 low risk) and ensure they're JSON serializable
        high_risk_samples = [convert_to_serializable(c) for c in customers if c.get('Churn_Prediction') == 'High Risk'][:3]
        low_risk_samples = [convert_to_serializable(c) for c in customers if c.get('Churn_Prediction') == 'Low Risk'][:3]
        
        context = f"""You are analyzing a customer churn dataset with the following summary:
- Total Customers: {summary['total_customers']}
- High Risk Customers: {summary['high_risk_count']}
- Low Risk Customers: {summary['low_risk_count']}
- Average Churn Probability: {summary['avg_churn_probability']:.2f}%
- Available Columns: {', '.join(summary['columns'])}

Sample High Risk Customers:
{json.dumps(high_risk_samples, indent=2)}

Sample Low Risk Customers:
{json.dumps(low_risk_samples, indent=2)}"""

        # Create chat completion with OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": """You are an expert customer churn analyst assistant. You help users understand their churn predictions and provide actionable insights. 
                    
Your responses should be:
- Clear and concise
- Data-driven based on the provided context
- Actionable with specific recommendations when appropriate
- Professional but friendly
- Format responses with bullet points when listing multiple items
- Use percentages and numbers from the actual data

When users ask about trends, patterns, or specific customers, analyze the provided data and give meaningful insights."""
                },
                {
                    "role": "user",
                    "content": f"{context}\n\nUser Question: {user_message}"
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        return jsonify({
            'success': True,
            'response': ai_response
        }), 200
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/download', methods=['POST'])
def download_results():
    """
    API endpoint to generate downloadable CSV with predictions
    """
    try:
        data = request.json
        if not data or 'customers' not in data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Convert data back to dataframe
        df = pd.DataFrame(data['customers'])
        
        # Save to CSV
        output_filename = 'churn_predictions.csv'
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        df.to_csv(output_path, index=False)
        
        return jsonify({
            'success': True,
            'message': 'File ready for download',
            'filename': output_filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Model path: {MODEL_PATH}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    app.run(debug=True, host='0.0.0.0', port=5000)