
import auth from "./userAuth"

function App() {
   
  

  return (
    <div>
      <button onClick={()=> auth()}>Connect your spotify</button>
      <h1>Display your spotifile profile data</h1>

      <section id="profile">
        <h2>Logged in as <span id="displayName"></span></h2>
        <span id="avatar"></span>
        <ul>
          <li>User ID: <span id="id"></span></li>
          <li>Email: <span id="email"></span></li>
          <li>Spotify URI: <a id="uri" href="#"></a></li>
          <li>Link: <a id="url" href="#"></a></li>
          <li>Profile Image: <span id="imgUrl"></span></li>
        </ul>
      </section>
    </div>
  )
}

export default App
