// API configuration - uses environment variable with fallback
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

// ============================================
// REST API FUNCTIONS
// ============================================

// Fetch all plants
export async function fetchPlants() {
  const response = await fetch(`${API_BASE_URL}/plants`);
  if (!response.ok) throw new Error('Failed to fetch plants');
  return response.json();
}

// Fetch single plant
export async function fetchPlant(plantId) {
  const response = await fetch(`${API_BASE_URL}/plants/${plantId}`);
  if (!response.ok) throw new Error('Failed to fetch plant');
  return response.json();
}

// Fetch plant KPIs
export async function fetchPlantKPIs(plantId) {
  const response = await fetch(`${API_BASE_URL}/plants/${plantId}/kpis`);
  if (!response.ok) throw new Error('Failed to fetch plant KPIs');
  return response.json();
}

// Fetch company KPIs
export async function fetchCompanyKPIs() {
  const response = await fetch(`${API_BASE_URL}/kpis`);
  if (!response.ok) throw new Error('Failed to fetch KPIs');
  return response.json();
}

// Fetch power chart data
export async function fetchPowerChartData() {
  const response = await fetch(`${API_BASE_URL}/charts/power`);
  if (!response.ok) throw new Error('Failed to fetch power data');
  return response.json();
}

// Fetch performance ratio data
export async function fetchPerformanceRatioData() {
  const response = await fetch(`${API_BASE_URL}/charts/performance-ratio`);
  if (!response.ok) throw new Error('Failed to fetch PR data');
  return response.json();
}

// Fetch soiling data
export async function fetchSoilingData() {
  const response = await fetch(`${API_BASE_URL}/charts/soiling`);
  if (!response.ok) throw new Error('Failed to fetch soiling data');
  return response.json();
}

// Fetch cleaning events
export async function fetchCleaningEvents() {
  const response = await fetch(`${API_BASE_URL}/cleaning-events`);
  if (!response.ok) throw new Error('Failed to fetch cleaning events');
  return response.json();
}

// Fetch all dashboard data at once
export async function fetchDashboardData() {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard');
  return response.json();
}

// Fetch all plant overview data at once
export async function fetchPlantOverviewData(plantId) {
  const response = await fetch(`${API_BASE_URL}/plant-overview/${plantId}`);
  if (!response.ok) throw new Error('Failed to fetch plant overview');
  return response.json();
}

// ============================================
// SERVER-SENT EVENTS (SSE) STREAMING
// ============================================

/**
 * Subscribe to real-time dashboard updates
 * @param {Function} onUpdate - Callback function called with updated data
 * @param {Function} onError - Callback function called on error
 * @returns {Function} Unsubscribe function to close the connection
 */
export function subscribeToDashboard(onUpdate, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/stream/dashboard`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch (error) {
      console.error('Error parsing SSE data:', error);
      if (onError) onError(error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) onError(error);
  };
  
  // Return unsubscribe function
  return () => {
    eventSource.close();
  };
}

/**
 * Subscribe to real-time plant-specific updates
 * @param {number} plantId - The plant ID to subscribe to
 * @param {Function} onUpdate - Callback function called with updated data
 * @param {Function} onError - Callback function called on error
 * @returns {Function} Unsubscribe function to close the connection
 */
export function subscribeToPlant(plantId, onUpdate, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/stream/plant/${plantId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch (error) {
      console.error('Error parsing SSE data:', error);
      if (onError) onError(error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) onError(error);
  };
  
  // Return unsubscribe function
  return () => {
    eventSource.close();
  };
}

// ============================================
// REACT HOOKS FOR SSE
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for real-time dashboard data
 * @returns {Object} { data, error, isConnected }
 */
export function useDashboardStream() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const unsubscribe = subscribeToDashboard(
      (update) => {
        setData(update.data);
        setIsConnected(true);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsConnected(false);
      }
    );
    
    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);
  
  return { data, error, isConnected };
}

/**
 * React hook for real-time plant data
 * @param {number} plantId - The plant ID to subscribe to
 * @returns {Object} { data, error, isConnected }
 */
export function usePlantStream(plantId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!plantId) return;
    
    const unsubscribe = subscribeToPlant(
      plantId,
      (update) => {
        setData(update.data);
        setIsConnected(true);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsConnected(false);
      }
    );
    
    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [plantId]);
  
  return { data, error, isConnected };
}

/**
 * React hook for fetching data with loading state (non-streaming)
 * @param {Function} fetchFn - The fetch function to call
 * @param {Array} deps - Dependencies array
 * @returns {Object} { data, error, loading, refetch }
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);
  
  useEffect(() => {
    refetch();
  }, deps);
  
  return { data, error, loading, refetch };
}
