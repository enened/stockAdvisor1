import { useState, useEffect} from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import {Context} from "./context.js";
import Home from "./home.js"

function App() {
  const [user, setUser] = useState()

  return (
    <Context.Provider value={{user, setUser}}>
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />}/>
        <Route path="*" element={<Navigate to="/" />}/>
      </Routes>
    </Router>
  </Context.Provider>
  );
}

export default App;
