import React from "react";
import { useEffect, useState } from "react";
import {
  connectWallet,
  loadCreateTicket,
  loadBuyTicket,
  loadGetGroupTickets,
  getCurrentWalletConnected,
  loadFilterTicketsByOwner,
  signTicket,
  loadVerifyTicket,
  checkTransactionConfirmation
} from "./util/interact.js";
import QrCode from 'react-qr-code';
import { QrReader } from 'react-qr-reader';

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
import { Modal, Box } from "@mui/material";

const HelloWorld = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [statusBuyTicket, setStatusBuyTicket] = useState("");

  const [expanded, setExpanded] = React.useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
    setValores({
      nomeEvento: "",
      valorIngresso: "",
      limit: "",
      quantidadeIngressos: "",
    });
    setStatus("");
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
    if (!expanded2) {
      loadGetGroupTickets().then((res) => {
        setGroupTickets(res);
      });
    }
    setExpanded2(!expanded2);
  };

  const [expanded3, setExpanded3] = React.useState(false);
  const handleExpandClick3 = () => {
    if (!expanded3) {
      setinputComprarIngresso({
        idEvento: "",
        proprietario: "",
        valor: 0,
        sale: false,
      });
      setStatusBuyTicket("");
    }
    setExpanded3(!expanded3);
  };

  const [expanded4, setExpanded4] = React.useState(false);
  const handleExpandClick4 = () => {
    setExpanded4(!expanded4);
  };

  const [expanded5, setExpanded5] = React.useState(false);
  const handleExpandClick5 = () => {
    setExpanded5(!expanded5);
  };

  const [openModalQrCode, setOpenModalQrCode] = useState(false);
  const [qrCodeContent, setQrCodeContent] = useState('');


  const handleOpenModalQrCode = (ticketId, walletAddress) => {
    signTicket(ticketId, walletAddress).then((res) => {
      const { hashedMessage, r, s, v } = res;
      console.log("hashedMessage", hashedMessage);
      console.log("r", r);
      console.log("s", s);
      console.log("v", v);
      setQrCodeContent(JSON.stringify({ ticketId, walletAddress, hashedMessage, r, s, v }));
      setOpenModalQrCode(true);
    }).catch((error) => {
      console.log("error", error);
    });
  };

  const handleCloseModalQrCode = () => {
    setOpenModalQrCode(false);
  };

  const [openModalQrReader, setOpenModalQrReader] = useState(false);
  const [qrCodeReader, setQrCodeReader] = useState("");

  const handleOpenModalQrReader = () => {
    setOpenModalQrReader(true);
  };

  const handleCloseModalQrReader = () => {
    setOpenModalQrReader(false);
  };

  const handleScan = (data, error) => {
    console.log("data", data);
    if (!!data) {
      setQrCodeReader(JSON.parse(data?.text));
      setOpenModalQrReader(false);
      setOpenModalVerificar(true);
    }
    if (!!error) {
      console.info(error);
    }
  };

  const handleComprar = (eventId, owner, value) => {
    setExpanded2(false);
    setExpanded3(true);
    setinputComprarIngresso({
      idEvento: eventId,
      proprietario: owner,
      valor: value,
      sale: false,
    });
  }

  const [openModalVerificar, setOpenModalVerificar] = useState(false);

  const handleCloseModalVerificar = () => {
    setOpenModalVerificar(false);
    setStatusVerificar("");
  };

  const [statusVerificar, setStatusVerificar] = useState("");

  const handleVerificar = async () => {
    setStatusVerificar("Verificando...");
    const { ticketId, walletAddress, hashedMessage, r, s, v } = qrCodeReader;
    const tickeIdNumber = parseInt(ticketId);
    console.log("qrCodeReader", qrCodeReader);
    console.log("tickeIdNumber", tickeIdNumber);
    const txn = await loadVerifyTicket(tickeIdNumber, walletAddress, hashedMessage, r, s, v);
    console.log("txn", txn);
    checkTransactionConfirmation(txn).then((res) => {
      setStatusVerificar(res + " O ingresso foi validado sucesso!");
    }).catch((error) => {
      setStatusVerificar("Erro:" + error);
    });
  };

  const [showDisconnectButton, setShowDisconnectButton] = React.useState(false);

  const [valores, setValores] = useState({
    nomeEvento: "",
    valorIngresso: "",
    limit: "",
    quantidadeIngressos: "",
  });
  const handleChange = (event) => {
    setValores({ ...valores, [event.target.name]: event.target.value });
  };

  const [transferibleButton, setTransferibleButton] = useState(true)
  const [saleButton, setSaleButton] = useState(true)

  const createTicketPressed = async () => {
    setStatus("");
    const { nomeEvento, valorIngresso, limit, quantidadeIngressos } = valores;
    console.log("input de createTicketPressed:", valores);

    if (!nomeEvento || !valorIngresso || !limit || !quantidadeIngressos) {
      setStatus("❗️ All values must be filled.");
      return;
    }

    const txn = await loadCreateTicket(walletAddress, valores);
    console.log("txn", txn);
    setTituloModalTransacao("Status Criação Ingresso");
    setOpenModalTransacao(true);
    setMsgModalTransacao("Transação enviada. Aguardando confirmação...");
    checkTransactionConfirmation(txn).then((res) => {
      setMsgModalTransacao(res + " Os ingressos foram criados com sucesso!");
    });
  };

  const [openModalTransacao, setOpenModalTransacao] = useState(false);

  const handleCloseModalTransacao = () => {
    setOpenModalTransacao(false);
  };

  const [msgModalTransacao, setMsgModalTransacao] = useState("");
  const [tituloModalTransacao, setTituloModalTransacao] = useState("");

  const listMyTicketsPressed = async () => {
    const myTicketsR = await loadFilterTicketsByOwner(0, walletAddress, transferibleButton, saleButton);
    setMyTickets(myTicketsR);
  };

  const buyTicketPressed = async () => {
    setStatusBuyTicket("");
    const { idEvento, proprietario, valor } = inputComprarIngresso;
    console.log("input de buyTicketPressed:", inputComprarIngresso);

    if (!idEvento || !proprietario || !valor) {
      setStatusBuyTicket("❗️ All values must be filled.");
      return;
    }

    const txn = await loadBuyTicket(walletAddress, inputComprarIngresso, valor);
    console.log("txn", txn);
    setTituloModalTransacao("Status Comprar Ingresso");
    setOpenModalTransacao(true);
    setMsgModalTransacao("Transação enviada. Aguardando confirmação...");
    checkTransactionConfirmation(txn).then((res) => {
      setMsgModalTransacao(res + " Ingresso comprado com sucesso!");
    });
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

  const [myTickets, setMyTickets] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    async function fetchWallet() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
      setShowDisconnectButton(true);
    }
    fetchWallet();
    addWalletListener();

    async function fetchMessage() {
      const vals = await loadGetGroupTickets();
      setGroupTickets(vals);
    }

    fetchMessage();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet("");
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

  const disconnectWalletPressed = async () => {
    if (window.ethereum) {
      setShowDisconnectButton(false);
      setWallet("");
      setStatus("🦊 Connect to Metamask using the top right button.");
    }
  }

  return (
    <div className="container">
      <Button variant="contained" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>CONECTAR CARTEIRA</span>
        )}
      </Button>
      <Button variant="contained" onClick={disconnectWalletPressed} disable={showDisconnectButton}>
        DESCONECTAR CARTEIRA
      </Button>

      <div className="cards">
        <Card>
          <div className="cardHeader">
            <CardHeader sx={{ padding: "0px" }} title="Criar Ingressos" />
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
                    label="Valor do ingresso(ether)"
                    required
                  />

                  <TextField
                    type="number"
                    name="limit"
                    value={valores.limit}
                    onChange={handleChange}
                    label="Limite de Transferencias"
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
                  Criar ingressos
                </Button>

                <p id="status">{status}</p>
              </form>
            </CardContent>
          </Collapse>
        </Card>

        <Card>
          <div className="cardHeader">
            <CardHeader sx={{ padding: "0px" }} title="Listar Eventos" />
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
                      <TableCell align="center">Valor(ether)</TableCell>
                      <TableCell align="center">Disponiveis</TableCell>
                      <TableCell align="center">Comprar</TableCell>
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
                        <Button variant="contained" onClick={() => { handleComprar(row.eventId, row.organizer, row.value) }}>Comprar</Button>
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
                    label="Valor do ingresso(ether)"
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

        <Card>
          <div className="cardHeader">
            <CardHeader sx={{ padding: "0px" }} title="Meus Ingressos" />
            <CardActions disableSpacing>
              <ExpandMore
                expand={expanded4}
                onClick={handleExpandClick4}
                aria-expanded={expanded4}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
          </div>
          <Collapse
            in={expanded4}
            timeout="auto"
            unmountOnExit
            className="collapse"
          >
            <CardContent>
              <Button
                variant="contained"
                onClick={listMyTicketsPressed}
                sx={{ width: "100%", marginTop: "8px" }}
              >
                Listar meus ingressos
              </Button>
              <Button
                variant="contained"
                onClick={() => { setTransferibleButton(!transferibleButton) }}
                sx={{ width: "100%", marginTop: "8px", backgroundColor: transferibleButton ? 'green' : 'red', }}
              >
                Transferiveis
              </Button>
              <Button
                variant="contained"
                onClick={() => { setSaleButton(!saleButton) }}
                sx={{ width: "100%", marginTop: "8px", backgroundColor: saleButton ? 'green' : 'red', }}
              >
                A venda
              </Button>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">ID do ingresso</TableCell>
                      <TableCell align="center">ID do evento</TableCell>
                      <TableCell align="center">Nome do evento</TableCell>
                      <TableCell align="center">Organizador</TableCell>
                      <TableCell align="center">Valor(ether)</TableCell>
                      <TableCell align="center">Tranferencias</TableCell>
                      <TableCell align="center">Limite</TableCell>
                      <TableCell align="center">Sale</TableCell>
                      <TableCell align="center">QrCode</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myTickets.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center">{row.id}</TableCell>
                        <TableCell align="center">{row.eventId}</TableCell>
                        <TableCell align="center">{row.eventName}</TableCell>
                        <TableCell align="center">{row.organizer}</TableCell>
                        <TableCell align="center">{row.value}</TableCell>
                        <TableCell align="center">{row.age}</TableCell>
                        <TableCell align="center">{row.limit}</TableCell>
                        <TableCell align="center">{row.sale}</TableCell>
                        <Button variant="contained" onClick={() => { handleOpenModalQrCode(row.id, walletAddress) }}>Abrir</Button>
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
            <CardHeader sx={{ padding: "0px" }} title="Validar Ingresso" />
            <CardActions disableSpacing>
              <ExpandMore
                expand={expanded5}
                onClick={handleExpandClick5}
                aria-expanded={expanded5}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
          </div>
          <Collapse
            in={expanded5}
            timeout="auto"
            unmountOnExit
            className="collapse"
          >
            <CardContent>
              <Button
                variant="contained"
                onClick={handleOpenModalQrReader}
                sx={{ width: "100%", marginTop: "8px" }}
              >
                Validar Ingresso
              </Button>
            </CardContent>
          </Collapse>
        </Card>
      </div>

      <Modal open={openModalQrCode} onClose={handleCloseModalQrCode}>
        <Box
          className='boxModal'
          sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}
        >
          <QrCode value={qrCodeContent} sx={{ width: 300 }} />

          <Button onClick={handleCloseModalQrCode} sx={{ mt: 4 }}>
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={openModalQrReader} onClose={handleCloseModalQrReader}>
        <Box className='boxModal' sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <h2>Leitor de QR Code</h2>
          <QrReader delay={300} onResult={handleScan} style={{ width: '100%' }} constraints={{
            facingMode: 'environment'
          }} />
          <Button onClick={handleCloseModalQrReader}>Fechar</Button>
        </Box>
      </Modal>

      <Modal open={openModalVerificar} onClose={handleCloseModalVerificar}>
        <Box className='boxModal' sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <h2>Verificar Ingresso</h2>
          <p>{statusVerificar}</p>
          <Button onClick={handleVerificar}>Verificar</Button>
          <Button onClick={handleCloseModalVerificar}>Fechar</Button>
        </Box>
      </Modal>

      <Modal open={openModalTransacao} onClose={handleCloseModalTransacao}>
        <Box className='boxModal' sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <div>
            <h2>{tituloModalTransacao}</h2>
            <p>{msgModalTransacao}</p>
            <Button onClick={handleCloseModalTransacao}>Fechar</Button>
          </div>
        </Box>
      </Modal>

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
          .boxModal {
            width: 250px;
            padding: 15px;
          }

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
