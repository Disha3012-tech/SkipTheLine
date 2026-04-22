const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// ── Central fetch wrapper with proper error handling ──
const request = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    
    // Handle non-JSON responses (like plain "Internal Server Error")
    const contentType = res.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await res.json()
      : { detail: await res.text() };

    // Throw error with backend's detail message if request failed
    if (!res.ok) {
      throw new Error(data.detail || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    // Network error (backend offline, CORS, etc.)
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error("Cannot connect to server. Please make sure the backend is running.");
    }
    throw err;
  }
};

export const api = {
  register: (data: object) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  login: (data: object) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getStalls: () =>
    request("/stalls"),

  createStall: (data: object) =>
    request("/stalls", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  getMenu: (stallId: number) =>
    request(`/menu/${stallId}`),

  addMenuItem: (data: object) =>
    request("/menu", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  updateMenuItem: (itemId: number, data: object) =>
    request(`/menu/${itemId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  deleteMenuItem: (itemId: number) =>
    request(`/menu/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  placeOrder: (data: object) =>
    request("/orders", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }),

  myOrders: () =>
    request("/orders/my", {
      headers: authHeaders(),
    }),

  getOrder: (orderId: number) =>
    request(`/orders/${orderId}`, {
      headers: authHeaders(),
    }),

  vendorOrders: () =>
    request("/orders", {
      headers: authHeaders(),
    }),

  updateOrderStatus: (orderId: number, status: string) =>
    request(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }),

  getQueue: (stallId: number) =>
    request(`/queue/${stallId}`),

  getQueuePosition: (orderId: number) =>
    request(`/queue/position/${orderId}`, {
      headers: authHeaders(),
    }),
};