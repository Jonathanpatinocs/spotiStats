import './styles.scss' 
import auth from "./APICalls"
import spotifyLogo from './assets/spotify-logo.webp'


function topStreams() {
  return (
  <div>rh</div>
);
}


function App() {
  
   auth()
   
  return (
    <div>
      <section id="header">
        <div id='header-left'>
          <img src={spotifyLogo} alt="Spotify Logo" />
          <h1>Your Spotify Top <span id='selectTracks' className='selectedList'>Tracks</span> <span id='selectArtists'>Artists</span> <span id ='selectCharts'>Charts</span></h1>
            
        </div>
        <div id='header-right'>
          <h2>Logged in as <span id="displayName"></span></h2>
          <span id="avatar"></span>
        </div>
        
      </section>
      <div id= "buttons">
          <button id='4weeks' className='selected'>4 Weeks</button>
          <button id='6months'>6 Months</button>
          <button id='1year'>Year</button>
        </div>
      <div id='topTracksContainer'>
        <div id="topTracks"></div>
        
      </div>
      <div id="chartsDiv">
        <topStreams></topStreams>
      </div>
    
      
    </div>
  )
}

export default App
