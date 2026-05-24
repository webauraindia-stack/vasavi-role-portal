import { apiFetch } from "@/lib/api/client";

type Page<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** Fetch a single page (`page_size` up to 100 on the API). */
export async function fetchPage<T>(
  path: string,
  accessToken: string,
  page = 1,
  pageSize = 100
): Promise<Page<T>> {
  const separator = path.includes("?") ? "&" : "?";
  return apiFetch<Page<T>>(
    `${path}${separator}page=${page}&page_size=${pageSize}`,
    { method: "GET", accessToken }
  );
}

/** Fetch every page of a paginated list endpoint. */
export async function fetchAllResults<T>(
  path: string,
  accessToken: string,
  options?: { pageSize?: number; maxPages?: number }
): Promise<T[]> {
  const pageSize = options?.pageSize ?? 100;
  const maxPages = options?.maxPages ?? 50;
  const items: T[] = [];
  let page = 1;

  for (;;) {
    const data = await fetchPage<T>(path, accessToken, page, pageSize);
    items.push(...(data.results ?? []));
    if (!data.next) break;
    page += 1;
    if (page > maxPages) break;
  }

  return items;
}
