import { api } from "@/config/axios.config";
import { Account, AccountRegister, AccountUpdateAuthDescriptor } from './types'

const API_NAME = 'multisig-accounts';;

// * Accounts
export const getAccounts = async (params: {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  q?: string;
  search?: string;
  filter?: string;
  select?: string;
  [key: string]: any; // Define any key here
}) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    direction = 'desc',
    q = '',
    search = '',
    filter = '',
    select = '',
    ...rest
  } = params || {};

  const filteredParams = Object.fromEntries(
    Object.entries({
      sort,
      direction,
      page,
      limit,
      q,
      search,
      select,
      filter,
      ...rest
    }).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  );

  const response = await api.get(`/${API_NAME}`, {
    params: filteredParams,
  });

  return response.data;
};

export const createAccount = async (account: Account) => {
  const response = await api.post(`/${API_NAME}`, account);
  return response.data;
};

export const getAccount = async (id: Account["id"]) => {
  const response = await api.get(`/${API_NAME}/${id}`);
  return response.data;
};

export const updateAccount = async (id: Account["id"], account: AccountUpdateAuthDescriptor) => {
  const response = await api.put(`/${API_NAME}/${id}`, account);
  return response.data;
};

export const transferFee = async (id: Account["id"]) => {
  const response = await api.post(`/${API_NAME}/${id}/transfer-fee`);
  return response.data;
};

export const registerAccount = async (id: Account["id"], params: AccountRegister) => {
  const response = await api.post(`/${API_NAME}/${id}/register`, params);
  return response.data;
};

export const listAsset = async (id: Account["id"]) => {
  const response = await api.get(`/${API_NAME}/${id}/assets
    `);
  return response.data;
};