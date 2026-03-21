const BASE_URL = 'https://openplzapi.org/de/Localities';
const PAGE_SIZE = 50;

async function fetchLocalitiesPage(
	locality: string,
	page: number,
): Promise<{
	postalCodes: string[];
	totalPages: number;
}> {
	const response = await fetch(
		`${BASE_URL}?name=${encodeURIComponent(locality)}&page=${page}&pageSize=${PAGE_SIZE}`,
	);

	if (!response.ok) {
		throw new Error(`OpenPLZ request failed: ${response.status}`);
	}

	const postalCodes = (await response.json()).map(
		(item: { postalCode: string }) => item.postalCode,
	);
	const totalPagesHeader = response.headers.get('x-total-pages');
	const totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;

	return {
		postalCodes,
		totalPages: Number.isNaN(totalPages) ? 1 : totalPages,
	};
}

export async function lookupByLocality(locality: string): Promise<string[]> {
	const query = locality.trim();
	if (!query) {
		return [];
	}

	const firstPage = await fetchLocalitiesPage(query, 1);
	const allPostalCodes = [...firstPage.postalCodes];

	for (let page = 2; page <= firstPage.totalPages; page += 1) {
		const nextPage = await fetchLocalitiesPage(query, page);
		allPostalCodes.push(...nextPage.postalCodes);
	}

	return [...new Set(allPostalCodes.filter(Boolean))];
}

export async function lookupByPostalCode(
	postalCode: string,
): Promise<string[]> {
	const query = postalCode.trim();
	if (!query) {
		return [];
	}

	const response = await fetch(
		`${BASE_URL}?postalCode=${encodeURIComponent(query)}`,
	);

	if (!response.ok) {
		throw new Error(`OpenPLZ request failed: ${response.status}`);
	}

	const localities = await response.json();
	return localities
		.map((item: { name: string }) => item.name)
		.filter(Boolean);
}
