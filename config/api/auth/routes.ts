import { api } from "@/config/axios.config";

interface LoginData {
  pubKey: string;
  signature: string;
}

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post("/auth/sign-in", data);
    return response.data;
  } catch (error: any) {
    return error.response.data;
  }
};
