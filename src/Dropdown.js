// import react and useState
import React, { useState } from "react";

//make dropdown function with useState 
const Dropdown = props => {
    const [selectedValue, setSelectedValue] = useState("");

    
 //return the functions to the app
    return (
        <div>
            <select value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
                {props.options.map((item, idx) => <option key={idx} value={item.value}>{item.name} </option>)}
            </select>
            <p><b>Search for: </b> {selectedValue}</p>
        </div>
    );
}
   
export default Dropdown;