import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import lostpic from './2.jpg';
import computer from './computer.png';

const contractABI = require("./Island.json");
const YOUR_CONTRACT_ADDRESS = "0x6f1b3eB120dd6dE6ADdFd54dd47AB62e3f3C3812";

export default function App() {
  const [acct, setAcct] = useState('');
  const [query, setQuery] = useState('');
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [metaMaskEnabled, setMetaMaskEnabled] = useState(false);
  const [systemFailure, setSystemFailure] = useState(false);

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
    if (query == '4 8 15 16 23 42') {
      console.log('correct');
      await getContract().enterTheCode({gasLimit: 30000});
    }
    else {
      console.log('incorrect');
    }
  };
  
  let fetchCurrentValue = async () => {
    let c = await getContract().countdown();
    
    const datenow = +new Date()/1000

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
        params: [{ chainId: `0x${Number(1).toString(16)}` }],
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
      setSystemFailure(true);
    });

    getContract().on("CodeEntered", async () => {
      console.log('Code Entered')
      setSystemFailure(false);
      fetchCurrentValue(); 
    });
  };

  return (
    <div class="root">
      <p class="blank"> ..</p>
      {!systemFailure && <h1 class="title">{countdown} </h1>}
      {systemFailure && <h1 class="redtitle">XX:XX:XX </h1>}
      <img src={computer} width="50%"/>
      <p></p>
      {metaMaskEnabled && (
        <div>
          <label class="descrip" >
            >: Connected to {acct} 
            <p></p>
            >: Type in the numbers with spaces: &nbsp;
          <input value={query} onChange={(e)=>setQuery(e.target.value)} type="text"></input>
          </label>
          <button onClick={enterTheCode} class="button">
            EXECUTE
          </button>
        </div>
        )}
        {!metaMaskEnabled && (
          <div>
            <button onClick={checkedWallet} class="button">
              CONNECT
            </button>
          </div>
          )}
      <p></p>

      <h3 class="faqtitle"> FAQ </h3>
      <p class="faqb"> What is this? </p>
      <p class="faq"> $LOST is a memecoin inspired by the TV series Lost. No presale, no tax, LP locked, no owner, no whitelist, no fuss. 
      Every 1080 minutes (18hrs), the button must be pushed. It is highly recommended that you and your partners take alternating shifts. 
      In this manner you will all stay fresh and alert.</p>

      <p class="faqb"> What are the numbers? </p>
      <p class="faq"> 4 8 15 16 23 42</p>
     
      <p class="faqb"> What happens if the timer runs out? </p>
      <p class="faq"> A catastrophic System Failure event aka number go down. The Island holds tokens 
      and will flood the LP with 10% of tokens on each System Failure. The countdown will then be automatically reset.</p>
     
      <p class="faqb"> Tokenomics? </p>
      <p class="faq"> 1,000,000,000,000 token supply, 10% CEX/marketing, 45% LP, 45% island 
      (effectively burnt if everyone keeps pressing the button! The island's tokens cannot be moved otherwise.)</p>
     
      <p class="faqb"> Contracts and Addresses </p>
     
      <p class="faq"> Mainnet: <a href="https://etherscan.io/token/0x95a45e4c3a8ac8a65c89c114ed3c9f3114da3931"> Token</a>,&nbsp;
                              <a href="http://">Island</a>,&nbsp;
                              <a href="https://etherscan.io/address/0x416fe07819a6d937eb019003496a8cc91175f119">Marketing wallet </a></p>
     
      <p class="faqb"> Links </p>
      <p class="faq"> <a href="https://twitter.com/lostcoin_eth"> Twitter</a>,&nbsp;
                      <a href="https://discord.gg/qvbznY5u">Discord</a>,&nbsp;
                      <a href="http://">Dextools</a>,&nbsp;
                      <a href="http://">CMC</a>,&nbsp;
                      <a href="http://">Uniswap</a> </p>
     
      <p class="faqb"> Any last words? </p>
            
      <p class="faq"> Congratulations! Until your replacements arrive, the future of the project is in your hands. 
                    On behalf of the Degroots, Alvar Hanso and all of us at the Dharma Initiative, thank you. Namaste. And good luck. </p>
                      
     

      <p class="blank"> ..</p>           
    </div>
  );
}
