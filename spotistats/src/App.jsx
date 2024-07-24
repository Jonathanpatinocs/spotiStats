import './styles.scss' 
import auth from "./APICalls"
import spotifyLogo from './assets/spotify-logo.webp'





function App() {
  
   auth()
   
   

  return (
    <div>
      <section id="profile">
        <div id='profile-left'>
        <img src={spotifyLogo} alt="Spotify Logo" />
            <h1>Your Spotify Top Tracks</h1>
            
        </div>
        <div id='profile-right'>
          <h2>Logged in as <span id="displayName"></span></h2>
          <span id="avatar"></span>
        </div>
        
      </section>
      <div id='topTracksContainer'>
        <div id="topTracks"></div>
      </div>
      
      
      
    </div>
  )
}

export default App
