import  Axios  from 'axios';
import {useState, useEffect, useContext} from 'react'; 
import {Context} from "./context.js";
import {useNavigate} from 'react-router-dom';


function Login(props){
    Axios.defaults.withCredentials = true; 
    const {setUser} = useContext(Context)
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    let navigate = useNavigate()

    const login = (e)=>{
        e.preventDefault()
        Axios.post("http://localhost:3001/login", {username: username, password: password}).then((response)=>{
            if(response.data == "Wrong combo"){
                alert("Wrong password or username")
            }
            else{
                setUser({username: username, userId: response.data[0].userId})
                props.setPage("stockAdvisor")
            }
        })
    }

    const getUsername = (e)=>{
        setUsername(e.target.value)
    }

    const getPassword = (e)=>{
        setPassword(e.target.value)
    }



    return (
    <>
      <h1>Login</h1>
      <form className = "flexCol" onSubmit={login}>
        <input type="text"  required className = "normalInput" onChange={getUsername} placeholder="Username"/>
        <input type="password" required className = "normalInput"  onChange={getPassword}  placeholder="Password"/>
        <p>Don't have an account? Sign up</p>
        <button type="submit" required className="normalButton">Login</button>
      </form>
    </>
    )
}

export default Login;