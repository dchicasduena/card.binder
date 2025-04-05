exports.handler = async (event, context) => {
  const fetch = (await import('node-fetch')).default;

  const apiKey = process.env.REACT_APP_POKEMON_TCG_API_KEY;
  const { name } = event.queryStringParameters;

  try {
    let apiUrl = "";

    if (name && name.trim()) {
      // Search for cards by name
      apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(name)}`;
    } else {
      // Default: fetch all cards (paginated, get first 250 to sample from)
      apiUrl = `https://api.pokemontcg.io/v2/cards`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data' }),
      };
    }

    const data = await response.json();
    const cards = data.data || [];

    // Filter to only cards with images
    const cardsWithImages = cards.filter(card => card.images && card.images.large);

    let selectedCards = cardsWithImages;

    // If no name search, shuffle and return only 18 random cards
    if (!name || !name.trim()) {
      selectedCards = shuffleArray(cardsWithImages).slice(0, 18);
    }

     // If no cards found, return a "no results" response
     if (selectedCards.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ noResults: true }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(selectedCards),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data.' }),
    };
  }
};

// Simple shuffle function (Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
