import axios from "axios";

export const swrDefaults = {
  revalidateOnFocus: false,
} as const;

export const axiosFetcher = <T>(url: string) =>
  axios.get<T>(url).then((res) => res.data);

export const isSwrPending = (isLoading: boolean, isValidating: boolean) =>
  isLoading || isValidating;
