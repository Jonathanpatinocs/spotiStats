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
function showTopTracks(topTracks: any) {
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

function populateUI(profile: any) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
      const profileImage = new Image(200, 200);
      profileImage.src = profile.images[0].url;
      document.getElementById("avatar")!.appendChild(profileImage);
  }
  
}
function populateTopTracks(topTracks: any) {
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
    const topTracksYear = await fetchTopTracksYear(accessToken)
    const topTracksMonths = await fetchTopTracksMonths(accessToken)
    const topTracksWeeks = await fetchTopTracksWeeks(accessToken)
    console.log(profile);
    console.log(topTracksYear)
    const topTracksYearList = showTopTracks(topTracksYear)
    const topTracksMonthsList = showTopTracks(topTracksMonths)
    const topTracksWeeksList = showTopTracks(topTracksWeeks)
    populateUI(profile)
    populateTopTracks(topTracksWeeksList)
    console.log(topTracksYearList)
    console.log(topTracksMonthsList)
    console.log(topTracksWeeksList)

    const weeksButton = document.getElementById('4weeks')
    const monthsButton = document.getElementById('6months')
    const yearButton = document.getElementById('1year')
    const div = document.getElementById('topTracks')
    weeksButton?.addEventListener('click', ()=> {
      while (div?.lastElementChild) {
        div.removeChild(div.lastElementChild)
      }
      populateTopTracks(topTracksWeeksList)
      weeksButton.classList.add('selected')
      monthsButton?.classList.remove('selected')
      yearButton?.classList.remove('selected')
    })

    monthsButton?.addEventListener('click', ()=> {
      while (div?.lastElementChild) {
        div.removeChild(div.lastElementChild)
      }
      populateTopTracks(topTracksMonthsList)
      monthsButton.classList.add('selected')
      weeksButton?.classList.remove('selected')
      yearButton?.classList.remove('selected')
      
    })

    yearButton?.addEventListener('click', ()=> {
      while (div?.lastElementChild) {
        div.removeChild(div.lastElementChild)
      }
      populateTopTracks(topTracksYearList)
      yearButton.classList.add('selected')
      monthsButton?.classList.remove('selected')
      weeksButton?.classList.remove('selected')
    })

  }
}

export default auth


