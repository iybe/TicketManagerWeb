import React from "react";
import { useEffect, useState } from "react";
import {
  helloWorldContract,
  connectWallet,
  updateMessage,
  loadCurrentMessage,
  getCurrentWalletConnected,
} from "./util/interact.js";

// Material UI
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TextField } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");

  const [expanded, setExpanded] = React.useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <Button {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const [expanded2, setExpanded2] = React.useState(false);
  const handleExpandClick2 = () => {
    setExpanded2(!expanded2);
  };
  const ExpandMore2 = styled((props) => {
    const { expand, ...other } = props;
    return <Button {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const [valores, setValores] = useState({
    nomeEvento: "",
    valorIngresso: "",
    limit: "",
    quantidadeIngressos: "",
  });
  const handleChange = (event) => {
    setValores({ ...valores, [event.target.name]: event.target.value });
  };

  function creatTicket() {
    const { nomeEvento, valorIngresso, limit, quantidadeIngressos } = valores;

    console.log(valores);
  }

  function createData(nomeEvento = "", valorIngresso = "") {
    return { nomeEvento, valorIngresso };
  }

  const rows = [
    createData("São João 2023", 249.9),
    createData("São Pedro 2023", 199.9),
  ];

  //called only once
  useEffect(() => {
    async function fetchMessage() {
      const message = await loadCurrentMessage();
      setMessage(message);
    }

    fetchMessage();

    async function fetchWallet() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    fetchWallet();
    addWalletListener();
  }, []);

  function addSmartContractListener() {
    //TODO: implement
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    const { status } = await updateMessage(walletAddress, newMessage);
    setStatus(status);
  };

  //the UI of our component
  return (
    <div className="container">
      <Button variant="contained" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </Button>

      <div className="cards">
        <Card
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 64px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardHeader sx={{ padding: "0px" }} title="Criar Ingresso" />
          <CardActions disableSpacing>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <form className="containerForm">
                <div className="form">
                  <TextField
                    type="text"
                    name="nomeEvento"
                    value={valores.nomeEvento}
                    onChange={handleChange}
                    label="Nome do evento"
                    required
                  />

                  <TextField
                    type="number"
                    name="valorIngresso"
                    value={valores.valorIngresso}
                    onChange={handleChange}
                    label="Valor do ingresso"
                    required
                  />

                  <TextField
                    type="number"
                    name="limit"
                    value={valores.limit}
                    onChange={handleChange}
                    label="Limite de ingressos"
                    required
                  />

                  <TextField
                    type="number"
                    name="quantidadeIngressos"
                    value={valores.quantidadeIngressos}
                    onChange={handleChange}
                    label="Quantidade de ingressos"
                    required
                  />
                </div>

                <Button
                  variant="contained"
                  onClick={creatTicket}
                  sx={{ width: "100%", marginTop: "8px" }}
                >
                  Criar ingresso
                </Button>
              </form>
            </CardContent>
          </Collapse>
        </Card>

        <Card
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 64px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardHeader sx={{ padding: "0px" }} title="Ingressos" />
          <CardActions disableSpacing>
            <ExpandMore
              expand={expanded2}
              onClick={handleExpandClick2}
              aria-expanded={expanded2}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded2} timeout="auto" unmountOnExit>
            <CardContent>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Nome do evento</TableCell>
                      <TableCell align="center">Valor do ingresso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{row.nomeEvento}</TableCell>
                        <TableCell align="center">
                          {row.valorIngresso}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Collapse>
        </Card>
      </div>

      {/* <h2 style={{ paddingTop: "50px" }}>Current Message:</h2>
      <p>{message}</p>\

      <h2 style={{ paddingTop: "18px" }}>New Message:</h2>

      <div>
        <input
          type="text"
          placeholder="Update the message in your smart contract."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" onClick={onUpdatePressed}>
          Update
        </button>
      </div>

      <style jsx>{`
        #container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        #logo {
          max-width: 100%;
          height: auto;
        }

        #walletButton {
          display: block;
          margin: 10px auto;
        }

        h2 {
          margin-top: 50px;
        }

        @media (max-width: 600px) {
          h2 {
            margin-top: 30px;
          }

          #walletButton {
            font-size: 14px;
          }
        }

        @media (max-width: 400px) {
          h2 {
            margin-top: 20px;
          }

          #walletButton {
            font-size: 12px;
          }
        }
      `}</style> */}

      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
        }

        .cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .container-form {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default HelloWorld;
