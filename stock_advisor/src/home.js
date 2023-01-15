import  Axios  from 'axios';
import {useState, useEffect, useContext} from 'react'; 
import {Context} from "./context.js";
import {useNavigate} from 'react-router-dom';
import StockAdvice from "./stockAdvice.js"
import StockTracker from './stockTracker.js';
import Login from './login.js';
import SignUp from './signUp.js';
import logo from "./logo.png"
function Home(){
    Axios.defaults.withCredentials = true; 
    const {user, setUser} = useContext(Context)
    const [page, setPage] = useState("stockAdvisor")
    let navigate = useNavigate()

    useEffect(()=>{
        if(!user){
            // check if user is logged in and get user info
            Axios.get("http://localhost:3001/session").then((response)=>{
                if(response.data.length > 0){
                    setUser(response.data[0])
                }
            }) 
        }
    }, [])

    const logOut = ()=>{
        Axios.post("http://localhost:3001/logout").then(()=>{
            setUser()
        }) 
    }

    return(
        <>
            <header className='header'>  
                <h1 className='header' style={{"border":"none"}}><img src={logo} id="logo"/>  Stock Advisor</h1>
                {/* Tabs to switch between the stock advisor, stock tracker, login, and sign up page */}
                <button onClick={()=>{setPage("stockAdvisor")}} className={page == "stockAdvisor" ? "activeTab" : "tab"}>Stock Advisor</button>
                <button onClick={()=>{setPage('stockTracker')}} className={page == "stockTracker" ? "activeTab" : "tab"}>Stock Tracker</button>
                {/* Show log out button if user is logged in else show login and signup button */}
                {user ? <button onClick={logOut} className="tab">Log out</button> 
                : 
                    <>
                        <button  className={page == "login" ? "activeTab" : "tab"} onClick={()=>{setPage('login')}}>Login</button>
                        <button className={page == "signUp" ? "activeTab" : "tab"} onClick={()=>{setPage('signUp')}}>Sign up</button>
                    </>
                }
            </header>

            {/* Show content based on what tab is active */}
            <div className='backgroundDiv'>
                <div className='contentDiv'>
                    {page == "stockAdvisor" && <StockAdvice/>}
                    {page == "stockTracker" && <StockTracker/>}
                    {page == "login" && <Login setPage = {setPage}/>}
                    {page == "signUp" && <SignUp setPage = {setPage}/>}

                </div>
            </div>
        </>
    )
}

export default Home;