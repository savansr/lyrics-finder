import { useState,useEffect} from 'react';
import axios from 'axios';
import './App.css'; 


function App() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [albumCover, setAlbumCover] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const [isLoadingContent, setIsLoadingContent] = useState(true); // New state for background control


 


  const handleCopy = () => {
    if (lyrics) {
      navigator.clipboard.writeText(lyrics).then(() => alert('Lyrics Copied To Clipboard'))
        .catch(err => { alert('Failed To Copy Lyrics') })
    } else {
      alert('No Lyrics Found')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    if (!title || !artist) {
      setError('Both fields are required.');
      return;
    }

    setLoading(true);
    setIsLoadingContent(true); // Start loading content
    setLyrics(''); // Clear previous lyrics
    setError('');

    try {
      const response = await axios.get('http://localhost:4500/song-details', {
        params: {
          songTitle: title,
          artistName: artist
        }
      });

      if (response.data.error) {
        setError(response.data.error);
        setLyrics('');
        setAlbumCover('');
      } else {
        setLyrics(response.data.lyrics);
        setAlbumCover(response.data.albumCoverUrl);
        setError('');
      }
    } catch (err) {
      setError('An error occurred while fetching song details.');
      setLyrics('');
      setAlbumCover('');
    } finally {
      setLoading(false);
      setIsLoadingContent(false); // Finished loading content
    }
  };




  

  return (
    <div className="app-container" style={{ backgroundImage: `url(${isLoadingContent ? '/herejes-gif.gif' : albumCover})` }}>
      <div className="blur-overlay"></div>
      <h1 className="lilita-one-regular">Lyrics<span className="inner-text">Finder</span></h1>


      <form onSubmit={handleSubmit}>
        <input className='user-input'
          type="text"
          value={title}
          placeholder='Enter Song Title'
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input className='user-input'
          type="text"
          value={artist}
          placeholder='Enter Artist Name'
          onChange={(e) => setArtist(e.target.value)}
        />
        <br />
        <input type='submit' className='btn' value='Search' disabled={loading} />
      </form>

      {loading && <div className="loading-spinner"></div>} {/* Display loading message */}
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      <div className="lyrics-container">
        {lyrics && lyrics.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))} {/* Display lyrics */}
      </div>

      {lyrics && <button className='copy-btn' onClick={handleCopy}>Copy Lyrics</button>}
    </div>
  );
}

export default App;
