import  Axios  from 'axios';
import {useState, useContext} from 'react'; 
import {Context} from "./context.js";
import {useNavigate} from 'react-router-dom';

function SignUp(props){
    Axios.defaults.withCredentials = true; 
    let navigate = useNavigate()
    const {setUser} = useContext(Context)
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [confirmedPassword, setConfirmedPassword] = useState()

    const signUp = (e)=>{
        e.preventDefault()

        if(confirmedPassword == password)
            Axios.post("http://localhost:3001/signUp", {username: username, password: password}).then((response)=>{
                if(response.data == "username in use"){
                    alert("Username in use")
                }
                else{
                    setUser({username: username, userId: response.data[0]})
                    props.setPage("stockAdvisor")
                }
            })
        else{
            alert("Confirmed password doesn't match password")
        }
    }

    const getUsername = (e)=>{
        setUsername(e.target.value.trim())
    }

    const getPassword = (e)=>{
        setPassword(e.target.value.trim())
    }

    const getConfirmPassword = (e)=>{
        setConfirmedPassword(e.target.value.trim())
    }

    return(
        <>
        <h1>Sign Up</h1>
        <form className = "flexCol" onSubmit={signUp}>
            <input type="text"  required className = "normalInput" onChange={getUsername} placeholder="Username" value={username}/>
            <input type="password" required className = "normalInput"  onChange={getPassword}  placeholder="Password" value={password}/>
            <input type="password" required className = "normalInput"  onChange={getConfirmPassword}  placeholder="Confirm password" value={confirmedPassword}/>
            <button type="submit" required className="normalButton">Sign Up</button>
        </form>
        </>

    )
}

export default SignUp;