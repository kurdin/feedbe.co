export const PORT: number = 8888;
export const API_URL: string = `http://localhost:${PORT}/graphql`;
export const JWT_EXPIRED: string = '1d';
export const JWT_SECRET_KEY: string =
	process.env.JWT_SECRET_KEY || '3nm_r&n3q!1i5$2zoddok1i69p@2ausmve+r%0#xb6%b5w_e!f';
