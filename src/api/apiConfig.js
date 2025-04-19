const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = "https://api.themoviedb.org/3";

const apiConfig = {
  API_KEY,
  API_URL,
  w500Image: (path) => `https://image.tmdb.org/t/p/w500${path}`,
  originalImage: (path) => `https://image.tmdb.org/t/p/original${path}`,
};

export default apiConfig;
