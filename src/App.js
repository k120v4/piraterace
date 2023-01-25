import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import ship from './ship.webp';

const contractABI = require("./PirateRace.json");
const YOUR_CONTRACT_ADDRESS = "0x7fdb855296a72f43be5154d813fbe5cd0ee736e6";

export default function App() {
  const [acct, setAcct] = useState('');
  const [query, setQuery] = useState('');
  const [query2, setQuery2] = useState('');
  const [query3, setQuery3] = useState('');
  const [t0, setT0] = useState(0);
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);
  const [t3, setT3] = useState(0);
  const [t0m, setT0m] = useState(0);
  const [t1m, setT1m] = useState(0);
  const [t2m, setT2m] = useState(0);
  const [t3m, setT3m] = useState(0);
  const [Eventlist, setEventlist] = useState([
    "--------------------------------", 
    "Avast Ye Hearties!", 
    "--",
    "Treasure has been spotted over yonder", 
    "Will you be the first one to reach the loot?", 
    "Or will your ship be sunk?", 
    "There is only one way to find out!", 
    "Come one, come all", 
    "and join the Great Pirate Race", 
    "--------------------------------"
    ]);
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
  let joinTeam = async () => { 
    const tx = await getContract().join(query3);
  };

  let upgradeEngine = async () => {
    await getContract().upgradeEngine({gasLimit: 150000});
  };

  let upgradeAttack = async () => {
    await getContract().upgradeAttack({gasLimit: 150000});
  };

  let upgradeDefense = async () => {
    const tx = await getContract().upgradeDefense({gasLimit: 150000});
  };

  let fireCannon = async () => {
    const tx = await getContract().fireCannon(query, {gasLimit: 150000});
  };

  let buyMysteryBox = async () => {
    const tx = await getContract().buyMysteryBox({gasLimit: 150000});
  };

  let updateDistance = async () => {
    const tx = await getContract().updateDistance();
  };

  let putInJail = async () => {
    const tx = await getContract().putInJail(query2);
  };

  let outOfJail = async () => {
    const tx = await getContract().takeOutOfJail(query2);
  };

  let fetchCurrentValue = async () => {
    let count_ = await getContract().teams(0);
    setT0(count_.distance.toString());
    count_ = await getContract().teams(1);
    setT1(count_.distance.toString());
    count_ = await getContract().teams(2);
    setT2(count_.distance.toString());
    count_ = await getContract().teams(3);
    setT3(count_.distance.toString());
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
    getContract().on("DistanceUpdated", async (t0, t1, t2, t3, event) => {
      console.log('distance updated')
      setT0(+t0.toString());
      setT1(+t1.toString());
      setT2(+t2.toString());
      setT3(+t3.toString());
    });

    getContract().on("EngineUpgraded", async (sender, teamName, event) => {
      updateString(sender.toString().substring(0,6) + "... upgraded the engine for " + teamName);
    });

    getContract().on("DefenseUpgraded", async (sender, teamName, event) => {
      updateString(sender.toString().substring(0,6) + "... upgraded the defense for " + teamName);
    });

    getContract().on("AttackUpgraded", async (sender, teamName, event) => {
      updateString(sender.toString().substring(0,6) + "... upgraded the attack for " + teamName);
    });

    getContract().on("TeamJoin", async (sender, teamName, money, event) => {
      updateString(sender.toString().substring(0,6) + "... joined " + teamName + " with " + money.toString() + " munny.");
    });

    getContract().on("CannonFired", async (sender, shooter, target, hit, event) => {
      if (hit) {
        updateString(sender.toString().substring(0,6) + "... of " + shooter + " fired the cannon at " + target + " and hit!");
      } else {
        updateString(sender.toString().substring(0,6) + "... of " + shooter + " fired the cannon at " + target + " and missed!"); 
      }
    });

    getContract().on("InJail", async (sender, teamName, event) => {
      updateString(sender.toString().substring(0,6) + "... of " + teamName + " has been put in jail.");
    });    

    getContract().on("OutofJail", async (sender, teamName, event) => {
      updateString(sender.toString().substring(0,6) + "... of " + teamName + " has been freed from jail.");
    });    

    getContract().on("MysteryBox", async (sender, teamName, result, event) => {
      if (result == 0) {
        updateString(sender.toString().substring(0,6) + "... of " + teamName + " bought a mystery box and nothing happened.");
      }
      else if (result == 1) {
        updateString(sender.toString().substring(0,6) + "... of " + teamName + " bought a mystery box and got munny!");
      }
      else if (result == 2) {
        updateString(sender.toString().substring(0,6) + "... of " + teamName + " bought a mystery box and got double ship upgrades!");
      }
      else if (result == 3) {
        updateString(sender.toString().substring(0,6) + "... of " + teamName + " bought a mystery box and unleashed the kraken!");
      }
    });  

    getContract().on("FirstMate", async (teamName, user, event) => {
      updateString(user.toString().substring(0,6) + "... of " + teamName + " has been promoted to first mate! double rations!");
    });   

  };

  //event log string
  const updateString = (newItem) => {
    setEventlist((prevList) => {
        const updatedList = [newItem, ...prevList.slice(0,-1)];
        return updatedList;
    });
  };

  let renderList = Eventlist.map((item, index) => 
    <p class="text" key={index}>{item}</p>
  );

  return (
    <div class="root">
      {!metaMaskEnabled && <h1>Connect to Metamask</h1>}
      
      {metaMaskEnabled && (
        <div>
          {!loading && (
            <div>
              <img src={ship} width="50%" alt="pirates!"/> 
              <h1 class="text"> The Great Pirate Race </h1>
              <h2 class="title"> Standings </h2>
              <h3 class="text">Team Ben: {t0} meters</h3>
              <h3 class="text">Team Kila: {t1} meters</h3>
              <h3 class="text">Team Nacho: {t2} meters</h3>
              <h3 class="text">Team ??: {t3} meters</h3>
              <h2 class="title"> Captain's Ship Log </h2>
              <div class="log">{renderList} </div>

              <h2 class ="title"> User Actions </h2>
              
              <button onClick={joinTeam} class="button">
                Join a Team
              </button>
              <label class="descrip" >
                Teams (0-3): 
                <input class="descrip" value={query3} onChange={(e)=>setQuery3(e.target.value)} type="text"></input>
              </label>
              <button onClick={updateDistance} class="button">
                Update Standings
              </button>
              
              <button onClick={upgradeEngine} class="button">
                Upgrade Engine
              </button>
              
              <button onClick={upgradeAttack} class="button">
                Upgrade Attack
              </button>
              
              <button onClick={upgradeDefense} class="button">
                Upgrade Defense
              </button>
              
              <button onClick={fireCannon} class="button">
                Fire Cannon
              </button>
              <label class="descrip" >
                Target (0-3): 
              <input class="descrip" value={query} onChange={(e)=>setQuery(e.target.value)} type="text"></input>
              </label>

              <button onClick={buyMysteryBox} class="button">
                Buy Mystery Box
              </button>
              


              <p class="descrip"> ---------------------------------------- </p>
              <h3 class="text"> Captain & First Mate Actions </h3>
              <button onClick={putInJail} class="button">
                Put in jail
              </button>
              
              <button onClick={outOfJail} class="button">
                Free from jail
              </button>
              <label class="descrip" >
                Address: 
                <input class="descrip" value={query2} onChange={(e)=>setQuery2(e.target.value)} type="text"></input>
              </label>

              <p></p>

            </div>
          )}
          {loading && <div class="loader"></div>}
        </div>
      )}
    </div>
  );
}
