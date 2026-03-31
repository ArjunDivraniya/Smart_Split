/**
 * Translates technical error messages and status codes into 
 * user-friendly, actionable guidance.
 */
export const mapErrorMessage = (error: any, fallback: string = 'Something went wrong. Please try again.'): string => {
  if (!error) return fallback;

  // Handle Axios specific errors
  if (error.isAxiosError) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'Connection timeout. Please check your internet.';
      return 'Network error. Please check your internet connection.';
    }

    const status = error.response.status;
    const data = error.response.data;
    const serverMessage = data?.message || data?.error;

    // Map common HTTP status codes to friendly messages
    switch (status) {
      case 400:
        if (serverMessage?.toLowerCase().includes('already exists')) return 'This email is already registered. Try signing in.';
        if (serverMessage?.toLowerCase().includes('invalid')) return 'The information provided is invalid. Please double-check.';
        return serverMessage || 'Please check your information and try again.';
      
      case 401:
        if (serverMessage?.toLowerCase().includes('password')) return 'Incorrect password. Please try again.';
        return 'Invalid email or password.';
      
      case 403:
        return 'You do not have permission to perform this action.';
      
      case 404:
        return 'What you are looking for could not be found.';
      
      case 422:
        return 'Validation failed. Please ensure all fields are correct.';
      
      case 429:
        return 'Too many attempts. Please wait a moment and try again.';
      
      case 500:
        return 'Our server is having a moment. Please try again in a few minutes.';
      
      default:
        return serverMessage || fallback;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network')) return 'Check your internet connection and try again.';
    if (msg.includes('timeout')) return 'The request took too long. Try again?';
    return error.message || fallback;
  }

  // Final fallback for strings or unknown types
  return typeof error === 'string' ? error : fallback;
};
