import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  connectWallet,
  loadCreateTicket,
  loadBuyTicket,
  loadGetGroupTickets,
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
import { TextField, FormControlLabel, Checkbox } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CopyAllIcon from "@mui/icons-material/CopyAll";

const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [statusBuyTicket, setStatusBuyTicket] = useState("");

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

  const [expanded3, setExpanded3] = React.useState(false);
  const handleExpandClick3 = () => {
    setExpanded3(!expanded3);
  };

  const [valores, setValores] = useState({
    nomeEvento: "",
    valorIngresso: "",
    limit: "",
    quantidadeIngressos: "",
  });
  const handleChange = (event) => {
    setValores({ ...valores, [event.target.name]: event.target.value });
  };

  const createTicketPressed = async () => {
    const { nomeEvento, valorIngresso, limit, quantidadeIngressos } = valores;
    console.log("input de createTicketPressed:", valores);

    if (!nomeEvento || !valorIngresso || !limit || !quantidadeIngressos) {
      setStatus("❗️ All values must be filled.");
      return;
    }

    const { status } = await loadCreateTicket(walletAddress, valores);
    setStatus(status);
  };

  const buyTicketPressed = async () => {
    const { idEvento, proprietario, valor } = inputComprarIngresso;
    console.log("input de buyTicketPressed:", inputComprarIngresso);

    if (!idEvento || !proprietario || !valor) {
      setStatusBuyTicket("❗️ All values must be filled.");
      return;
    }

    const { status } = await loadBuyTicket(walletAddress, inputComprarIngresso, valor);
    setStatusBuyTicket(status);
  };

  const [inputComprarIngresso, setinputComprarIngresso] = useState({
    idEvento: "",
    proprietario: "",
    valor: 0,
    sale: false,
  });
  const handleComprarIngresso = (event) => {
    setinputComprarIngresso({ ...inputComprarIngresso, [event.target.name]: event.target.value });
  };
  const handleCheckComprarIngresso = (check) => {
    setinputComprarIngresso({ ...inputComprarIngresso, ["sale"]: check });
  };
  

  const [groupTickets, setGroupTickets] = useState([]);

  const copyToClipboard = (text) => {
    console.log("copyToClipboard:", text);
    navigator.clipboard.writeText(text);
  };

  //called only once
  useEffect(() => {
    async function fetchMessage() {
      const vals = await loadGetGroupTickets();
      console.log("getGroupTickets:", vals);
      setGroupTickets(vals);
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
        <Card>
          <div className="cardHeader">
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
          </div>

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
                  onClick={createTicketPressed}
                  sx={{ width: "100%", marginTop: "8px" }}
                >
                  Criar ingresso
                </Button>

                <p id="status">{status}</p>
              </form>
            </CardContent>
          </Collapse>
        </Card>

        <Card>
          <div className="cardHeader">
            <CardHeader sx={{ padding: "0px" }} title="Listar Ingressos" />
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
          </div>
          <Collapse
            in={expanded2}
            timeout="auto"
            unmountOnExit
            className="collapse"
          >
            <CardContent>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">ID do evento</TableCell>
                      <TableCell align="center">Nome do evento</TableCell>
                      <TableCell align="center">Organizador</TableCell>
                      <TableCell align="center">Valor(wei)</TableCell>
                      <TableCell align="center">Disponiveis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupTickets.map((row) => (
                      <TableRow
                        key={row.eventId}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{row.eventId}</TableCell>
                        <TableCell align="center">{row.eventName}</TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {row.organizer}
                          <Button
                            variant="text"
                            onClick={() => copyToClipboard(row.organizer)}
                          >
                            <CopyAllIcon />
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          {row.value}
                          <Button
                            variant="text"
                            onClick={() => copyToClipboard(row.value)}
                          >
                            <CopyAllIcon />  
                          </Button>  
                        </TableCell>
                        <TableCell align="center">{row.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Collapse>
        </Card>

        <Card>
          <div className="cardHeader">
            <CardHeader sx={{ padding: "0px" }} title="Comprar Ingresso" />
            <CardActions disableSpacing>
              <ExpandMore
                expand={expanded3}
                onClick={handleExpandClick3}
                aria-expanded={expanded3}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
          </div>

          <Collapse in={expanded3} timeout="auto" unmountOnExit>
            <CardContent>
              <form className="containerForm">
                <div className="form">
                  <TextField
                    type="text"
                    name="idEvento"
                    value={inputComprarIngresso.idEvento}
                    onChange={handleComprarIngresso}
                    label="ID do evento"
                    required
                  />

                  <TextField
                    type="text"
                    name="proprietario"
                    value={inputComprarIngresso.proprietario}
                    onChange={handleComprarIngresso}
                    label="Proprietario"
                    required
                  />

                  <TextField
                    type="number"
                    name="valor"
                    value={inputComprarIngresso.valor}
                    onChange={handleComprarIngresso}
                    label="Valor do ingresso"
                    required
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={inputComprarIngresso.sale}
                        onChange={(event) => {
                            handleCheckComprarIngresso(!inputComprarIngresso.sale)
                          }
                        }
                        name="sale"
                      />
                    }
                    label="Disponivel para venda"
                    required
                  />
                </div>

                <Button
                  variant="contained"
                  onClick={buyTicketPressed}
                  sx={{ width: "100%", marginTop: "8px" }}
                >
                  Comprar Ingresso
                </Button>

                <p id="status">{statusBuyTicket}</p>
              </form>
            </CardContent>
          </Collapse>
        </Card>
      </div>

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

        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
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

        /* Deixar o form com 1fr no celular */
        @media (max-width: 600px) {
          .collapse {
            overflow-x: scroll;
          }

          .ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100px;
          }

          .form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HelloWorld;
