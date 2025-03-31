exports.handler = async (event, context) => {
  const fetch = (await import('node-fetch')).default;

  const apiKey = process.env.REACT_APP_POKEMON_TCG_API_KEY;
  const { name } = event.queryStringParameters;

  try {
    const apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const cards = data.data || [];
      const cardsWithImages = cards.filter((card) => card.images && card.images.large);

      return {
        statusCode: 200,
        body: JSON.stringify(cardsWithImages),
        headers: {
          'Access-Control-Allow-Origin': '*', // Enable CORS
          'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allow headers
        },
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data.' }),
    };
  }
};
