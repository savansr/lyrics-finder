const axios = require('axios');
const express = require('express');
const cors=require('cors');
const extractLyrics = require('./extractLyrics'); // Import the lyrics extraction function

// Replace with your Genius API access token
const GENIUS_API_TOKEN = 'umZ4c3xE3MRHgAAEUsYdDb6_BY_TE_YfK85tVtH2uMXaJqAxo6YkcNBJvwjeHxpA';

const app = express();
const port = 4500;        
 
// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Function to get song details including lyrics and album art
const getSongDetails = async (songTitle, artistName) => {
  try {
    // Search for the song
    const searchResponse = await axios.get('https://api.genius.com/search', {
      params: {
        q: `${songTitle} ${artistName}`,
      },
      headers: {
        Authorization: `Bearer ${GENIUS_API_TOKEN}`,
        'User-Agent': 'lyrics_generator/1.0',
      },
    });

    // Extract song information
    const song = searchResponse.data.response.hits[0]?.result;
    if (!song) {
      return { error: 'Song not found!' };
    }

    // Get song lyrics URL
    const songUrl = `https://genius.com${song.path}`;
    const albumCoverUrl = song.song_art_image_url || 'Album cover not available';

    // Use the lyrics extraction function
    const lyrics = await extractLyrics(songUrl);

    if (!lyrics) {
      return { error: 'Lyrics not found!' };
    }

    return { lyrics, albumCoverUrl };

  } catch (error) {
    console.error('Error fetching song details:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return { error: 'An error occurred while fetching song details.' };
  }
};

// Define the route to handle user requests
app.get('/song-details', async (req, res) => {
  const { songTitle, artistName } = req.query;

  if (!songTitle || !artistName) {
    return res.status(400).json({ error: 'Missing songTitle or artistName query parameters.' });
  }

  const result = await getSongDetails(songTitle, artistName);

  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
