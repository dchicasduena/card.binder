// netlify/functions/pokemon-api.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Get the secret from the environment variables
  const apiKey = process.env.REACT_APP_POKEMON_TCG_API_KEY;
  const { name } = event.queryStringParameters;
  
  try {
    // Use the API key in your request to the external service
    const apiUrl = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(name)}&apiKey=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data." })
    };
  }
};
