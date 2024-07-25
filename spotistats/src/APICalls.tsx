import { log } from "console";
import React, { createElement } from "react";


import ReactDOM from "react-dom";


// --------------- Verify that request is authentic -------------------- // 
function generateCodeVerifier(length: number) { 
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

// --------------- Verify that request is authentic -------------------- //


async function redirecttoAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128)
  const challenge = await generateCodeChallenge(verifier)

  localStorage.setItem("verifier", verifier)

  const params = new URLSearchParams()
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback"); // redirect url
  params.append("scope", "user-read-private user-read-email user-top-read user-read-recently-played "); // Scopes to allows fetching the user profile data
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);
  
  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`

}
async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier")

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  })

  const {access_token }  = await result.json()
  return access_token
}

async function fetchProfile(token: string): Promise<any> { // calls the web api and gets profile data
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`}
  })
  return await result.json()
}

/*------------ API Calls for Top Tracks by TimeFrame -------------------- */
 async function fetchTopTracksYear(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50", {
      method: "GET",
      headers: {Authorization: `Bearer ${token}`}
    })
    
    return await result.json()
}

async function fetchTopTracksMonths(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  
  return await result.json()
}
async function fetchTopTracksWeeks(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  
  return await result.json()
}
/* --------------------------------------------------------------------------------------- */

function showTopTracks(topTracks: any) { /* Convert top tracks json file to array with track objects */
  const toptracksArray: any[] = []
  
  for( let i = 0; i < topTracks.items.length; i++) {
    let track = {
      title: topTracks.items[i].name,
      artist: topTracks.items[i].artists[0].name,
      artwork: topTracks.items[i].album.images[0].url
    }
    toptracksArray.push(track)
  }
  
  return (toptracksArray)
}

/*------------ API Calls for Top Artists by TimeFrame -------------------- */
async function fetchTopArtistsYear(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  return await result.json()
}

async function fetchTopArtistsMonths(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  return await result.json()
}

async function fetchTopArtistsWeeks(token: string): Promise<any> {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50", {
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  return await result.json()
}
/* --------------------------------------------------------------------------------------- */

function showTopArtists(topArtists: any) { /* Convert top artists json file to array with artists objects */
  const topartistsArray: any[] = []
  
  for( let i = 0; i < topArtists.items.length; i++) {
    let artist = {
      
      artist: topArtists.items[i].name,
      artwork: topArtists.items[i].images[0].url
    }
    topartistsArray.push(artist)
  }
  
  return (topartistsArray)
}

function populateUI(profile: any) { /* DOM for profile Header*/
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
      const profileImage = new Image(200, 200);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar")!.appendChild(profileImage);
  }
  
}
function populateTopTracks(topTracks: any) { /* DOM for Top Tracks*/
  const div = document.getElementById('topTracks')
  for (let i = 0; i < topTracks.length; i++) {
    let trackDiv = document.createElement('div')
    trackDiv.classList.add('trackCard')
    let trackArtwork = document.createElement('img')
    let trackTitle = document.createElement('h1')
    let trackArtist = document.createElement('p')
    trackTitle.innerText = topTracks[i].title
    trackArtist.innerText = topTracks[i].artist
    trackArtwork.src = topTracks[i].artwork
    trackDiv.append(trackArtwork,trackTitle, trackArtist)
    div?.append(trackDiv)
  }
}
function populateTopArtists(topArtists: any) {  /* DOM for Top Artists*/
  const div = document.getElementById('topTracks')
  for (let i = 0; i < topArtists.length; i++) {
    let artistDiv = document.createElement('div')
    artistDiv.classList.add('trackCard')
    let artistArtwork = document.createElement('img')
    let artistTitle = document.createElement('h1')
    artistTitle.innerText = topArtists[i].artist
    artistArtwork.src = topArtists[i].artwork
    artistDiv.append(artistArtwork,artistTitle)
    div?.append(artistDiv)
  }
}

  function resetContainer() {  /* Removes all elements from topTracks div */
    const div = document.getElementById('topTracks')
    while (div?.lastElementChild) {
      div.removeChild(div.lastElementChild)
    }
  }

  async function auth() {  
    const clientId = "ff095abf4d4a4fc2b49583d127c624ad"
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code");
  if (!code) {
      redirecttoAuthCodeFlow(clientId)
    }
     else {

    const accessToken = await getAccessToken(clientId, code)
    const profile = await fetchProfile(accessToken)

/*------------ Fetch Top Artists and Tracks and make them into lists (arrays) -------------------- */
    const topTracksYear = await fetchTopTracksYear(accessToken)
    const topTracksMonths = await fetchTopTracksMonths(accessToken)
    const topTracksWeeks = await fetchTopTracksWeeks(accessToken)
    const topTracksYearList = showTopTracks(topTracksYear)
    const topTracksMonthsList = showTopTracks(topTracksMonths)
    const topTracksWeeksList = showTopTracks(topTracksWeeks)

    const topArtistsYear = await fetchTopArtistsYear(accessToken)
    const topArtistsMonths = await fetchTopArtistsMonths(accessToken)
    const topArtistsWeeks = await fetchTopArtistsWeeks(accessToken)
    const topArtistsYearList = showTopArtists(topArtistsYear)
    const topArtistsMonthsList = showTopArtists(topArtistsMonths)
    const topArtistsWeeksList = showTopArtists(topArtistsWeeks)

/* --------------------------------------------------------------------------------------- */
    console.log(topArtistsYear)
    console.log(topArtistsYearList)

      
    populateUI(profile) /* adds image and user name to header
    
/*------------------------- get elements from DOM   -------------------- */
    const selectTracks = document.getElementById('selectTracks')
    const selectArtists = document.getElementById('selectArtists')

    const weeksButton = document.getElementById('4weeks')
    const monthsButton = document.getElementById('6months')
    const yearButton = document.getElementById('1year')
    const div = document.getElementById('topTracks')


/*------------ Inital load with Tracks and 4 Week time frame selected -------------------- */

    populateTopTracks(topTracksWeeksList)

    weeksButton?.addEventListener('click', ()=> {
      resetContainer()
      populateTopTracks(topTracksWeeksList)
      weeksButton.classList.add('selected')
      monthsButton?.classList.remove('selected')
      yearButton?.classList.remove('selected')
    })

    monthsButton?.addEventListener('click', ()=> {
      resetContainer()
      populateTopTracks(topTracksMonthsList)
      monthsButton.classList.add('selected')
      weeksButton?.classList.remove('selected')
      yearButton?.classList.remove('selected')
      
    })

    yearButton?.addEventListener('click', ()=> {
      resetContainer()
      populateTopTracks(topTracksYearList)
      yearButton.classList.add('selected')
      monthsButton?.classList.remove('selected')
      weeksButton?.classList.remove('selected')
    })


/*------------ Functions for switching timeframes while Artists is selected -------------------- */


    selectArtists?.addEventListener('click', () => {
      selectArtists.classList.add('selectedList')
      selectTracks?.classList.remove('selectedList')

      resetContainer()
      
      populateTopArtists(topArtistsWeeksList)
      weeksButton?.classList.add('selected')
      monthsButton?.classList.remove('selected')
      yearButton?.classList.remove('selected')

      weeksButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopArtists(topArtistsWeeksList)
        weeksButton.classList.add('selected')
        monthsButton?.classList.remove('selected')
        yearButton?.classList.remove('selected')
      })
  
      monthsButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopArtists(topArtistsMonthsList)
        monthsButton.classList.add('selected')
        weeksButton?.classList.remove('selected')
        yearButton?.classList.remove('selected')
        
      })
  
      yearButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopArtists(topArtistsYearList)
        yearButton.classList.add('selected')
        monthsButton?.classList.remove('selected')
        weeksButton?.classList.remove('selected')
      })
    })

    /*------------ Functions for switching timeframes while Tracks is selected -------------------- */

    selectTracks?.addEventListener('click', () => {
      selectTracks.classList.add('selectedList')
      selectArtists?.classList.remove('selectedList')


      resetContainer()

      populateTopTracks(topTracksWeeksList)
      weeksButton?.classList.add('selected')
        monthsButton?.classList.remove('selected')
        yearButton?.classList.remove('selected')
        

      weeksButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopTracks(topTracksWeeksList)
        weeksButton.classList.add('selected')
        monthsButton?.classList.remove('selected')
        yearButton?.classList.remove('selected')
      })
  
      monthsButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopTracks(topTracksMonthsList)
        monthsButton.classList.add('selected')
        weeksButton?.classList.remove('selected')
        yearButton?.classList.remove('selected')
        
      })
  
      yearButton?.addEventListener('click', ()=> {
        resetContainer()
        populateTopTracks(topTracksYearList)
        yearButton.classList.add('selected')
        monthsButton?.classList.remove('selected')
        weeksButton?.classList.remove('selected')
      })

    })

    console.log(topTracksYearList)
    console.log(topTracksMonthsList)
    console.log(topTracksWeeksList)

    
    

  }
}

export default auth


