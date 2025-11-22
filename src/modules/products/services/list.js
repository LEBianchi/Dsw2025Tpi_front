import { instance } from '../../shared/api/axiosInstance';

export const getProducts = async (search = null, status = null, pageNumber = 1, pageSize = 20 ) => {
  const queryString = new URLSearchParams({
    search,
    status,
    pageNumber,
    pageSize,
  });

  const response = await instance.get(`api/products/admin?${queryString}`);

  return { data: response.data, error: null };
};

export const getProductsClient =  async (search = null, pageNumber = 1, pageSize = 10 ) => {
  const queryString = new URLSearchParams({
    search: search || '',
    pageNumber,
    pageSize,
    status: 'enabled'
  });

  const response = await instance.get(`api/products?${queryString}`);

  return { data: response.data, error: null };
};