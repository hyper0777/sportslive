interface SportsDataOptions {
  endpoint: string;
  country?: string;
}

export async function fetchSportsData(options: SportsDataOptions) {
  try {
    const response = await fetch('/.netlify/functions/sports-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: options.endpoint,
        country: options.country,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sports data request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sports data:', error);
    throw error;
  }
}

// Convenience functions
export async function getCountryFlag(countryCode: string) {
  return fetchSportsData({
    endpoint: 'flag',
    country: countryCode,
  });
}

export async function getCountryData(countryCode: string) {
  return fetchSportsData({
    endpoint: 'country',
    country: countryCode,
  });
}
