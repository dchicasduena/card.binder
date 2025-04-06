exports.handler = async (event, context) => {
  const fetch = (await import('node-fetch')).default;

  const apiKey = process.env.REACT_APP_POKEMON_TCG_API_KEY;
  const { name: rawSearch } = event.queryStringParameters;

  try {
    let apiUrl = '';
    let queryParts = [];

    const fetchCards = async (url) => {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
      const json = await res.json();
      return json?.data || [];
    };

    if (rawSearch && rawSearch.trim()) {
      const search = decodeURIComponent(rawSearch).trim();
      const numberSetPattern = /^(\d{1,3})\/(\d{1,3})$/;
      const numberOnlyPattern = /^\d{1,3}$/;

      if (numberSetPattern.test(search)) {
        const [, numberRaw, totalRaw] = search.match(numberSetPattern);
        const number = parseInt(numberRaw, 10);
        const printedTotal = parseInt(totalRaw, 10);
        apiUrl = `https://api.pokemontcg.io/v2/cards?q=number:${number} AND set.printedTotal:${printedTotal}`;
      } else if (numberOnlyPattern.test(search)) {
        if (search === '151') {
          // Special case for "151"
          const [setResults, numberResults] = await Promise.all([
            fetchCards(`https://api.pokemontcg.io/v2/sets?q=name:"151"`),
            fetchCards(`https://api.pokemontcg.io/v2/cards?q=number:151`)
          ]);

          const setId = setResults.length > 0 ? setResults[0].id : null;
          const setCards = setId
            ? await fetchCards(`https://api.pokemontcg.io/v2/cards?q=set.id:"${setId}"`)
            : [];

          // Merge and dedupe
          const combined = [...setCards, ...numberResults];
          const unique = Array.from(
            new Map(combined.map(card => [card.id, card])).values()
          );

          const withImages = unique.filter(card => card.images?.large);

          return {
            statusCode: 200,
            body: JSON.stringify(withImages),
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          };
        } else {
          const number = parseInt(search, 10);
          apiUrl = `https://api.pokemontcg.io/v2/cards?q=number:${number}`;
        }
      } else {
        const patterns = {
          type: /type:(\w+)/i,
          supertype: /supertype:(\w+)/i,
          subtype: /subtype:(\w+)/i,
          rarity: /rarity:(["\w\s]+)/i,
          hp: /hp:([<>]=?|=)?(\d+)/i,
          set: /set:(["\w\s]+)/i,
          name: /name:(["\w\s]+)/i,
        };

        for (const [key, regex] of Object.entries(patterns)) {
          const match = search.match(regex);
          if (match) {
            if (key === 'hp') {
              const operator = match[1] || '';
              const value = match[2];
              queryParts.push(`${key}:${operator}${value}`);
            } else {
              let value = match[1].replace(/"/g, '');
              queryParts.push(`${key}:"${value}"`);
            }
          }
        }

        if (queryParts.length === 0) {
          const setQuery = `https://api.pokemontcg.io/v2/sets?q=name:"${search}"`;
          const setResponse = await fetch(setQuery, {
            headers: { Authorization: `Bearer ${apiKey}` }
          });
          const setData = await setResponse.json();

          if (setData?.data?.length > 0) {
            const setId = setData.data[0].id;
            queryParts.push(`set.id:"${setId}"`);
          } else {
            queryParts.push(`name:"${search}"`);
          }
        }

        apiUrl = `https://api.pokemontcg.io/v2/cards?q=${queryParts.join(' AND ')}`;
      }
    } else {
      apiUrl = `https://api.pokemontcg.io/v2/cards`;
    }

    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch data' }),
      };
    }

    const data = await response.json();
    const cards = data.data || [];

    const cardsWithImages = cards.filter(card => card.images && card.images.large);
    let selectedCards = cardsWithImages;

    if (!rawSearch || !rawSearch.trim()) {
      selectedCards = shuffleArray(cardsWithImages).slice(0, 18);
    }

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

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
