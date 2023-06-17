require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const { convertGetGroupsToJSON, convertTicketToJSON, convertInvalidateTicketToJSON } = require("./utils");

const contractABI = require('../ticket-manager-abi.json')
const contractAddress = "0x476655618ce54d2e3cafb09216c32788465b2a50";

export const ticketContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);

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

    const transactionParameters = {
        to: contractAddress,
        from: address,
        data: ticketContract.methods.createTickets(data.nomeEvento, data.limit, data.valorIngresso, data.quantidadeIngressos).encodeABI(),
    };

    return await signMessage(transactionParameters);
};

export const loadBuyTicket = async (address, data, value) => {
    value = web3.utils.toHex(value);
    console.log(value);
    const transactionParameters = {
        to: contractAddress,
        from: address,
        data: ticketContract.methods.buyTicket(data.idEvento, data.proprietario, data.sale).encodeABI(),
        value: value
    };

    return await signMessage(transactionParameters);
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
                    status: "👆🏽 Write a message in the text-field above.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
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

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "👆🏽 Write a message in the text-field above.",
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