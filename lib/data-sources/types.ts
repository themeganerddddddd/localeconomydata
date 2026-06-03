export type SourceStatus = "real" | "missing" | "fallback";

export type SourceFetchResult<T> = {
  status: SourceStatus;
  data: T | null;
  message?: string;
};
