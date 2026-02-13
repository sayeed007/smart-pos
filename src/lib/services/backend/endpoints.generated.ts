import { backendApi } from '@/lib/axios';

export type BackendHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface EndpointCallOptions {
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
}

export const backendEndpointMap = {
  delete_api_v_categories_id: { method: 'delete', path: '/categories/{id}' },
  delete_api_v_customers_id: { method: 'delete', path: '/customers/{id}' },
  delete_api_v_locations_id: { method: 'delete', path: '/locations/{id}' },
  delete_api_v_offers_id: { method: 'delete', path: '/offers/{id}' },
  delete_api_v_products_id: { method: 'delete', path: '/products/{id}' },
  delete_api_v_users_id: { method: 'delete', path: '/users/{id}' },
  get_api_v_cash_shift_current: { method: 'get', path: '/cash/shift/current' },
  get_api_v_cash_shifts: { method: 'get', path: '/cash/shifts' },
  get_api_v_categories: { method: 'get', path: '/categories' },
  get_api_v_categories_id: { method: 'get', path: '/categories/{id}' },
  get_api_v_customers: { method: 'get', path: '/customers' },
  get_api_v_customers_id: { method: 'get', path: '/customers/{id}' },
  get_api_v_customers_id_loyalty_history: { method: 'get', path: '/customers/{id}/loyalty-history' },
  get_api_v_health: { method: 'get', path: '/health' },
  get_api_v_health_ready: { method: 'get', path: '/health/ready' },
  get_api_v_inventory_stock_locationId: { method: 'get', path: '/inventory/stock/{locationId}' },
  get_api_v_inventory_transactions_productId: { method: 'get', path: '/inventory/transactions/{productId}' },
  get_api_v_locations: { method: 'get', path: '/locations' },
  get_api_v_locations_id: { method: 'get', path: '/locations/{id}' },
  get_api_v_offers: { method: 'get', path: '/offers' },
  get_api_v_offers_active: { method: 'get', path: '/offers/active' },
  get_api_v_offers_id: { method: 'get', path: '/offers/{id}' },
  get_api_v_products: { method: 'get', path: '/products' },
  get_api_v_products_barcode: { method: 'get', path: '/products/barcode/{barcode}' },
  get_api_v_products_id: { method: 'get', path: '/products/{id}' },
  get_api_v_sales: { method: 'get', path: '/sales' },
  get_api_v_sales_id: { method: 'get', path: '/sales/{id}' },
  get_api_v_settings: { method: 'get', path: '/settings' },
  get_api_v_tenants_me: { method: 'get', path: '/tenants/me' },
  get_api_v_users: { method: 'get', path: '/users' },
  get_api_v_users_id: { method: 'get', path: '/users/{id}' },
  patch_api_v_cash_shift_id_close: { method: 'patch', path: '/cash/shift/{id}/close' },
  patch_api_v_categories_id: { method: 'patch', path: '/categories/{id}' },
  patch_api_v_customers_id: { method: 'patch', path: '/customers/{id}' },
  patch_api_v_inventory_transfers_id_receive: { method: 'patch', path: '/inventory/transfers/{id}/receive' },
  patch_api_v_inventory_transfers_id_ship: { method: 'patch', path: '/inventory/transfers/{id}/ship' },
  patch_api_v_locations_id: { method: 'patch', path: '/locations/{id}' },
  patch_api_v_offers_id: { method: 'patch', path: '/offers/{id}' },
  patch_api_v_products_id: { method: 'patch', path: '/products/{id}' },
  patch_api_v_sales_id_void: { method: 'patch', path: '/sales/{id}/void' },
  patch_api_v_settings: { method: 'patch', path: '/settings' },
  patch_api_v_tenants_me: { method: 'patch', path: '/tenants/me' },
  patch_api_v_users_id: { method: 'patch', path: '/users/{id}' },
  post_api_v_auth_login: { method: 'post', path: '/auth/login' },
  post_api_v_auth_logout: { method: 'post', path: '/auth/logout' },
  post_api_v_auth_refresh: { method: 'post', path: '/auth/refresh' },
  post_api_v_auth_register: { method: 'post', path: '/auth/register' },
  post_api_v_cash_shift_id_transaction: { method: 'post', path: '/cash/shift/{id}/transaction' },
  post_api_v_cash_shift_open: { method: 'post', path: '/cash/shift/open' },
  post_api_v_categories: { method: 'post', path: '/categories' },
  post_api_v_customers: { method: 'post', path: '/customers' },
  post_api_v_customers_id_points_adjust: { method: 'post', path: '/customers/{id}/points/adjust' },
  post_api_v_inventory_adjust: { method: 'post', path: '/inventory/adjust' },
  post_api_v_inventory_transfers: { method: 'post', path: '/inventory/transfers' },
  post_api_v_locations: { method: 'post', path: '/locations' },
  post_api_v_offers: { method: 'post', path: '/offers' },
  post_api_v_products: { method: 'post', path: '/products' },
  post_api_v_sales: { method: 'post', path: '/sales' },
  post_api_v_users: { method: 'post', path: '/users' },
} as const;

export type BackendEndpointKey = keyof typeof backendEndpointMap;

function applyPathParams(pathTemplate: string, pathParams?: Record<string, string | number>) {
  if (!pathParams) return pathTemplate;
  return Object.entries(pathParams).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp('\\{' + key + '\\}', 'g'), encodeURIComponent(String(value)));
  }, pathTemplate);
}

export async function callBackendEndpoint<T = unknown>(
  key: BackendEndpointKey,
  options: EndpointCallOptions = {}
): Promise<T> {
  const endpoint = backendEndpointMap[key];
  const url = applyPathParams(endpoint.path, options.pathParams);
  const response = await backendApi.request<T>({
    url,
    method: endpoint.method,
    params: options.query,
    data: options.data,
  });
  return response.data;
}
