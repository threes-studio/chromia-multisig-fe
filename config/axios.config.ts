import axios from "axios";
import { env } from "./env";

const baseURL = env.API_BASE_URL + "/api";

export const api = axios.create({
  baseURL,
});
