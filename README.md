# LLM Training Platform

A full-stack platform for training Large Language Models using Reinforcement Learning (PPO).

## Prerequisites

- Python 3.8+ 
- Node.js 18+ and npm
- Groq API key (already configured in `.env`)

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify .env file exists:**
   The `.env` file should already contain your Groq API key. If not, create it:
   ```bash
   echo "GROQ_API_KEY=your_api_key_here" > .env
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
source venv/bin/activate  # If using virtual environment
uvicorn app:app --reload --port 5000
```

The backend will start on `http://localhost:5000`

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:5000
```

### Step 2: Start the Frontend Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

You should see:
```
Ready - started server on 0.0.0.0:3000
```

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Chat Interface**: Use the chat window to interact with the LLM
2. **Training Status**: Monitor training progress, dataset size, and metrics
3. **Start Training**: Configure steps and batch size, then click "Start Training"

## API Endpoints

- `GET /` - API health check
- `GET /health` - Health status
- `POST /api/chat/` - Send chat message
- `GET /api/training/status` - Get training status
- `POST /api/training/start` - Start training
- `POST /api/training/example` - Add training example

## Troubleshooting

- **Import errors**: Make sure you've activated the virtual environment and installed all dependencies
- **API connection errors**: Verify the Groq API key is correct in `backend/.env`
- **Port already in use**: Change the port in the command (e.g., `--port 5001` for backend)

