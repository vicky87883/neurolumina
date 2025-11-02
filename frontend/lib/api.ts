const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  response: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TrainingStatus {
  is_training: boolean;
  current_epoch: number;
  dataset_size: number;
  status: string;
  steps_completed: number;
  mean_reward: number;
  latest_loss: number;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(`Chat request failed: ${errorMessage}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Could not connect to the server');
  }
}

export async function getTrainingStatus(): Promise<TrainingStatus> {
  const response = await fetch(`${API_BASE_URL}/api/training/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get training status: ${response.statusText}`);
  }

  return response.json();
}

export async function startTraining(numSteps: number = 100, batchSize: number = 32): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/training/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ num_steps: numSteps, batch_size: batchSize }),
  });

  if (!response.ok) {
    throw new Error(`Failed to start training: ${response.statusText}`);
  }

  return response.json();
}

export async function addTrainingExample(
  prompt: string,
  response: string,
  reward: number,
  metadata?: Record<string, any>
): Promise<any> {
  const responseData = await fetch(`${API_BASE_URL}/api/training/example`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, response, reward, metadata }),
  });

  if (!responseData.ok) {
    throw new Error(`Failed to add training example: ${responseData.statusText}`);
  }

  return responseData.json();
}

export interface ScrapeRequest {
  url: string;
  extract_text?: boolean;
  extract_links?: boolean;
  extract_images?: boolean;
}

export async function scrapeUrl(request: ScrapeRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/scraping/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to scrape URL: ${response.statusText}`);
  }

  return response.json();
}

export async function getScrapedContent(limit: number = 10, offset: number = 0): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/scraping/from-db?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get scraped content: ${response.statusText}`);
  }

  return response.json();
}

