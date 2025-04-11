import { api } from "@/config/axios.config";
const API_NAME = 'blockchains';
import { Blockchain } from "./types";

// * Blockchains
export const getBlockchains = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  q?: string; // Search by blockchain ID
  filter?: string; // Filter by status
  [key: string]: any;
  populate?: string,
}): Promise<{
  data: Blockchain[];
  total: number;
  pageSize: number;
}> => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    direction = 'desc',
    q = '',
    filter = '',
    populate,
    ...rest
  } = params || {};

  const filteredParams = Object.fromEntries(
    Object.entries({
      sort,
      direction,
      page,
      limit,
      q,
      filter,
      populate,
      ...rest
    }).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  const response = await api.get(`/${API_NAME}`, {
    params: filteredParams,
  });

  return response.data;
};
