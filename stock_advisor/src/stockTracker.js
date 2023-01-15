import  Axios  from 'axios';
import {Context} from "./context.js";
import {useNavigate} from 'react-router-dom';
import {useState, useEffect, useContext} from 'react'; 

function StockTracker(){
    let navigate = useNavigate()
    const {user, setUser} = useContext(Context)
    const [stocks, setStocks] = useState([])
    const [newStock, setNewStock] = useState()
    const [allStocks, setAllStocks] = useState()

    useEffect(()=>{
        if(user){
            Axios.post("http://localhost:3001/getStocksTracking", {userId: user.userId}).then((response)=>{
                for (let i = 0; i < response.data.length; i++) {
                    fetch("http://127.0.0.1:5000/stockAdvise", {
                        method: "POST",
                        headers: {
                        'Content-Type' : 'application/json'
                        },
                        body: JSON.stringify({stockCode: response.data[i].stockCode, investmentStrategy: null})}).then((result)=>{
                        result.json().then((res)=>{
                            let tempStocks = [...response.data]
                            tempStocks[i].returnPlot = res.result.returnPlot
                            tempStocks[i].returnsInfo = res.result.returnsInfo
                            setStocks(tempStocks)
                        })
                    })
                }
                fetch("http://127.0.0.1:5000/stockAdvise", {
                    method: "POST",
                    headers: {
                    'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({stockCode: null, investmentStrategy: null})}).then((result)=>{
                    result.json().then((res)=>{
                        setAllStocks(res.result)
                    })
                })
            })

        }
        
    }, [])

    const trackStock = (e)=>{
        e.preventDefault()
        for (let i = 0; i < stocks.length; i++) {
            if(newStock == stocks[i].stockCode){
                alert("Already tracking stock")
                return null
            }
        }
        if(allStocks.includes(newStock)){
            Axios.post("http://localhost:3001/trackStock", {stockCode: newStock, userId: user.userId}).then((response)=>{
                fetch("http://127.0.0.1:5000/stockAdvise", {
                    method: "POST",
                    headers: {
                    'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify({stockCode: newStock, investmentStrategy: null})}).then((result)=>{
                    result.json().then((res)=>{
                        setStocks([...stocks, {stockCode: newStock, returnPlot: res.result.returnPlot, returnsInfo: res.result.returnsInfo}])
                    })
                })
            })
        }
        else{
            alert("Please enter a valid stock code")
        } 
    }

    const stopTracking = (stockCode, index)=>{
        Axios.post("http://localhost:3001/stopTracking", {stockCode: stockCode, userId: user.userId}).then((response)=>{
            let tempStocks = [...stocks]
            tempStocks.splice(index, 1)
            setStocks(tempStocks)
        })
    }

    return(
        <>
            <h1>Stock Tracker</h1>
            {user ? 
                <div>
                    <form onSubmit={trackStock}>
                        <input type="text" onChange={(e)=>{setNewStock(e.target.value)}} required className='normalInput' placeholder = "Enter the stock code of the stock you want to track"/>
                        <button className='normalButton' type='submit'>Track</button>  
                    </form>
                    <h3>Stocks you're currently tracking: </h3>
                    {stocks.length > 0 ? stocks.map((val, index)=>{
                        return(
                            <div id='stocksTracking'>
                                {/* <div>{val.returnPlot}</div> */}
                                <div>
                                    <h2>{val.stockCode}</h2>
                                    <p>Mean: {val.returnsInfo && val.returnsInfo[0]}</p>
                                    <br/>
                                    <p>StDev:</p>
                                    <p>{val.returnsInfo && val.returnsInfo[1]}</p>
                                </div>
                                <button className='normalButton' onClick={()=>{stopTracking(val.stockCode, index)}}>x</button>
                            </div>

                        )
                    }) : <p className='inform'>No stocks currently tracking</p>}
                </div>
            :
            <p className='inform'>Please sign up or login  to track and view stocks</p>}
        </>
    )
}

export default StockTracker;