import { api } from "@/config/axios.config";
import { Transaction, CreateTransaction, TransactionSign, TransactionExecute } from './types';

const API_NAME = 'transactions';

// * Transactions
export const getTransactions = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  q?: string; // Search by transaction ID
  filter?: string; // Filter by status
  [key: string]: any;
  populate?: string,
}) => {
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

export const createTransaction = async (transaction: CreateTransaction) => {
  const response = await api.post(`/${API_NAME}`, transaction);
  return response.data;
};

export const getTransaction = async (id: Transaction["id"]) => {
  const response = await api.get(`/${API_NAME}/${id}`);
  return response.data;
};

export const signTransaction = async (id: Transaction["id"], body: TransactionSign) => {
  const response = await api.post(`/${API_NAME}/${id}/sign`, body);
  return response.data;
};

export const executeTransaction = async (id: Transaction["id"], body: TransactionExecute) => {
  const response = await api.post(`/${API_NAME}/${id}/execute`, body);
  return response.data;
};
