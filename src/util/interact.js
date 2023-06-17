require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const { convertGetGroupsToJSON, convertTicketToJSON, convertInvalidateTicketToJSON } = require("./utils");

const contractABI = require('../contract-abi.json')
const contractAddress = "0x2cc10f74525bee56f46bb87c5cbe6bc4e01f396e";

export const ticketContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);

export function etherToWei(ether) {
    return web3.utils.toWei(ether.toString(), 'ether');
}

export function weiToEther(wei) {
    return web3.utils.fromWei(wei.toString(), 'ether');
}

export const loadGetGroupTickets = async () => {
    const message = await ticketContract.methods.getGroupTickets().call();
    return convertGetGroupsToJSON(message);
};

export const loadFilterTicketsByOwner = async (eventId, owner, transferable, sale) => {
    console.log(eventId, owner, transferable, sale);
    const message = await ticketContract.methods.filterTicketsByOwner(eventId, owner, transferable, sale).call();
    console.log(message);
    return convertTicketToJSON(message);
};

export const signTicket = async (ticketId, address) => {
    if (typeof window.ethereum !== 'undefined') {
        const message = `ticketId=${ticketId}`;
        const hashedMessage = web3.utils.sha3(message);
        console.log("hashedMessage", hashedMessage);

        const assinatura = await window.ethereum.request({
            method: 'personal_sign',
            params: [hashedMessage, address],
            from: address
        });

        const r = assinatura.slice(0, 66);
        const s = "0x" + assinatura.slice(66, 130);
        const v = parseInt(assinatura.slice(130, 132), 16);
        console.log("r", r);
        console.log("s", s);
        console.log("v", v);

        return { hashedMessage, r, s, v };
    } else {
        console.error('MetaMask não detectado');
    }
}

export const loadCreateTicket = async (address, data) => {
    const valorWei = etherToWei(data.valorIngresso);

    const transactionParameters = {
        to: contractAddress,
        from: address,
        data: ticketContract.methods.createTickets(data.nomeEvento, data.limit, valorWei, data.quantidadeIngressos).encodeABI(),
    };

    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return txHash
    } catch (error) {
        return ""
    }
};

export const loadBuyTicket = async (address, data, value) => {
    const valueWei = etherToWei(value);
    const valueFinal = web3.utils.toHex(valueWei);
    console.log(valueFinal);
    const transactionParameters = {
        to: contractAddress,
        from: address,
        data: ticketContract.methods.buyTicket(data.idEvento, data.proprietario, data.sale).encodeABI(),
        value: valueFinal
    };

    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return txHash
    } catch (error) {
        return ""
    }
};

export const loadVerifyTicket = async (ticketId, walletAddress, hashedMessage, r, s, v) => {
    const transactionParameters = {
        to: contractAddress,
        from: walletAddress,
        data: ticketContract.methods.verifyTicket(ticketId, hashedMessage, walletAddress, v, r, s).encodeABI()
    };
    return await signMessage(transactionParameters);
};

const signMessage = async (transactionParameters) => {
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return {
            status: (
                <span>
                    ✅{" "}
                    <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`}>
                        View the status of your transaction on Etherscan!
                    </a>
                    <br />
                    ℹ️ Once the transaction is verified by the network, the message will
                    be updated automatically.
                </span>
            ),
        };
    } catch (error) {
        return {
            status: "😥 " + error.message,
        };
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                };
            } else {
                return {
                    address: "",
                };
            }
        } catch (err) {
            return {
                address: "",
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                address: addressArray[0],
            };
            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

export async function checkTransactionConfirmation(transactionHash) {
    try {
      while (true) {
        const transaction = await web3.eth.getTransaction(transactionHash);
        if (transaction && transaction.blockNumber !== null) {
          console.log(`A transação ${transactionHash} foi confirmada.`);
          return "Transação confirmada.";
        }
        await delay(2000);
      }
    } catch (error) {
      return `Ocorreu um erro ao verificar a transação:', ${error}`
    }
  }
  
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }