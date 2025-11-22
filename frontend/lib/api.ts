// Use HTTPS in production, HTTP for local development
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // If frontend is on HTTPS, use HTTPS for API
    if (window.location.protocol === 'https:') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.intellithesis.com';
    }
  }
  // Default to environment variable or HTTP for local dev
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiUrl();

// Get auth token for authenticated requests
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  // Prefer admin token if available, otherwise use regular token
  const authToken = adminToken || token;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

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
      headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get training status: ${response.statusText}`);
  }

  return response.json();
}

export async function startTraining(numSteps: number = 100, batchSize: number = 32): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/training/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get scraped content: ${response.statusText}`);
  }

  return response.json();
}

// Authentication API
export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
    full_name?: string;
  };
}

export async function signUp(request: SignUpRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.detail || errorData.message || `Signup failed: ${response.statusText}`;
    
    // Provide user-friendly messages for specific error codes
    if (response.status === 503) {
      errorMessage = errorData.detail || 'Database service is currently unavailable. Please check your database connection or contact support.';
    } else if (response.status === 400) {
      errorMessage = errorData.detail || 'Invalid request. Please check your input and try again.';
    } else if (response.status === 500) {
      errorMessage = errorData.detail || 'Server error. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.detail || errorData.message || `Login failed: ${response.statusText}`;
    
    // Provide user-friendly messages for specific error codes
    if (response.status === 503) {
      errorMessage = errorData.detail || 'Database service is currently unavailable. Please check your database connection or contact support.';
    } else if (response.status === 401) {
      errorMessage = errorData.detail || 'Incorrect email or password. Please try again.';
    } else if (response.status === 500) {
      errorMessage = errorData.detail || 'Server error. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`);
  }

  return response.json();
}

// Plagiarism Detection API
export interface PlagiarismCheckRequest {
  text: string;
  min_similarity?: number;
  use_chunks?: boolean;
  max_results?: number;
}

export interface PlagiarismResult {
  plagiarism_percentage: number;
  is_plagiarized: boolean;
  matches: Array<{
    similarity: number;
    similarity_percentage: number;
    source_id: string;
    source: string;
    url?: string;
    title?: string;
    matching_text: string;
    date?: string;
  }>;
  total_comparisons: number;
  matches_found: number;
  text_length: number;
  min_similarity_threshold: number;
}

export async function checkPlagiarism(request: PlagiarismCheckRequest): Promise<PlagiarismResult> {
  const response = await fetch(`${API_BASE_URL}/api/plagiarism/check`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Plagiarism check failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getPlagiarismStats(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/plagiarism/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get stats: ${response.statusText}`);
  }

  return response.json();
}

// Blog API functions
export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  is_published: boolean;
  author_id: number;
  author_username?: string;
  author_email?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCreate {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  is_published?: boolean;
}

export interface BlogUpdate {
  title?: string;
  content?: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  is_published?: boolean;
}

export async function getBlogs(
  skip: number = 0,
  limit: number = 20,
  publishedOnly: boolean = true,
  category?: string
): Promise<Blog[]> {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      published_only: publishedOnly.toString(),
    });
    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${API_BASE_URL}/api/blogs/?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    throw new Error(error.message || 'Failed to fetch blogs');
  }
}

export async function getBlog(blogId: number): Promise<Blog> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    throw new Error(error.message || 'Failed to fetch blog');
  }
}

export async function createBlog(blog: BlogCreate): Promise<Blog> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blog),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating blog:', error);
    throw new Error(error.message || 'Failed to create blog');
  }
}

export async function updateBlog(blogId: number, blog: BlogUpdate): Promise<Blog> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(blog),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating blog:', error);
    throw new Error(error.message || 'Failed to update blog');
  }
}

export async function deleteBlog(blogId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    throw new Error(error.message || 'Failed to delete blog');
  }
}

// Career API functions
export interface Career {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  salary_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerCreate {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  salary_range?: string;
  is_active?: boolean;
}

export interface CareerUpdate {
  title?: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  salary_range?: string;
  is_active?: boolean;
}

export async function getCareers(
  skip: number = 0,
  limit: number = 50,
  activeOnly: boolean = true,
  department?: string,
  location?: string
): Promise<Career[]> {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      active_only: activeOnly.toString(),
    });
    if (department) {
      params.append('department', department);
    }
    if (location) {
      params.append('location', location);
    }

    const response = await fetch(`${API_BASE_URL}/api/careers/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching careers:', error);
    throw new Error(error.message || 'Failed to fetch careers');
  }
}

export async function getCareer(careerId: number): Promise<Career> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/careers/${careerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching career:', error);
    throw new Error(error.message || 'Failed to fetch career');
  }
}

export async function createCareer(career: CareerCreate): Promise<Career> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/careers/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(career),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating career:', error);
    throw new Error(error.message || 'Failed to create career');
  }
}

export async function updateCareer(careerId: number, career: CareerUpdate): Promise<Career> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/careers/${careerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(career),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating career:', error);
    throw new Error(error.message || 'Failed to update career');
  }
}

export async function deleteCareer(careerId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/careers/${careerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || response.statusText;
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error deleting career:', error);
    throw new Error(error.message || 'Failed to delete career');
  }
}

