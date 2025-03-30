const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const apiKey = process.env.POKEMON_TCG_API_KEY;
  const searchTerm = event.queryStringParameters.name || 'pikachu';

  const url = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from API.' })
    };
  }
};
