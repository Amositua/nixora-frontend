import api from "../api/api"
import useAuth from "./useAuth";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
const refreshToken = localStorage.getItem("refreshToken");
console.log(refreshToken)
    const refresh = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
console.log(refreshToken)
        const response = await api.post('/v1/auth/refresh', refreshToken, {
            withCredentials: true
        });
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            return { ...prev, accessToken: response.data.accessToken }
        });
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;