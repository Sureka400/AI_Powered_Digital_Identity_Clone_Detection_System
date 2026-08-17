import axios from "axios";

const api = axios.create({
    baseURL: "https://digital-identity-backend-8i1s.onrender.com/"
});

export default api;