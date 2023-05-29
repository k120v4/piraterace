import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import lostpic from './2.jpg';

const contractABI = require("./Island.json");
const YOUR_CONTRACT_ADDRESS = "0x6f1b3eB120dd6dE6ADdFd54dd47AB62e3f3C3812";

export default function App() {
  const [acct, setAcct] = useState('');
  const [query, setQuery] = useState('');
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [metaMaskEnabled, setMetaMaskEnabled] = useState(false);

  let getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(
      YOUR_CONTRACT_ADDRESS,
      contractABI.abi,
      signer
    );
    return contract;
  };

  //functions for the buttons
  let enterTheCode = async () => {
    console.log(query)
    if (query == 4815162342) {
      console.log('correct');
      await getContract().enterTheCode({gasLimit: 50000});
    }
    else {
      console.log('incorrect');

    }

  };
  
  let fetchCurrentValue = async () => {
    let c = await getContract().countdown();
    
    const datenow = +new Date()/1000
    //console.log(+c - datenow)

    //const date = new Date(+c * 1000);
    //const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //const year = date.getFullYear();
    //const month = months[date.getMonth()];
    //const dt = date.getDate();
    //const hours = date.getHours();
    //const minutes = "0" + date.getMinutes();
    //const seconds = "0" + date.getSeconds();
    //const formattedTime = `${year}-${month}-${dt} ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;

    //console.log(formattedTime);
    //setCountdown(formattedTime.toString())

    const diff = new Date((+c - datenow) * 1000).toISOString().slice(11, 19);
    setCountdown(diff.toString())

    setLoading(false);
  };

  const checkedWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        setMetaMaskEnabled(false);
        return;
      }

      await ethereum.enable();
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(137).toString(16)}` }],
      });
      console.log("Connected", accounts[0]);
      localStorage.setItem("walletAddress", accounts[0]);
      setAcct(accounts[0]);
      setMetaMaskEnabled(true);

      // Listen to event
      listenToEvent();

      fetchCurrentValue();
    } catch (error) {
      console.log(error);
      setMetaMaskEnabled(false);
    }
  };

  useEffect(() => {
    checkedWallet();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        checkedWallet();
      });
    }
  }, []);

  //event listener to update the log
  let listenToEvent = async () => {
    getContract().on("SystemFailure", async (amountToSend) => {
      console.log('System Failure')
    });

    getContract().on("CodeEntered", async () => {
      console.log('Code Entered')
      fetchCurrentValue(); 
    });
  };

  return (
    <div class="root">
      {!metaMaskEnabled && <h1>Connect to Metamask</h1>}
      
      {metaMaskEnabled && (
        <div>
          {!loading && (
            <div>
              <p class="blank"> ..</p>
              <h1 class="title">{countdown} </h1>
              <h3 class="text"> Every 1080 minutes, the button must be pushed. From the moment the alarm sounds, you will have four minutes to enter the code into the microcomputer processor.

Either you or your partners must input the code. It is highly recommended that you and your partners take alternating shifts. In this manner you will all stay fresh and alert.

Congratulations! Until your replacements arrive, the future of the project is in your hands. On behalf of the Degroots, Alvar Hanso and all of us at the Dharma Initiative, thank you. Namaste. And good luck.</h3>

              
              
              <label class="descrip" >
                Type in the numbers (no spaces or commas): 
                <input value={query} onChange={(e)=>setQuery(e.target.value)} type="text"></input>
              </label>
              <button onClick={enterTheCode} class="button">
                EXECUTE
              </button>

              <p class="descrip">===============================================================================</p>
              <p></p>

              <h3 class="faqtitle"> FAQ </h3>
              <p class="faqb"> What is this? </p>
              <p class="faq"> $LOST is a memecoin based on the TV Show Lost. No presale, no tax, LP locked, no owner, no fuss. </p>
              <p class="faqb"> What are the numbers? </p>
              <p class="faq"> 4 8 15 16 23 42</p>
              <p class="faqb"> What happens if the timer runs out? </p>
              <p class="faq"> System Failure. Occupants of the Swan station followed a protocol in which they typed a sequence into a computer every 
              1080 minutes. Typing these numbers and pressing "execute" (a.k.a. pushing the button) on the keyboard
              averts worldwide catastrophe. Worldwide catastrophe in our case means number go down. The Island holds 50% of the tokens 
              and will flood the LP with 10% of its tokens on each System Failure.</p>
              <p class="faqb"> Tokenomics? </p>
              <p class="faq"> 1,000,000,000,000 token supply, 10% CEX/marketing, 45% LP, 45% island (basically burnt if everyone keeps pressing the button!)</p>
              <p class="faqb"> Contracts? </p>
              <p class="faq"> <a href="http://">Token</a>, <a href="http://">Island</a>, <a href="http://">Marketing wallet </a></p>
             
              <p class="descrip">===============================================================================</p>
              <img src={lostpic} width="30%"/>
              
             

              

            </div>
          )}
          {loading && <div class="loader"></div>}
        </div>
      )}
    </div>
  );
}
