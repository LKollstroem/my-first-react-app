//import all needed functions, libraries
import './styles.css';
import axios from 'axios';
import Dropdown from './Dropdown';
import React, { useEffect, useState } from 'react';


function App() {

//Id's passwords and URI to beused in the cal to the API    
    const CLIENT_ID = "09b47dff3cf542aa8ba606df73c215e0"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"


//Data for the dropdown
    const dropdowndata = [
        {value: 1, name: 'A'},
        {value: 2, name: 'B'},
        {value: 3, name: 'C'},
     ]

//All searches listed:
    const [token, setToken] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [artists, setArtists] = useState([]);
    const [playlist, setPlaylist] = useState([]);
//    const [tracks, setTracks] = useState({selectedTrack: '', listOfTracksFromAPI: []});
//    const [trackDetail, setTrackDetail] = useState(null); 

//Save token in localstorage
    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")
        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
            console.log(token)
            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }
        setToken(token)

    }, [])

//logout by removing the token
    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
    }

    const searchArtists = async (e) => {
        e.preventDefault()
        const {data} = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                q: searchKey,
                type: "artist"
            }
        })
        console.log(data);

        setArtists(data.artists.items)
    }
    const renderArtists = () => {
        return artists.map(artist => (
            <div className="container" key={artist.id}>
                <div className="row">
                    <div className="col-sm-3" name="Image">
                        <h3>Image</h3>
                        {artist.images.length ? <img width={"90%"} src={artist.images[0].url} alt=""/> : <div>No Image found in Spotify records</div>}
                    </div>    
                    <div className="col-sm-2" name="Artist">   
                        <h3>Artist</h3>
                        {artist.name}
                    </div> 
                    <div className="col-sm-4" name="Genre"> 
                        <h3>Genre</h3>
                        {artist.genres}
                    </div> 
                    <div className="col-sm-3" name="Popularity"> 
                        <h3>Popularity</h3>
                        {artist.popularity}
                    </div>
                </div>
            </div>
        ))
    }
//Search for Playlist:
 


//Return all information with header and if token is not ok, then redirect
    return (
        <div className="App">
            <header className="App-header">
              <div className="container">
                <div className="row">
                    <h1 className="col-sm-11">Search in Spotify API</h1>
                    {!token ?
                        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`} className="col-sm-1">Login
                        to Spotify</a>
     
 // otherwise show logout button and headers, search button and dropdown              
                        : <button className="col-sm-1" onClick={logout}>Logout</button>}
                </div>            
              </div>        
                {token ?   
                    <form onSubmit={searchArtists}>
                        <br></br>
                        <div className="container">
                            <h2>Enter artist name and hit search to see the artist information and an image.</h2>
                            <input type="text" onChange={e => setSearchKey(e.target.value)}/>
                            <button type={"submit"}>Search</button>
                        </div>    
                        <div onSubmit={() => {}} className="container">
                            <h3>Which would you like to get more information on?</h3>
                                        <Dropdown options={artists}/>
                                        <button type= 'submit'>
                                        More info
                                        </button>
                        </div>  





                    </form>  

                    : <h2>Please login</h2>


                          


                }    

                {renderArtists()}

       
            </header>
            
        </div>    
    );
}

export default App;

