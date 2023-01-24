import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import "./style.css";
import InputField from './inputfield';
import ship from './ship.webp';

const contractABI = require("./PirateRace.json");
const YOUR_CONTRACT_ADDRESS = "0x7fdb855296a72f43be5154d813fbe5cd0ee736e6";

export default function App() {
  const nameForm = useRef(null);
  const [t0, setT0] = useState(0);
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);
  const [t3, setT3] = useState(0);
  const [userScore, setuserScore] = useState(0);
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

  let joinTeam = async () => { //need text input
    const form = nameForm.current
    const tx = await getContract().join(form['team'].value);
  };

  let upgradeEngine = async () => {
    const tx = await getContract().upgradeEngine();
  };

  let upgradeAttack = async () => {
    const tx = await getContract().upgradeAttack();
  };

  let upgradeDefense = async () => {
    const tx = await getContract().upgradeDefense();
  };

  let fireCannon = async () => {
    const form = nameForm.current;
    const tx = await getContract().fireCannon(form['target'].value);
  };

  let buyMysteryBox = async () => {
    const tx = await getContract().buyMysteryBox();
  };

  let updateDistance = async () => {
    const tx = await getContract().updateDistance();
  };

  let getUserScore = async () => {
    let score = await getContract().userScore(1);
    setuserScore(score);
  }

  let putInJail = async () => {
    const form = nameForm.current;
    const tx = await getContract().fireCannon(form['address'].value);
  };

  let outOfJail = async () => {
    const form = nameForm.current;
    const tx = await getContract().fireCannon(form['address'].value);
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
              <img src={ship} width="50%"/> 
              <h1 class="text"> The Great Pirate Race </h1>
              <h2 class="title"> Standings </h2>
              <h3 class="text">team0: {t0}</h3>
              <h3 class="text">team1: {t1}</h3>
              <h3 class="text">team2: {t2}</h3>
              <h3 class="text">team3: {t3}</h3>
              <h2 class="title"> Captain's Ship Log </h2>
              <div class="log">{renderList} </div>

              <h2 class ="title"> User Actions </h2>
              <button disabled={userScore > 0} onClick={joinTeam} class="button">
                Join a Team
              </button>
              <form class="descrip" ref={nameForm} >
              <InputField label={'Teams: (0-3)    '} name={'team'}/>
              </form>
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
              <form class="descrip" ref={nameForm}>
              <InputField label={'target: (0-3) '} name={'target'}/>
              </form>
              
              <button onClick={buyMysteryBox} class="button">
                Buy Mystery Box
              </button>
              


              <p class="descrip"> ---------------------------------------- </p>
              <h3> Captain & First Mate Actions </h3>
              <button onClick={putInJail} class="button">
                Put in jail
              </button>
              <button onClick={outOfJail} class="button">
                Free from jail
              </button>
             
              {//this breaks the above buttons for some reason 
            }
              <form class="descrip" ref={nameForm}> 
              <InputField label={'address: '} name={'address'}/>
              </form>


            </div>
          )}
          {loading && <div class="loader"></div>}
        </div>
      )}
    </div>
  );
}
