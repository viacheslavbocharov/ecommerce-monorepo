export function extractSetCookies(response: Response): string[] | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const raw = (response.headers as any).raw?.() as
    | Record<string, string[]>
    | undefined;

  return raw?.['set-cookie'];
}
