/**
 * API Client for Household Financial Management System
 * Connects to cPanel Node.js/Express backend, with graceful fallback.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function safeFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const url = `${API_BASE}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { error: errJson.message || `Server returned ${res.status}` };
    }

    const json = await res.json();
    return { data: json.data || json };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { error: 'Request timed out' };
    }
    return { error: err.message || 'Network error' };
  }
}

export const api = {
  // Health check
  checkHealth: async () => {
    return safeFetch('/health');
  },

  // Properties / Portions
  getProperties: async () => {
    return safeFetch('/properties');
  },

  createProperty: async (data: any) => {
    return safeFetch('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProperty: async (id: string, data: any) => {
    return safeFetch(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updatePortionStatus: async (id: string, status: 'Paid' | 'Pending', lastReceivedDate?: string, ledgerEntry?: any) => {
    return safeFetch(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rentStatus: status, lastReceivedDate, ledgerEntry }),
    });
  },

  deleteProperty: async (id: string) => {
    return safeFetch(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Rent Collection & Ledger
  collectRent: async (data: any) => {
    return safeFetch('/rent/collect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRentRecords: async (unitId?: string) => {
    const query = unitId ? `?unitId=${unitId}` : '';
    return safeFetch(`/rent${query}`);
  },

  // Expenses & Transactions
  getTransactions: async (type?: 'INCOME' | 'EXPENSE') => {
    const query = type ? `?type=${type}` : '';
    return safeFetch(`/transactions${query}`);
  },

  createTransaction: async (data: any) => {
    return safeFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteTransaction: async (id: string) => {
    return safeFetch(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Committees
  getCommittees: async () => {
    return safeFetch('/committees');
  },

  createCommittee: async (data: any) => {
    return safeFetch('/committees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Investments
  getInvestments: async () => {
    return safeFetch('/investments');
  },

  createInvestment: async (data: any) => {
    return safeFetch('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteInvestment: async (id: string) => {
    return safeFetch(`/investments/${id}`, {
      method: 'DELETE',
    });
  },
};
