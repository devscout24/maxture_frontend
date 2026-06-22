// Central API layer keeps backend calls in one place for reuse and easier debugging.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get base domain URL (without /api suffix) for image/asset URLs
export function getAssetBaseUrl(): string {
  if (!API_BASE_URL) return "";
  const normalized = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  // Remove /api suffix if present
  return normalized.endsWith("/api")
    ? normalized.slice(0, -4)
    : normalized;
}

function toggleApiPrefix(base: string): string {
  if (!base) return base;
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  if (trimmed.endsWith("/api")) {
    return trimmed.slice(0, -4);
  }
  return `${trimmed}/api`;
}

function canUseRelativeProxyFallback(url: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const parsed = new URL(url);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

// Clear all auth-related storage
export const isMockToken = (token: string | null): boolean => {
  if (!token) return false;
  // `google:` is demo/mock session token.
  // `google-jwt:` contains a real JWT payload (prefix stripped before API call).
  return token.startsWith("google:");
};

export const forceLogout = (reason?: string) => {
  console.warn(`[API] forceLogout called. Reason: ${reason || "No reason provided"}`);

  // Clear all auth-related storage
  localStorage.removeItem("expovivienda_auth_session");
  localStorage.removeItem("expovivienda_demo_user");
  localStorage.removeItem("auth_token");

  // Clear any other potential auth keys
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('token') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });

  // Redirect to login page
  // console.log("[API] Redirecting to /login...");
  window.location.href = "/login";
};

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  // console.debug(`[API] authenticatedFetch called. API_BASE_URL=${API_BASE_URL}, url=${url}`);
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    // Strip mock prefixes before sending to backend
    const cleanToken = token.startsWith("google-jwt:") 
      ? token.replace("google-jwt:", "") 
      : token;
    headers.set("Authorization", `Bearer ${cleanToken}`);
  }

  if (!headers.has("X-Timezone")) {
    headers.set("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  }

  let response: Response | null = null;

  // console.debug(`[API] Fetching URL: ${url}`);
  try {
    response = await fetch(url, { ...options, headers });

    // If backend returns 404, try toggling an `/api` prefix on the base URL and retry once.
    if (response.status === 404 && API_BASE_URL) {
      try {
        const altBase = toggleApiPrefix(API_BASE_URL);
        if (altBase && url.startsWith(API_BASE_URL)) {
          const altUrl = url.replace(API_BASE_URL, altBase);
          console.warn(`[API] 404 at ${url} — retrying ${altUrl}`);
          console.debug(`[API] Retrying URL: ${altUrl}`);
          try {
            response = await fetch(altUrl, { ...options, headers });
            console.debug(`[API] Retry response status: ${response.status} for ${altUrl}`);
          } catch (altErr) {
            console.warn('[API] Retry with toggled API prefix failed, will attempt relative /api proxy', altErr);
            // fallthrough to relative proxy attempt below
            throw altErr;
          }
        }
      } catch (e) {
        console.warn('[API] Error while retrying with toggled API prefix', e);
        throw e;
      }
    }
  } catch (err) {
    console.warn('[API] Network error during authenticatedFetch, attempting relative /api proxy fallback', err);

    if (!canUseRelativeProxyFallback(url)) {
      return null;
    }

    // Try a relative /api proxy fallback (useful for local Next.js rewrites)
    try {
      const parsed = new URL(url);
      const relative = `${parsed.pathname}${parsed.search}`;
      console.debug(`[API] Trying relative proxy URL: ${relative}`);
      response = await fetch(relative, { ...options, headers });
      console.debug(`[API] Relative proxy response status: ${response.status}`);
    } catch (proxyErr) {
      console.error('[API] Relative /api proxy fallback failed', proxyErr);
      return null;
    }
  }

  if (response && response.status === 401) {
    console.warn(`[API] 401 at ${url}`);

    // Do not force a global logout here.
    // Some background/profile requests may briefly return 401 during token refresh,
    // and clearing the whole session causes an unexpected sign-out.
    // Let the caller decide how to handle the auth failure.
    return response;
  }

  if (response && response.status === 403) {
    console.warn(`[API] 403 at ${url}`);
    return response;
  }

  return response;
}


// Helper function to normalize image URLs (convert relative to absolute)
export function getImageUrl(imagePath: string | null | undefined): string {
  return getImageUrlVariants(imagePath)[0] || "";
}

export function getImageUrlVariants(imagePath: string | null | undefined): string[] {
  if (!imagePath) {
    return [];
  }

  const cleanPath = imagePath.replace(/^\/+/, "");
  const withoutPublicPrefix = cleanPath.replace(/^public\//, "");

  // If already absolute URL, return as-is
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return [cleanPath];
  }

  const variants = new Set<string>();
  const normalizedApiBase = API_BASE_URL
    ? API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL
    : "";
  const normalizedAssetBase = getAssetBaseUrl()
    ? getAssetBaseUrl().endsWith("/")
      ? getAssetBaseUrl().slice(0, -1)
      : getAssetBaseUrl()
    : "";

  if (normalizedApiBase) {
    variants.add(`${normalizedApiBase}/${cleanPath}`);
    variants.add(`${normalizedApiBase}/${withoutPublicPrefix}`);
    variants.add(`${normalizedApiBase}/storage/${withoutPublicPrefix}`);
    variants.add(`${normalizedApiBase}/storage/app/public/${withoutPublicPrefix}`);
  }

  if (normalizedAssetBase) {
    variants.add(`${normalizedAssetBase}/${cleanPath}`);
    variants.add(`${normalizedAssetBase}/api/${cleanPath}`);
    variants.add(`${normalizedAssetBase}/${withoutPublicPrefix}`);
    variants.add(`${normalizedAssetBase}/api/${withoutPublicPrefix}`);
    variants.add(`${normalizedAssetBase}/storage/${withoutPublicPrefix}`);
    variants.add(`${normalizedAssetBase}/api/storage/${withoutPublicPrefix}`);
    variants.add(`${normalizedAssetBase}/storage/app/public/${withoutPublicPrefix}`);
  }

  if (cleanPath.startsWith("api/") && normalizedAssetBase) {
    variants.add(`${normalizedAssetBase}/${cleanPath.slice(4)}`);
  }

  return Array.from(variants);
}

// Helper to get auth token for API calls
export function getAuthToken(): string | null {
  try {
    const session = localStorage.getItem("expovivienda_auth_session");
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.token || null;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return null;
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  premium?: number;
};

export type AuthSessionResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  data: {
    user: AuthUser;
    authorisation: {
      token: string;
      type: string;
    };
  };
  errors?: Record<string, string[]>;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "user" | "agent";
};

export type RegisterResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  errors?: Record<string, string[]>;
  data: AuthSessionResponse["data"];
};

function getFirstApiErrorMessage(
  data: { message?: string; errors?: Record<string, string[]> } | null,
  fallback: string,
): string {
  const firstError = data?.errors
    ? Object.values(data.errors).find((messages) => messages?.length)?.[0]
    : undefined;

  return firstError ?? data?.message ?? fallback;
}

// for registration and eventually other auth-related API calls like login, password reset, etc.
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as RegisterResponse | null;

  if (!response.ok || !data) {
    throw new Error(getFirstApiErrorMessage(data, "Registration failed"));
  }

  return data;
}


// for login type
export type LoginPayload = {
  email: string;
  password: string;
};

// for login api call
export async function loginUser(payload: LoginPayload): Promise<AuthSessionResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",

    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AuthSessionResponse | null;

  if (!response.ok || !data) {
    throw new Error(getFirstApiErrorMessage(data, "Login failed"));
  }

  return data;
}

export type GoogleSocialPayload = {
  access_token: string;
  id_token?: string;
  role: "user" | "agent";
};

export type GoogleSocialLoginPayload = {
  access_token: string;
};

/**
 * Register a new user via Google OAuth (upsert).
 * URL: POST {{base_url}}/auth/social/google/register
 * Sends: access_token, id_token (optional), role
 */
export async function registerWithGoogleSocial(payload: GoogleSocialPayload): Promise<AuthSessionResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  // console.log("[API] registerWithGoogleSocial - Connecting to backend...", { role: payload.role });

  const response = await fetch(`${API_BASE_URL}/auth/social/google/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",

    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AuthSessionResponse | null;

  if (!response.ok || !data || !data.success) {
    console.error("[API] registerWithGoogleSocial failed:", { status: response.status, data });
    throw new Error(getFirstApiErrorMessage(data as any, "Google registration failed"));
  }

  // console.log("[API] registerWithGoogleSocial - Success!");
  return data;
}

/**
 * Log in an existing Google user.
 * URL: POST {{base_url}}/auth/social/google/login
 * Sends: access_token only (no role needed — user already exists).
 */
export async function loginWithGoogleSocial(payload: GoogleSocialLoginPayload): Promise<AuthSessionResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  // console.log("[API] loginWithGoogleSocial - Connecting to backend...");

  const response = await fetch(`${API_BASE_URL}/auth/social/google/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",

    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AuthSessionResponse | null;

  if (!response.ok || !data || !data.success) {
    console.error("[API] loginWithGoogleSocial failed:", { status: response.status, data });
    throw new Error(getFirstApiErrorMessage(data as any, "Google login failed"));
  }

  // console.log("[API] loginWithGoogleSocial - Success!");
  return data;
}

export type LogoutResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  errors?: Record<string, string[]>;
  data: Record<string, string>;
};

export type ProfileUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "agent" | "admin" | string;
  avatar: string | null;
  bio: string | null;
  address?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  created_at: string;
};

export type ProfileUpdatePayload = {

  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  birth_date?: string | null;
};

export type ProfileUpdateResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  errors?: Record<string, string[]>;
  data: {
    name: string;
    email: string;
    avatar: string | null;
    address: string | null;
    phone: string | null;
    birth_date: string | null;
  };
};

export type AgentListItem = {
  id: number;
  name: string;
  avatar: string;
};

export type AgentsResponse = {
  success: boolean;
  message: string;
  data: {
    agents: AgentListItem[];
    stats: {
      total_agents: number;
      total_properties: number;
    };
  };
  errors?: Record<string, string[]>;
};

export type AgentProperty = {
  id: number;
  title: string;
  price: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  thumbnail: string;
};

export type AgentDetail = {
  id: number;
  name: string;
  avatar: string;
  bio: string | null;
  properties: AgentProperty[];
};

export type AgentDetailResponse = {
  success: boolean;
  message: string;
  data: {
    agent: AgentDetail;
  };
  errors?: Record<string, string[]>;
};

export type PropertyCreatePayload = {
  title: string;
  sales_type: SalesType;
  bedrooms: number;
  bathrooms: number;
  property_type_id: number;
  area: number;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
};

export const SALES_TYPES = ["raffle", "sales", "fair"] as const;
export type SalesType = typeof SALES_TYPES[number];

export type StorePropertyPayload = {
  title: string;
  sales_type: SalesType;
  property_type_id: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type StorePropertyResponse = {
  success: boolean;
  data: {
    property_id: number;
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
  errors?: Record<string, string[]>;
};

export type UpdatePropertyPriceResponse = {
  success: boolean;
  data: {
    property_id: number;
    new_price: number;
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
  errors?: Record<string, string[]>;
};

export type PropertyIndexItem = {
  id: number;
  title?: string;
  name?: string;
  price: string | number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  thumbnail: string;
  type?: string;
  feautured_tag?: boolean;
  live_stream_url?: string | null;
};

export type PropertyIndexResponse = {
  success: boolean;
  data: {
    properties: PropertyIndexItem[];
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
  errors?: Record<string, string[]>;
};

export type PaginatedPropertyIndex = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  items: PropertyIndexItem[];
};

export type FilteredPropertiesResponse = {
  success: boolean;
  data: {
    properties: PaginatedPropertyIndex;
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
  errors?: Record<string, string[]>;
};

export type PropertyDetailApiItem = {
  id?: number | string;
  property_id?: number | string;
  title?: string;
  price?: string | number;
  address?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  area?: number;
  description?: string;
  listing_type?: string;
  type?: string;
  status?: string;
  featured?: boolean | number;
  agent_id?: number | string;
  image?: string;
  thumbnail?: string;
  images?: string[];
  amenities?: string[];
  created_at?: string;
  [key: string]: unknown;
};

export type PropertyDetailResponse = {
  success?: boolean;
  status?: boolean | string;
  message?: string;
  code?: number;
  data?: {
    property?: PropertyDetailApiItem;
    data?: PropertyDetailApiItem;
    [key: string]: unknown;
  } | PropertyDetailApiItem;
  errors?: Record<string, string[]>;
  exception_file?: string | null;
  exception_path?: string | null;
};

export type PropertyTypesResponse = {
  success: boolean;
  data: {
    types?: string[];
    property_types?: string[];
    propertyTypes?: string[];
    [key: string]: unknown;
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
};

export type PropertyTypeOption = {
  id: number;
  name: string;
};

export type PropertyTypeOptionsResponse = {
  success: boolean;
  data: {
    property_types: PropertyTypeOption[];
  };
  message?: string;
  status?: boolean;
  code?: number;
  exception_file?: string | null;
  exception_path?: string | null;
};

export type FilteredPropertiesPayload = {
  search?: string;
  property_type_id: number[];
  price_range: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
};

export async function updateUserProfile(
  payload: ProfileUpdatePayload,
  token?: string,
): Promise<ProfileUpdateResponse> {

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/user/profile-update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as ProfileUpdateResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to update profile"));
  }

  return data;
}

export async function getAgents(): Promise<AgentsResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/agent/get-agents`, {
    headers: { 
      Accept: "application/json",
      "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const data = (await response.json().catch(() => null)) as AgentsResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch agents"));
  }

  return data;
}

export async function getAgentById(agentId: string | number): Promise<AgentDetailResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/agent/${agentId}/get-by-id`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as AgentDetailResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch agent"));
  }

  return data;
}

export async function storeProperty(
  payload: StorePropertyPayload,
  token?: string,
): Promise<StorePropertyResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/property/store`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as StorePropertyResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to store property"));
  }

  return data;
}

export async function updatePropertyPrice(
  propertyId: string | number,
  newPrice: number,
  token?: string,
): Promise<UpdatePropertyPriceResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/property/${propertyId}/update-price`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ new_price: newPrice }),
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as UpdatePropertyPriceResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to update property price"));
  }

  return data;
}

// export async function getPropertiesIndex(): Promise<PropertyIndexResponse> {
//   if (!API_BASE_URL) {
//     throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
//   }

//   const token = getAuthToken();
//   if (token && isMockToken(token)) {
//     try {
//       const publicData = await getPropertiesAll();
//       if (publicData?.success) {
//         return publicData;
//       }
//     } catch (e) {
//       console.warn("Fallback to getPropertiesAll failed", e);
//     }
//     return {
//       success: true,
//       data: { properties: [] }
//     };
//   }

//   const response = await authenticatedFetch(`${API_BASE_URL}/property/index`, {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//   });

//   if (!response) {
//     // User was logged out due to 401/403
//     throw new Error("Authentication failed");
//   }

//   const data = (await response.json().catch(() => null)) as PropertyIndexResponse | null;

//   if (!response.ok || !data || !data.success) {
//     throw new Error(getFirstApiErrorMessage(data, "Failed to fetch properties"));
//   }

//   return data;
// }

export async function getPropertiesIndex(): Promise<PropertyIndexResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const token = getAuthToken();
  if (token && isMockToken(token)) {
    try {
      const publicData = await getPropertiesAll();
      if (publicData?.success) return publicData;
    } catch (e) {
      console.warn("Fallback to getPropertiesAll failed", e);
    }
    return { success: true, data: { properties: [] } };
  }

  // ── Simple in-memory cache (30 seconds) ──
  const CACHE_KEY = "properties_index_cache";
  const CACHE_TTL = 30 * 1000;
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}

  const response = await authenticatedFetch(`${API_BASE_URL}/property/index`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response) throw new Error("Authentication failed");

  const data = (await response.json().catch(() => null)) as PropertyIndexResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch properties"));
  }

  // Save to cache
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}

  return data;
}

export async function getPropertiesAll(): Promise<PropertyIndexResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/property/get-all`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json().catch(() => null)) as PropertyIndexResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch properties"));
  }

  return data;
}



export async function getPropertyById(propertyId: string | number, token?: string): Promise<PropertyDetailResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/property/${propertyId}/get`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as PropertyDetailResponse | null;

  if (!response.ok || !data || data.success === false || data.status === "error") {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Property not found"));
  }

  return data;
}

export type PropertyDeleteResponse = {
  success: boolean;
  message: string;
};

// Delete property
export async function deleteProperty(propertyId: string | number): Promise<PropertyDeleteResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/property/${propertyId}/delete`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response) {
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as PropertyDeleteResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to delete property"));
  }

  return data;
}

//
export async function getPropertyTypes(): Promise<PropertyTypesResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await publicFetch(`${API_BASE_URL}/property/get-property-types`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response) {
    throw new Error("Failed to fetch property types");
  }

  const data = (await response.json().catch(() => null)) as PropertyTypeOptionsResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch property types"));
  }

  // API returns data.property_types as array of objects { id, name }
  // Extract just the names for compatibility
  const propertyTypeNames = data.data?.property_types?.map(type => type.name) || [];
  
  return {
    success: true,
    data: {
      types: propertyTypeNames,
      property_types: propertyTypeNames,
    },
  };
}

export async function getPropertyTypeOptions(): Promise<PropertyTypeOptionsResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await publicFetch(`${API_BASE_URL}/property/get-property-types`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response) {
    throw new Error("Failed to fetch property type options");
  }

  const data = (await response.json().catch(() => null)) as PropertyTypeOptionsResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch property type options"));
  }

  return data;
}

export async function getFilteredProperties(
  payload: FilteredPropertiesPayload,
): Promise<FilteredPropertiesResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const searchParams = new URLSearchParams();
  if (payload.search?.trim()) {
    searchParams.set("search", payload.search.trim());
  }
  searchParams.set("page", "1");
  searchParams.set("min_price", "");
  searchParams.set("max_price", "");
  searchParams.set("bedrooms", payload.bedrooms != null ? String(payload.bedrooms) : "");
  searchParams.set("bathrooms", payload.bathrooms != null ? String(payload.bathrooms) : "");

  console.log("[API] getFilteredProperties - Request Payload:", {
    url: `${API_BASE_URL}/property/get-filtered-properties?${searchParams.toString()}`,
    payload,
    property_type_id_type: Array.isArray(payload.property_type_id) ? "array" : typeof payload.property_type_id,
    property_type_id_value: payload.property_type_id,
  });

  const response = await publicFetch(`${API_BASE_URL}/property/get-filtered-properties?${searchParams.toString()}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response) {
    console.error("[API] getFilteredProperties - No response received");
    throw new Error("Failed to fetch filtered properties");
  }

  const data = (await response.json().catch(() => null)) as FilteredPropertiesResponse | null;

  const getPropertiesCount = () => data?.data?.properties?.items?.length ?? 0;

  console.log("[API] getFilteredProperties - Response:", {
    status: response.status,
    success: data?.success,
    propertiesCount: getPropertiesCount(),
  });

  if (!response.ok || !data || !data.success) {
    console.error("[API] getFilteredProperties - Error Response:", data);
    throw new Error(getFirstApiErrorMessage(data, "Failed to fetch filtered properties"));
  }

  return data;
}

// Raffle API types
export type RaffleDetailItem = {
  id: number;
  thumbnail: string;
  location: string | null;
  title: string;
  live_stream_url: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  start_date: string;
  dead_line: string;
  draw_date: string;
  tickets_sold: number;
  max_tickets: number;
  ticket_price: number;
};

export type RaffleDetailResponse = {
  success: boolean;
  raffle: RaffleDetailItem;
};

export type WishlistResponse = {
  success: boolean;
  wishlist: PropertyIndexItem[];
  message?: string;
  status?: boolean;
};

export type WishlistToggleResponse = {
  success: boolean;
  status: boolean;
  message: string;
  data?: {
    in_wishlist: boolean;
  };
};

export type WinnerItem = {
  winner_name: string;
  avatar: string | null;
  property_title: string;
  property_address: string;
  draw_date: string;
  property_price: number | string;
};

export type WinnersResponse = {
  data: {
    items: WinnerItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function getWinners(): Promise<WinnersResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/winners`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json().catch(() => null)) as WinnersResponse | null;

  if (!response.ok || !data?.data?.items) {
    throw new Error("Failed to fetch winners");
  }

  return data;
}

// API function to fetch individual raffle data
export async function getRaffleById(raffleId: string | number): Promise<RaffleDetailResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/raffle/${raffleId}/get-page`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json().catch(() => null)) as RaffleDetailResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch raffle details"));
  }

  return data;
}

export type RaffleIndexResponse = {
  success: boolean;
  message: string;
  raffles: Array<{
    id: number;
    thumbnail: string;
    location: string | null;
    title: string;
    live_stream_url: string | null;
    price: number;
    start_date: string;
    dead_line: string;
    draw_date: string;
    tickets_sold: number;
    max_tickets: number;
    ticket_price: number;
  }>;
};

// API function to fetch all raffles
export async function getRaffles(): Promise<RaffleIndexResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/raffle/index`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json().catch(() => null)) as RaffleIndexResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch raffles"));
  }

  return data;
}

// API function to get user's wishlist
export async function getWishlist(token?: string): Promise<WishlistResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const tokenToUse = token || getAuthToken();
  if (tokenToUse && isMockToken(tokenToUse)) {
    return {
      success: true,
      wishlist: []
    };
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/wishlist/get`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as WishlistResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch wishlist"));
  }

  return data;
}

// API function to toggle wishlist status
export async function toggleWishlist(propertyId: string | number, token?: string): Promise<WishlistToggleResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/wishlist/toggle/${propertyId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as WishlistToggleResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to toggle wishlist"));
  }

  return data;
}

// User profile API types
export type UserProfileResponse = {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
      bio: string | null;
      address: string | null;
      phone: string | null;
      created_at: string;
      tickets_count: number;
      saved_properties_count: number;
      total_spent: number;
    };
  };
  message?: string;
};

// API function to get user profile
export async function getUserProfile(token?: string): Promise<UserProfileResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const tokenToUse = token || getAuthToken();
  if (tokenToUse && isMockToken(tokenToUse)) {
    const stored = typeof window !== "undefined" ? localStorage.getItem("expovivienda_auth_session") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          // Wrap in the expected data structure
          return { 
            success: true, 
            data: { 
              user: {
                ...parsed.user,
                bio: parsed.user.bio || null,
                address: parsed.user.address || null,
                phone: parsed.user.phone || null,
                created_at: parsed.user.created_at || new Date().toISOString(),
                tickets_count: parsed.user.tickets_count || 0,
                saved_properties_count: parsed.user.saved_properties_count || 0,
                total_spent: parsed.user.total_spent || 0
              } 
            } 
          } as UserProfileResponse;
        }
      } catch (e) {}
    }
    return {
      success: true,
      data: {
        user: {
          id: 0,
          name: "Guest User",
          email: "guest@expovivienda.com",
          role: "agent",
          avatar: null,
          bio: null,
          address: null,
          phone: null,
          created_at: new Date().toISOString(),
          tickets_count: 0,
          saved_properties_count: 0,
          total_spent: 0
        }
      }
    } as UserProfileResponse;
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/user/profile-get`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as UserProfileResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch user profile"));
  }

  return data;
}

// Sidebar counts API
export type SidebarCountsResponse = {
  success: boolean;
  data: {
    tickets_count: number;
    saved_properties_count: number;
  };
  message?: string;
};

export async function getSidebarCounts(token?: string): Promise<SidebarCountsResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const tokenToUse = token || getAuthToken();
  if (tokenToUse && isMockToken(tokenToUse)) {
    return {
      success: true,
      data: { tickets_count: 0, saved_properties_count: 0 }
    };
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/user/sidebar-counts`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as SidebarCountsResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch sidebar counts"));
  }

  return data;
}

// My tickets API
export type MyTicketItem = {
  id: number | string;
  title?: string;
  name?: string;
  location?: string;
  address?: string;
  image?: string;
  thumbnail?: string;
  raffleDrawDate?: string;
  raffle_draw_date?: string;
  draw_date?: string;
  ticketNumber?: string;
  ticket_number?: string;
  winner?: boolean;
  is_winner?: boolean;
  property_title?: string;
  property?: {
    title?: string;
    address?: string;
    thumbnail?: string;
  };
};

export type MyTicketsResponse = {
  success: boolean;
  data: {
    tickets: MyTicketItem[];
  };
  message?: string;
};

export async function getMyTickets(token?: string): Promise<MyTicketsResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/user/my-tickets`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as MyTicketsResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to fetch tickets"));
  }

  return data;
}

// Change password API types
export type ChangePasswordPayload = {
  old_password: string;
  password: string;
  password_confirmation: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  data: {
    name: string;
    email: string;
    avatar: string | null;
  };
};

// API function to change password
export async function changePassword(
  payload: ChangePasswordPayload,
  token?: string,
): Promise<ChangePasswordResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/user/change-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response) {
    // User was logged out due to 401/403
    throw new Error("Authentication failed");
  }

  const data = (await response.json().catch(() => null)) as ChangePasswordResponse | null;

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to change password"));
  }

  return data;
}

// API function to logout
export async function logoutUser(token?: string): Promise<any> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response) {
    throw new Error("Logout request failed");
  }

  const data = (await response.json().catch(() => null));

  if (!response.ok || !data || !data.success) {
    throw new Error(getFirstApiErrorMessage(data as { message?: string; errors?: Record<string, string[]> } | null, "Failed to logout"));
  }

  return data;
}


export async function publicFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response | null> {
  console.debug(`[API] publicFetch called. API_BASE_URL=${API_BASE_URL}, url=${url}`);
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    console.debug(`[API] Fetching URL: ${url}`);
    const response = await fetch(url, { ...options, headers });

    // Retry once on 404 by toggling /api prefix (same logic as authenticatedFetch)
    if (response.status === 404 && API_BASE_URL) {
      try {
        const altBase = toggleApiPrefix(API_BASE_URL);
        if (altBase && url.startsWith(API_BASE_URL)) {
          const altUrl = url.replace(API_BASE_URL, altBase);
          console.warn(`[API] publicFetch 404 at ${url} — retrying ${altUrl}`);
          console.debug(`[API] Retrying URL: ${altUrl}`);
          try {
            const altResponse = await fetch(altUrl, { ...options, headers });
            console.debug(`[API] Retry response status: ${altResponse.status} for ${altUrl}`);
            return altResponse;
          } catch (altErr) {
            console.warn('[API] publicFetch retry with toggled API prefix failed, will attempt relative /api proxy', altErr);
            // fallthrough to relative proxy attempt below
          }
        }
      } catch (e) {
        console.warn('[API] Error while retrying publicFetch with toggled API prefix', e);
      }
    }

    return response;
  } catch (error) {
    console.error(`[API] publicFetch network error at ${url}:`, error);

    if (!canUseRelativeProxyFallback(url)) {
      return null;
    }

    // Try a relative /api proxy fallback (useful for local Next.js rewrites)
    try {
      const parsed = new URL(url);
      const relative = `${parsed.pathname}${parsed.search}`;
      console.debug(`[API] publicFetch trying relative proxy URL: ${relative}`);
      const proxyResponse = await fetch(relative, { ...options, headers });
      console.debug(`[API] Relative proxy response status: ${proxyResponse.status}`);
      return proxyResponse;
    } catch (proxyErr) {
      console.error('[API] publicFetch relative /api proxy fallback failed', proxyErr);
      return null;
    }
  }
}


// Forgot password API types
export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  data: [];
};

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/auth/password/email`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as ForgotPasswordResponse | null;

  if (!data) {
    throw new Error("Failed to send reset link");
  }

  if (!data.success) {
    throw new Error(data.message || "Failed to send reset link");
  }

  return data;
}

// Reset password API types
export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  status: boolean;
  message: string;
  code: number;
  exception_file: string | null;
  exception_path: string | null;
  data: [];
};

// API function to reset password
export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as ResetPasswordResponse | null;

  if (!data) {
    throw new Error("Failed to reset password");
  }

  if (!data.success) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
}
