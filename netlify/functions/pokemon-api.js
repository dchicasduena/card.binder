exports.handler = async (event, context) => {
    const fetch = (await import('node-fetch')).default;
    
    const apiKey = process.env.REACT_APP_POKEMON_TCG_API_KEY;
    const { name, set, type, rarity } = event.queryStringParameters; // Additional search parameters
    
    // Build the query string dynamically based on parameters
    let query = '';
    
    if (name) query += `name=${encodeURIComponent(name)}&`;
    if (set) query += `set=${encodeURIComponent(set)}&`;
    if (type) query += `types=${encodeURIComponent(type)}&`;
    if (rarity) query += `rarity=${encodeURIComponent(rarity)}&`;
  
    // Remove the trailing "&" if present
    query = query ? query.slice(0, -1) : '';
  
    try {
      const apiUrl = `https://api.pokemontcg.io/v2/cards?${query}`; // Correct API URL
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`  // Make sure to send the API key in the Authorization header
        }
      });
      const data = await response.json();
      
      // Check if there are cards in the response
      if (data.data) {
        return {
          statusCode: 200,
          body: JSON.stringify(data.data) // Send only the cards data
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'No cards found.' })
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch data." })
      };
    }
  };
  