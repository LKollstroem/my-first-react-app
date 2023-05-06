import React from 'react';
import './styles.css';
import {useEffect, useState} from 'react';
import axios from 'axios';


function App() {
    const CLIENT_ID = "09b47dff3cf542aa8ba606df73c215e0"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"

    const [token, setToken] = useState("")
    const [searchKey, setSearchKey] = useState("")
    const [artists, setArtists] = useState([])


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
            <div class="container" key={artist.id}>
                <div class="row">
                    <div class="col-sm-3" name="Image">
                        <h3>Image</h3>
                        {artist.images.length ? <img width={"90%"} src={artist.images[0].url} alt=""/> : <div>No Image found in Spotify records</div>}
                    </div>    
                    <div class="col-sm-2" name="Artist">   
                        <h3>Artist</h3>
                        {artist.name}
                    </div> 
                    <div class="col-sm-4" name="Genre"> 
                        <h3>Genre</h3>
                        {artist.genres}
                    </div> 
                    <div class="col-sm-3" name="Popularity"> 
                        <h3>Popularity</h3>
                        {artist.popularity}
                    </div>
                </div>
            </div>
        ))
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Search in Spotify API</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
                        to Spotify</a>
                    : <button onClick={logout}>Logout</button>}
                

                {token ?   
                    <form onSubmit={searchArtists}>
                        <br></br>
                        <h2>Enter artist name and hit search to see the artist information and an image.</h2>
                        <input type="text" onChange={e => setSearchKey(e.target.value)}/>
                        <button type={"submit"}>Search</button>
                        <br></br>
                    </form>

                    : <h2>Please login</h2>

                }    

                {renderArtists()}


            </header>
        </div>
    );
}

export default App;

