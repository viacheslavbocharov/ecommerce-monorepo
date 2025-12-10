export async function parseJson<T = unknown>(response: Response): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();
  return data as T;
}
