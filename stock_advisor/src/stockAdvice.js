import {useEffect, useState} from 'react'; 
import dropdownImage from "./dropdown.png"

function StockAdvice(){
    const [investmentStrategy, setInvestmentStrategy] = useState()
    const [investmentBudget, setInvestmentBudget] = useState()
    const [stockCodes, setStockCodes] = useState([""])
    const [dropdownClassname, setDropdownClassname] = useState("displayNone")
    const [advice, setAdvice] = useState()
    const [available, setAvailable] = useState(true)
    const [allStocks, setAllStocks] = useState()

    useEffect(()=>{
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
    }, [])

    const getInvestmentAdvise = async (e)=>{
        e.preventDefault()
        if(available){
            setAvailable(false)

            // check if user input is a valid stock
            for (let i = 0; i < stockCodes.length; i++) {
                if(!allStocks.includes(stockCodes[i])){
                    setAvailable(true)
                    alert("The stock " + stockCodes[i] + " is invalid")
                    return
                }
            }

            // get stock advice from backend
            fetch("http://127.0.0.1:5000/stockAdvise", {
                method: "POST",
                headers: {
                'Content-Type' : 'application/json'
                },
                body: JSON.stringify({stockCodes: stockCodes, investmentBudget: investmentBudget, investmentStrategy: investmentStrategy})
            }).then((result)=>{
                result.json().then((res)=>{
                    let temp_advice =  ""
                    for (const key in res.result.assets) {
                        temp_advice += "You should spend $" + res.result.assets[key].dollar_amount + " (" + res.result.assets[key].percentage_of_portfolio + "% of portfolio) on " + key + ". "
                    }
                    setAdvice(temp_advice)
                    setAvailable(true)
                })
            })
        }
    }

    // toggle dropdown when dropdown clicked
    const toggleDropdown = ()=>{
        if(dropdownClassname == "displayNone"){
            setDropdownClassname('options')
        }
        else{
            setDropdownClassname("displayNone")
        }

    } 

    const getInvestmentStrategy = (e)=>{
        setInvestmentStrategy(e)
        toggleDropdown()
    }

    // insert stock code into the proper index in the stockCodes array
    const getStockCode = (e, index)=>{
        let tempstockCodes = [...stockCodes]
        tempstockCodes[index] = e.target.value
        setStockCodes(tempstockCodes)
    }

    // add a new item to stockCodes array
    const addStockCode = (e)=>{
        let tempstockCodes = [...stockCodes]
        tempstockCodes.push("")
        setStockCodes(tempstockCodes)
    }

    // remove item at the index in stockCodes
    const removeStockCode = (index)=>{
        if(stockCodes.length > 1){
            let tempstockCodes = [...stockCodes]
            tempstockCodes.splice(index, 1);
            setStockCodes(tempstockCodes)
        }
    }

    return(
        <>  
            {/* Shows the form the user can fill out to get advice on what to invest in */}
            <h1>Stock Advisor</h1>
            <p>{!available ? "Loading..." : advice}</p>
            <form className='flexCol' onSubmit={getInvestmentAdvise}>
                {stockCodes.length > 0 && stockCodes.map((val, index)=>{
                        return(
                            <div className='flexx'>
                                <button type='button' className='normalButton' onClick={()=>{removeStockCode(index)}}>-</button>
                                <input type="text" required className='normalInput'onChange={(e)=>{getStockCode(e, index)}} placeholder = "Enter a stock code" value={stockCodes[index]}/>
                                <button type='button' className='normalButton' onClick={addStockCode}>+</button>
                            </div>
                        )
                })}

                <input type="number" required className='normalInput' onChange={(e)=>{setInvestmentBudget(e.target.value)}} placeholder = "What is your investment budget in dollars?" 
                value={investmentBudget}/>

                <div className='dropdown'>
                    <p className='placeholder' onClick={toggleDropdown}>{investmentStrategy || "What is your desired investing strategy?"} <img src={dropdownImage} 
                    className="dropdownImg"/></p>
                    <div className={dropdownClassname}>
                        <div className='option' onClick={()=>{getInvestmentStrategy("Momentum investing" )}}>Momentum investing</div>
                        <div className='option' onClick={()=>{getInvestmentStrategy("Sentiment analysis")}}>Sentiment analysis</div>
                        <div className='option' onClick={()=>{getInvestmentStrategy("Risk allocation")}}>Risk allocation</div>
                    </div>
                    <button type='submit' className='normalButton'>Analyze</button>
                </div>
            </form>
        </>
    )
}

export default StockAdvice;