import { api } from "@/config/axios.config";

type SummaryResponse = {
  totalUsers: number;
  totalAccounts: number;
  completedTxs: number;
  pendingTxs: number;
};


export const getSummary = async (blockchainRid: string): Promise<SummaryResponse> => {
  try {
    const response = await api.get("/app/summary", {
      params: {
        blockchainRid,
      },
    });
    return response.data;
  } catch (error: any) {
    return error.response.data;
  }
};
