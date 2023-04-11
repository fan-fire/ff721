let web3; // Web3 instance
let account; // Your account as will be reported by Metamask
let logList; // This is an <ul> element where we will print out all the info
let contract;
let bytecode;
let contractJSONs = {
  "FF721v1": "legacy/FF721.json",
  "FF721v2": "artifacts/contracts/FF721.sol/FF721.json",
}
let contractJSON;

let btnConnect;
let inputContractAddress;
let btnConnectContract;
let btnDeployContract;

let contractSelectionDropdownFF721v1;
let contractSelectionDropdownFF721v2;
let btnContractSelectionDropdown;

let btnContractConnectionSelection;
let contractConnectionSelectionDeploy;
let contractConnectionSelectionConnect;


window.addEventListener("load", () => {
  // Shortcut to interact with HTML elements
  logList = document.querySelector(".info");
  btnConnect = document.querySelector("#btnConnect");

  btnConnectContract = document.querySelector("#btnConnectContract");
  btnDeployContract = document.querySelector("#btnDeployContract");
  inputContractAddress = document.querySelector("#inputContractAddress");

  contractSelectionDropdownFF721v1 = document.querySelector("#contractSelectionDropdownFF721v1");
  contractSelectionDropdownFF721v2 = document.querySelector("#contractSelectionDropdownFF721v2");
  btnContractSelectionDropdown = document.querySelector("#btnContractSelectionDropdown");

  contractConnectionSelectionDeploy = document.querySelector("#contractConnectionSelectionDeploy");
  contractConnectionSelectionConnect = document.querySelector("#contractConnectionSelectionConnect");
  btnContractConnectionSelection = document.querySelector("#btnContractConnectionSelection");

  btnConnectContract.addEventListener("click", async () => {
    printResult("Connecting to contract...");
    await connectContract(contractJSON, inputContractAddress.value);
    printResult(`Connected to contract: <code>${readableAddress(inputContractAddress.value)}</code>`);
    await renderContract();

  });

  contractConnectionSelectionDeploy.addEventListener("click", async () => {
    printResult("Selected to deploy...");
    btnContractConnectionSelection.innerHTML = "Deploy";
    btnDeployContract.style.visibility = "visible";
    btnConnectContract.style.visibility = "hidden";
    
  });

  contractConnectionSelectionConnect.addEventListener("click", async () => {
    printResult("Selected to connect...");
    btnContractConnectionSelection.innerHTML = "Connect";
    btnDeployContract.style.visibility = "hidden";
    btnConnectContract.style.visibility = "visible";
  });


  contractSelectionDropdownFF721v1.addEventListener("click", async () => {
    printResult("Using to FF721v1...");
    btnContractSelectionDropdown.innerHTML = "FF721v1";
    contractJSON = contractJSONs["FF721v1"];
  });

  contractSelectionDropdownFF721v2.addEventListener("click", async () => {
    printResult("Using to FF721v2...");
    btnContractSelectionDropdown.innerHTML = "FF721v2";
    contractJSON = contractJSONs["FF721v2"];
  });
  

  // Check whether ethereum is defined, ie. MetaMask plugin is active
  btnConnect.addEventListener("click", async () => {
    printResult("Connecting to MetaMask...");
    web3 = new Web3(window.ethereum);
    
    await ethereum.enable();
    await connectWallet();
  });

  btnDeployContract.addEventListener("click", async () => {
    printResult("Deploying contract...");
    await loadContract(contractJSON);

    let deployed = await contract.deploy({data: bytecode}).send({from: account, 
      gas: 5000000, 
    })
    
    printResult(`Deployed contract: <code>${readableAddress(deployed.options.address)}</code>`);
    inputContractAddress.value = deployed.options.address;

    await connectContract(contractJSON, inputContractAddress.value);

    await renderContract();

  })

});

const blockchainCall = async (funcName) => {
  console.log("blockchainCall");

  let abi = (await getJson(contractJSON)).abi;
  let func = abi.filter((item) => item.type === "function" && item.name === funcName)[0];
  console.log(func.name);

  let inputs = func.inputs.map((input) => {
    let id = `${func.name}_${input.name}`;
    return document.querySelector(`#${id}`).value;
  });
  
  console.log({inputs});

  let callMethod;

  if(func.stateMutability === "view" || func.stateMutability === "pure") {
    console.log("view");
    callMethod = callTransaction(contract, func.name, inputs);
  } else {
    console.log("transaction");
    console.log(func.name);
    callMethod = sendTransaction(contract, func.name, inputs);
  }

  await callMethod;
}

// function that creates boostrap form from ABI
const createInputUIFromABI = (abi) => {
  let html = "";
  let functions = abi.filter((item) => item.type === "function");

  functions.forEach((func) => {
    console.log(func.name);

    let inputIds = [];
    let inputs = func.inputs.map((input) => {
      let id = `${func.name}_${input.name}`;
      inputIds.push(id);
      return `
      <div class="row m-1">
      <input type="text" class="form-control my-2" id="${func.name}_${input.name}" placeholder="${input.name}">
      </div>
      `;
    });

    console.log({inputIds});
    console.log(func.stateMutability);
    
    html += `
    <div class="row m-2 border">
      <div class="form-group">
        ${inputs.join("")}
        <div class="row m-1">
          <button type="button" class="btn btn-outline-info my-2" id="btn${func.name}" onclick="blockchainCall('${func.name}')">${func.name}</button>
        </div>
      </div>
    </div>
    `;
  });

  return html;
}



/*** Functions ***/

// Helper function to print results
const printResult = (text) => {
  logList.innerHTML += `<li>${text}</li>`;
};

// Helper function to display readable address
const readableAddress = (address) => {
  return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
};

// Helper function to get JSON (in order to read ABI in our case)
const getJson = async (path) => {
  const response = await fetch(path);
  const data = await response.json();
  return data;
};

// Connect to the MetaMast wallet
const connectWallet = async () => {
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  account = accounts[0];
  btnConnect.innerHTML = `Connected to ${readableAddress(account)}`;
  printResult(`Connected account: <code>${readableAddress(account)}</code>`);
};

const loadContract = async (abiPath) => {
  const data = await getJson(abiPath);
  const abi = data.abi;
  bytecode = data.bytecode;
  console.log(abi);
  contract = new web3.eth.Contract(abi);
};

const connectContract = async (abiPath, address) => {
  const data = await getJson(abiPath);
  const abi = data.abi;
  console.log(abi);
  contract = new web3.eth.Contract(abi, address);
};


// generic function to execute a transaction with list of args
const sendTransaction = async (contract, method, args) => {
  let txHash;
  try {
    txHash = await contract.methods[method](...args).send({ from: account });
    return txHash;

  } catch (error) {
    try {
      let json = error.message.split("Transaction has been reverted by the EVM:")[1]
      let info = JSON.parse(json);
      if (info) {
        let revertReason = await getRevertReason(info.transactionHash);
        printResult(`<p class="text-danger">Reverted with: ${revertReason}</p>`);
      } else {
        printResult(`Error: ${error.message}`);
      }
    } catch (e) {
      printResult(`Error: ${error.message}`);
      throw 3;
    }


  }
}

const callTransaction = async (contract, method, args) => {
  try {
    printResult(`Calling contract method: ${method}(${args})`);
    const result = await contract.methods[method](...args).call();
    printResult(`Result: <code>${result}</code>`);
    return result;
  } catch (error) {
    printResult(`Error: ${error.message}`);
  }
}

async function getRevertReason(txHash) {

  const tx = await web3.eth.getTransaction(txHash)
  try {
    await web3.eth.call(tx, tx.blockNumber)

  } catch (error) {
    const revertMessageJSON = error.message.split("Internal JSON-RPC error.")[1]
    const revertMessage = JSON.parse(revertMessageJSON)

    return revertMessage.message

  }

}
const renderContract = async () => {

  document.querySelector("#contractType").innerHTML = "FF721";
  document.querySelector("#contractAddress").innerHTML = readableAddress(inputContractAddress.value);
  document.querySelector("#contractName").innerHTML = await callTransaction(contract, "name", []);
  document.querySelector("#contractSymbol").innerHTML = await callTransaction(contract, "symbol", []);

  document.querySelector("#contractUI").innerHTML = createInputUIFromABI((await getJson(contractJSON)).abi);
}