const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorDetail = errorData.detail;
      }
    } catch {
      // Fallback
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }
  return await response.json();
}

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Analyze
  analyzeReport: async (payload) => {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Reports
  getReports: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
    return handleResponse(res);
  },

  getHighRiskReports: async (limit = 10) => {
    const res = await fetch(`${API_BASE}/reports/high-risk?limit=${limit}`);
    return handleResponse(res);
  },

  getReportById: async (id) => {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    return handleResponse(res);
  },

  updateReportStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/reports/${id}/status?new_status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    });
    return handleResponse(res);
  },

  // Statistics & Trends
  getStatistics: async () => {
    const res = await fetch(`${API_BASE}/statistics`);
    return handleResponse(res);
  },

  getTrends: async (interval = 'daily') => {
    const res = await fetch(`${API_BASE}/trends?interval=${interval}`);
    return handleResponse(res);
  },

  getHazards: async () => {
    const res = await fetch(`${API_BASE}/hazards`);
    return handleResponse(res);
  },

  getRiskPriority: async (limit = 15) => {
    const res = await fetch(`${API_BASE}/risk-priority?limit=${limit}`);
    return handleResponse(res);
  },

  // Model Evaluation Metrics
  getModelMetrics: async () => {
    const res = await fetch(`${API_BASE}/model-metrics`);
    return handleResponse(res);
  },

  // Similar Reports
  getSimilarReports: async (query, limit = 3) => {
    const res = await fetch(`${API_BASE}/similar-reports?query=${encodeURIComponent(query)}&limit=${limit}`);
    return handleResponse(res);
  },

  // Human Feedback
  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(res);
  },
};
