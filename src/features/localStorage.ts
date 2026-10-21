import type { UserPreference } from "@/features/onboarding-flow";

// note that the value is out of sync with code, to maintain backwards compatibility
const PROFILE_TEXT_KEY = "hn-user-context";
const ADDITIONAL_USER_CONTEXT_KEY = "hn-additional-user-context";
const USER_ID_KEY = "hn-user-id";
const USER_PREFERENCES_KEY = "hn-user-preferences";

type UserContextData = {
  context: string;
  timestamp: number;
};

type UserIdData = {
  userId: string;
  timestamp: number;
};

type UserPreferencesData = {
  preferences: UserPreference[];
  timestamp: number;
};

// Generate a unique user ID using crypto.randomUUID for better security
const generateUserId = (): string => {
  try {
    // Check if crypto.randomUUID is available (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      const uuid = crypto.randomUUID();
      return `user_${Date.now()}_${uuid}`;
    }

    // Fallback for older browsers or environments without crypto.randomUUID
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const uuid = Array.from(array, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      return `user_${Date.now()}_${uuid}`;
    }

    // Final fallback using Math.random (less secure but still functional)
    const randomString = Math.random().toString(36).substring(2, 15);
    return `user_${Date.now()}_${randomString}`;
  } catch (error) {
    console.error("Failed to generate secure user ID, using fallback:", error);
    // Fallback using timestamp and Math.random
    const randomString = Math.random().toString(36).substring(2, 15);
    return `user_${Date.now()}_${randomString}`;
  }
};

export const localStorageUtils = {
  // Clear additional user context from localStorage
  clearAdditionalUserContext: (): boolean => {
    try {
      if (typeof window === "undefined") return false;

      localStorage.removeItem(ADDITIONAL_USER_CONTEXT_KEY);
      return true;
    } catch (error) {
      console.error(
        "Failed to clear additional user context from localStorage:",
        error
      );
      return false;
    }
  },

  // Clear user ID from localStorage
  clearUserId: (): boolean => {
    try {
      if (typeof window === "undefined") return false;

      localStorage.removeItem(USER_ID_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear user ID from localStorage:", error);
      return false;
    }
  },

  // Check if user has been on platform for more than a day
  hasUserBeenOnPlatformForMoreThanDay: (): boolean => {
    try {
      if (typeof window === "undefined") return false;

      const userIdData = localStorageUtils.loadUserIdData();
      if (!userIdData) return false;

      const now = Date.now();
      const userCreatedAt = userIdData.timestamp;
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return now - userCreatedAt > oneDayInMs;
    } catch (error) {
      console.error("Failed to check user platform time:", error);
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable: (): boolean => {
    try {
      if (typeof window === "undefined") return false;

      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Load additional user context from localStorage
  loadAdditionalUserContext: (): string | null => {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem(ADDITIONAL_USER_CONTEXT_KEY);
      if (!stored) return null;

      const data: UserContextData = JSON.parse(stored);
      return data.context || null;
    } catch (error) {
      console.error(
        "Failed to load additional user context from localStorage:",
        error
      );
      return null;
    }
  },

  // Load or generate user ID from localStorage
  loadOrGenerateUserId: (): string => {
    try {
      if (typeof window === "undefined") {
        // Return a temporary ID for SSR - will be replaced on client
        return `temp_${Date.now()}`;
      }

      const stored = localStorage.getItem(USER_ID_KEY);
      if (stored) {
        const data: UserIdData = JSON.parse(stored);
        return data.userId;
      }

      // Generate new user ID and store it
      const newUserId = generateUserId();
      const userData: UserIdData = {
        timestamp: Date.now(),
        userId: newUserId
      };

      localStorage.setItem(USER_ID_KEY, JSON.stringify(userData));
      return newUserId;
    } catch (error) {
      console.error("Failed to load or generate user ID:", error);
      // Return a fallback ID
      return `fallback_${Date.now()}`;
    }
  },

  // Load user context from localStorage
  loadProfileText: (): string | null => {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem(PROFILE_TEXT_KEY);
      if (!stored) return null;

      const data: UserContextData = JSON.parse(stored);
      return data.context || null;
    } catch (error) {
      console.error("Failed to load user context from localStorage:", error);
      return null;
    }
  },

  // Load user ID data from localStorage
  loadUserIdData: (): UserIdData | null => {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem(USER_ID_KEY);
      if (!stored) return null;

      const data: UserIdData = JSON.parse(stored);
      return data;
    } catch (error) {
      console.error("Failed to load user ID data from localStorage:", error);
      return null;
    }
  },

  // Load user preferences from localStorage
  loadUserPreferences: (): UserPreference[] | null => {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem(USER_PREFERENCES_KEY);
      if (!stored) return null;

      const data: UserPreferencesData = JSON.parse(stored);
      return data.preferences || null;
    } catch (error) {
      console.error(
        "Failed to load user preferences from localStorage:",
        error
      );
      return null;
    }
  },

  // Save additional user context to localStorage
  saveAdditionalUserContext: (context: string): boolean => {
    try {
      if (typeof window === "undefined") return false;

      const data: UserContextData = {
        context,
        timestamp: Date.now()
      };

      localStorage.setItem(ADDITIONAL_USER_CONTEXT_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(
        "Failed to save additional user context to localStorage:",
        error
      );
      return false;
    }
  },

  // Save user context to localStorage
  saveProfileText: (profileText: string): boolean => {
    try {
      if (typeof window === "undefined") return false;

      const data: UserContextData = {
        context: profileText,
        timestamp: Date.now()
      };

      localStorage.setItem(PROFILE_TEXT_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save user context to localStorage:", error);
      return false;
    }
  },

  // Save user preferences to localStorage
  saveUserPreferences: (preferences: UserPreference[]): boolean => {
    try {
      if (typeof window === "undefined") return false;

      const data: UserPreferencesData = {
        preferences,
        timestamp: Date.now()
      };

      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save user preferences to localStorage:", error);
      return false;
    }
  }
};
