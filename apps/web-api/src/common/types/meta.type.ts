export interface MetaPaginated {
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
