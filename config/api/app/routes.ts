import { api } from "@/config/axios.config";

type SummaryResponse = {
  totalUsers: number;
  totalAccounts: number;
  completedTxs: number;
  pendingTxs: number;
};


export const getSummary = async (): Promise<SummaryResponse> => {
  try {
    const response = await api.get("/app/summary");
    return response.data;
  } catch (error: any) {
    return error.response.data;
  }
};
