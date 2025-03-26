// Configuration for different environments
const ENV = {
  dev: {
    apiUrl: 'http://localhost:8080',
  },
  docker: {
    apiUrl: 'http://backend:8080',
  },
  prod: {
    apiUrl: 'https://your-production-api.com',
  }
};

// Determine the current environment
// In a real app, you might use environment variables or build flags
const getEnvironment = () => {
  // Check if running in Docker
  if (process.env.REACT_APP_ENV === 'docker') {
    return ENV.docker;
  }
  
  // Default to development environment
  return ENV.dev;
};

export default getEnvironment(); 