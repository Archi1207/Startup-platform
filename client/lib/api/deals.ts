import useSWR from 'swr';
import { api } from './api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useDeals(params?: {
  search?: string;
  category?: string;
  accessLevel?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.accessLevel) queryParams.append('accessLevel', params.accessLevel);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/deals${queryString ? `?${queryString}` : ''}`;
  
  return useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });
}