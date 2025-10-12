# ChubbAI - Churn Prediction Platform

A full-stack web application for predicting customer churn using machine learning. Upload customer data in CSV format and get AI-powered churn predictions with detailed insights.

## 🎯 Features

- **CSV Upload**: Easy drag-and-drop interface for uploading customer data
- **Real-time Processing**: Automatic data preprocessing and model prediction
- **Interactive Dashboard**: View churn predictions with dynamic data tables
- **Summary Statistics**: Get insights on high-risk vs low-risk customers
- **Export Results**: Download prediction results as CSV
- **Modern UI**: Beautiful, responsive interface with dark/light theme support

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Flask** - Python web framework
- **XGBoost** - Machine learning model
- **Pandas** - Data processing
- **Scikit-learn** - Preprocessing utilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **npm** (comes with Node.js) or **yarn**
- **pip** (comes with Python)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation
Run these commands to verify your installations:
```bash
node --version    # Should show v16.x.x or higher
python --version  # Should show Python 3.8.x or higher
npm --version     # Should show 6.x.x or higher
pip --version     # Should show pip version
git --version     # Should show git version
```

## 🚀 Installation & Setup

### Step 1: Clone the Repository

First, clone this repository to your local machine:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd chubbai
```

If you downloaded the ZIP file instead, extract it and navigate to the folder:
```bash
cd path/to/chubbai
```

### Step 2: Backend Setup

#### 2.1 Create a Virtual Environment (Recommended)

It's recommended to use a virtual environment to avoid dependency conflicts:

**On Windows:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt indicating the virtual environment is active.

#### 2.2 Install Python Dependencies

With the virtual environment activated, install all required packages:

```bash
# Install dependencies from requirements.txt
pip install -r requirements.txt
```

This will install:
- Flask (Web framework)
- Flask-CORS (Cross-origin resource sharing)
- XGBoost (Machine learning model)
- Pandas (Data manipulation)
- NumPy (Numerical computing)
- Scikit-learn (ML utilities)
- Joblib (Model serialization)

#### 2.3 Verify Model File

Ensure the trained model file exists:
```bash
# Check if xgb_model.pkl exists in the backend directory
ls xgb_model.pkl   # On macOS/Linux
dir xgb_model.pkl  # On Windows
```

If the model file is missing, you'll need to train it using the notebook in `notebook/Chrun_Chubb (1).ipynb`.

#### 2.4 Start the Flask Server

```bash
# Make sure you're in the backend directory with venv activated
python app.py
```

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
 * Running on http://<your-ip>:5000
```

The Flask API is now running at `http://localhost:5000`

**Keep this terminal window open.** The backend server needs to stay running.

### Step 3: Frontend Setup

Open a **new terminal window/tab** for the frontend setup.

#### 3.1 Navigate to Frontend Directory

```bash
# From project root
cd frontend
```

#### 3.2 Install Node Dependencies

```bash
# Install all npm packages
npm install
```

This will install:
- React and React-DOM
- Vite (Build tool)
- Tailwind CSS (Styling framework)
- Lucide React (Icon library)
- And other dependencies listed in `package.json`

The installation may take a few minutes depending on your internet connection.

#### 3.3 Start the Development Server

```bash
# Start Vite development server
npm run dev
```

You should see output similar to:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

The React app is now running at `http://localhost:3000`

### Step 4: Access the Application

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You should see the ChubbAI landing page

**Note:** Both the backend (Flask) and frontend (Vite) servers must be running simultaneously.

### Quick Start Summary

```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend (new terminal window)
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 📊 Workflow

### 1. **Input**
- User uploads a CSV file containing customer details:
  - Age, gender, policy type, tenure, premium, payment history, claim details, etc.
  
### 2. **Process** (Backend)
- **Data Handling**: Flask receives the CSV file from React frontend
- **Preprocessing**: 
  - Handle missing values (drop columns with >50% missing, fill others)
  - Handle outliers using IQR method
  - Encode categorical features using Label Encoding
- **Model Prediction**: 
  - Load trained XGBoost model (.pkl file)
  - Generate churn probabilities for each customer
  - Identify high-risk vs low-risk customers

### 3. **Output** (Dashboard)
- **Churn Summary Tab**:
  - Total customers count
  - High-risk and low-risk customers
  - Average churn probability
  - Detailed table with dynamic columns from your data
  - Churn probability percentage for each customer
  - Risk level indicators
- **Export Options**: Download results as CSV

## 📁 Project Structure

```
chubbai/
├── backend/
│   ├── app.py                 # Flask API with prediction endpoints
│   ├── xgb_model.pkl         # Trained XGBoost model
│   ├── requirements.txt      # Python dependencies
│   └── uploads/              # Temporary upload folder (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx    # Main dashboard with upload & results
│   │   ├── components/
│   │   │   ├── ChatOverlay.jsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── DashboardNavbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### Predict Churn
```
POST /api/predict
Content-Type: multipart/form-data
Body: file (CSV file)
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_customers": 100,
    "high_risk_customers": 23,
    "low_risk_customers": 77,
    "average_churn_probability": 45.67,
    "high_risk_percentage": 23.0
  },
  "columns": ["customer_id", "age", "gender", ...],
  "customers": [
    {
      "customer_id": "C001",
      "age": 45,
      "Churn_Probability": 85.5,
      "Churn_Prediction": "High Risk",
      ...
    }
  ],
  "message": "Predictions completed successfully"
}
```

## 🎨 Dashboard Features

### Upload Section
- Drag & drop CSV files
- File validation
- Upload progress indicator
- Error handling with user-friendly messages

### Churn Summary Tab
- **Dynamic columns** - Automatically displays all columns from your CSV
- **Summary cards** - Quick overview of total, high-risk, and low-risk customers
- **Data table** - Complete customer data with churn predictions
- **Color-coded indicators**:
  - 🔴 Red: High risk (≥70%)
  - 🟡 Yellow: Medium risk (50-69%)
  - 🟢 Green: Low risk (<50%)

### Export
- Download prediction results as CSV
- Includes all original data plus predictions

## 🔧 Configuration

### Backend Configuration
Edit `backend/app.py` to modify:
- `UPLOAD_FOLDER` - Temporary upload directory
- `MODEL_PATH` - Path to the trained model
- Server host and port

### Frontend Configuration
Edit `frontend/src/pages/DashboardPage.jsx` to modify:
- `API_BASE_URL` - Backend API URL (default: `http://localhost:5000/api`)

## 📝 CSV Format

Your CSV file can contain any customer-related columns. Common columns include:
- Customer ID
- Age
- Gender
- Policy Type
- Tenure
- Premium Amount
- Payment History
- Claim Details
- Usage Patterns
- etc.

**Note**: The model will automatically process and adapt to your CSV structure.

## 🐛 Troubleshooting

### Backend Issues
- **Error: Model not found**: Ensure `xgb_model.pkl` exists in the backend folder
- **Port already in use**: Change the port in `app.py` (default: 5000)
- **Module not found**: Run `pip install -r requirements.txt`

### Frontend Issues
- **API connection error**: Ensure Flask server is running on port 5000
- **CORS error**: Flask-CORS is configured in `app.py`
- **Build errors**: Run `npm install` to ensure all dependencies are installed

## 🚀 Deployment

### Backend (Flask)
- Deploy to Heroku, AWS, or any Python hosting service
- Set environment variables for production
- Use production WSGI server (e.g., Gunicorn)

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting service
- Update API_BASE_URL to production backend URL

## 📄 License

This project is proprietary software developed for ChubbAI.

## 👥 Contributors

Built with ❤️ by the ChubbAI Team

## 🔗 Development Resources & Chat History

The following links document the development process, problem discussions, and AI-assisted conversations that helped build this project:

### ChatGPT Conversations
- [Initial Project Setup & Architecture](https://chatgpt.com/share/68eb1b9c-3848-8005-a8dc-5f1dadeb434d)
- [Feature Implementation & Code Review](https://chatgpt.com/share/68eb0eeb-9dfc-8005-a5ac-4fed002641de)

### Perplexity Research Sessions
- [Hackathon Strategy & Planning](https://www.perplexity.ai/search/bro-i-have-a-hackathon-i-want-v0kKCZRHS928ZtnPTd52cA#0)
- [Problem Statement Analysis from Image](https://www.perplexity.ai/search/from-this-image-read-the-probl-0nnl5AHFTNCZEf_y_wiy7A#7)
- [Requirements Documentation & Memory](https://www.perplexity.ai/search/save-it-in-your-memory-read-it-yB2ho0sFRzyxd4Uf5Qt_fA#0)

These resources provide insights into the decision-making process, technical challenges faced, and solutions implemented during development.

---

For questions or support, please contact the development team.

