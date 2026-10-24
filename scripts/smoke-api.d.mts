export function smokeApi(
  origin: string,
  request?: (request: Request) => Response | Promise<Response>,
): Promise<string[]>;
