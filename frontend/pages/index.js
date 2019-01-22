import React, { Component, createRef } from "react";
import styled from "styled-components";
import { withStyles } from "@material-ui/core/styles";
import { format } from "date-fns";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import ClearRounded from "@material-ui/icons/ClearRounded";
import RootRef from "@material-ui/core/RootRef";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import MarkupText from "../modules/components/MarkupText";

const EXAMPLES = [
  "singapore four runway two zero right continue approach",
  "viet nam vacate whiskey five contact ground at one two one eight",
  "cebu two zero two center wind seven nine zero three zero you are clear land",
  "indonesia nine two zero center after the landing firefly six zero and clear to land"
];

// Styles definition

const styles = theme => ({
  main: {
    padding: 20
  },
  paper: {
    flexGrow: 1,
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  errorIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  snackbarMessage: {
    display: "flex",
    alignItems: "center"
  }
});

const GridContainer = styled.div`
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 240px 1fr;
  grid-template-areas:
    "input output"
    "control control";
  grid-column-gap: 24px;
  grid-row-gap: 24px;
`;

const InputGrid = styled.div`
  grid-area: input;
  display: flex;
  flex-direction: column;
`;

const OutputGrid = styled.div`
  grid-area: output;
  display: flex;
  flex-direction: column;
`;

const ControlGrid = styled.div`
  grid-area: control;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  /* justify-content: center; */
  padding: 4px 0px;
`;

const LogPaper = styled(Paper)`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 100%;
  min-width: 0;
  min-height: 0;
  overflow-y: scroll;
  padding: 8px;
  max-height: 240px;
  max-width: 100%;
`;

const LogEntry = styled.span`
  display: block;
`;

const ControlButton = styled(Button)`
  margin-right: 8px;
`;

// Functions definition

const getCurrentTimeString = () => format(new Date(), "HH:mm:ss");

class Transcription {
  index = 0;
  list = [];

  add = (text, isFinal) => {
    this.list[this.index] = text;
    if (isFinal) {
      this.index++;
    }
  };

  toString = () => {
    return this.list.join(". ");
  };

  clear = () => {
    this.index = 0;
    this.list = [];
  };
}

class App extends Component {
  state = {
    text: "",
    output: "",
    highlight: [],
    errorVisible: false,
    asrLogs: [],
    asrTranscribing: false,
    asrLoading: false,
    asrInitialized: false,
    exampleValue: ""
  };

  componentDidMount() {
    this.transcription = new Transcription();

    this.dictate = new window.Dictate({
      server: "ws://155.69.146.209:8888/client/ws/speech",
      serverStatus: "ws://155.69.146.209:8888/client/ws/status",
      recorderWorkerPath: "static/js/recorderWorker.js",
      onReadyForSpeech: () => {
        this.setState({ asrLoading: false, asrTranscribing: true });
        this._addAsrLog("READY FOR SPEECH");
      },
      onEndOfSpeech: () => {
        this.setState({ asrLoading: true });
        this._addAsrLog("END OF SPEECH");
      },
      onEndOfSession: () => {
        this.setState({ asrLoading: false, asrTranscribing: false });
        this.dictate.cancel();
        this._addAsrLog("END OF SESSION");
      },
      onServerStatus: () => {},
      onPartialResults: hypos => {
        this.transcription.add(hypos[0].transcript, false);
        this.setState({ text: this.transcription.toString() });
      },
      onResults: hypos => {
        this.transcription.add(hypos[0].transcript, true);
        this.setState({ text: this.transcription.toString() });
      },
      onError: () => {
        this.dictate.cancel();
      },
      onEvent: (_, data) => {
        this._addAsrLog(data);
      }
    });

    this._handleConnectWs();

    (() => {
      this.dictate.cancel();
      // this.dictate.init();
    })();
  }

  logRef = createRef();

  _onWsMessage = e => {
    // const parsedData = JSON.parse(e.data);
    // this.setState({ highlight: parsedData });
    this.setState({ output: e.data });
  };

  _handleRetryWs = () => {
    this.setState({ errorVisible: false });
    this._handleConnectWs();
  };

  _handleConnectWs = () => {
    this.ws = new WebSocket("ws://localhost:5000/");

    this.ws.onopen = () => console.log("connected to ws");
    this.ws.onclose = () => this.setState({ errorVisible: true });
    this.ws.onmessage = this._onWsMessage;
  };

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }

  _handleTextAreaChange = e => {
    this.setState({ text: e.target.value });
    // this.ws.send(e.target.value);
  };

  _clearInput = () => {
    this.setState({ text: "" });
  };

  _addAsrLog = log => {
    const formattedLog = `${getCurrentTimeString()} ${log}`;
    this.setState(prevState => ({
      asrLogs: [...prevState.asrLogs, formattedLog]
    }));
    this.logRef.current.scrollTo({
      top: this.logRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  _handleAsrButtonClick = () => {
    this.setState({ asrLoading: true });
    if (this.state.asrTranscribing) {
      this.dictate.stopListening();
      // this.dictate.cancel();
    } else {
      this.dictate.startListening();
    }
  };

  shouldComponentUpdate(_, nextState) {
    if (nextState.text !== this.state.text) {
      this.ws.send(nextState.text);
    }
    return true;
  }

  _clearAsrLogs = () => {
    this.setState({
      asrLogs: []
    });
  };

  _initializeAsr = () => {
    this.setState({ asrInitialized: true });
    this.dictate.init();
    this.transcription.clear();
  };

  _handleExampleChange = e => {
    if (e.target.value === "") {
      this.setState({
        exampleValue: ""
      });
    } else {
      this.setState({
        text: EXAMPLES[e.target.value],
        exampleValue: e.target.value
      });
    }
  };

  render() {
    const { classes } = this.props;
    const {
      text,
      errorVisible,
      output,
      asrLogs,
      asrTranscribing,
      asrLoading,
      asrInitialized,
      exampleValue
    } = this.state;
    return (
      <>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Online ATC Text Highlighter
            </Typography>
          </Toolbar>
        </AppBar>
        <GridContainer>
          <InputGrid>
            <Typography variant="h6">Input text</Typography>
            <Paper className={classes.paper}>
              <Input
                multiline
                fullWidth
                placeholder="Type here..."
                onChange={this._handleTextAreaChange}
                value={text}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={this._clearInput}>
                      <ClearRounded />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Paper>
          </InputGrid>
          <OutputGrid>
            <Typography variant="h6">Results</Typography>
            <Paper className={classes.paper}>
              <MarkupText text={output} />
            </Paper>
          </OutputGrid>

          <ControlGrid>
            <Row>
              <FormControl fullWidth>
                <InputLabel htmlFor="example-select">
                  Select an example
                </InputLabel>
                <Select
                  value={exampleValue}
                  onChange={this._handleExampleChange}
                  inputProps={{ id: "example-select" }}
                  autoWidth
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {EXAMPLES.map((example, idx) => (
                    <MenuItem value={idx} key={idx}>
                      {example}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Row>
            <Row>
              <Typography variant="subtitle1">
                Highlighter server status:{" "}
                <strong>{errorVisible ? "Disconnected" : "Connected"}</strong>
              </Typography>
              {errorVisible && (
                <Button color="secondary" onClick={this._handleRetryWs}>
                  Retry
                </Button>
              )}
            </Row>
            <Row>
              <Typography variant="subtitle1">ASR Log</Typography>
            </Row>
            <Row>
              <RootRef rootRef={this.logRef}>
                <LogPaper elevation={0}>
                  <Typography
                    style={{
                      wordBreak: "break-all",
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {asrLogs.map((log, idx) => (
                      <LogEntry key={idx}>{log}</LogEntry>
                    ))}
                  </Typography>
                </LogPaper>
              </RootRef>
            </Row>
            <Row>
              <ControlButton
                variant="contained"
                color="secondary"
                disabled={!asrInitialized || asrLoading}
                onClick={this._handleAsrButtonClick}
              >
                {asrTranscribing ? "Stop Transcribing" : "Start Transcribing"}
              </ControlButton>
              <ControlButton
                variant="outlined"
                color="secondary"
                onClick={this._initializeAsr}
              >
                Initialize Dictate.js
              </ControlButton>
              <ControlButton
                variant="outlined"
                color="secondary"
                onClick={this._clearAsrLogs}
              >
                Clear Log
              </ControlButton>
            </Row>
          </ControlGrid>
        </GridContainer>
      </>
    );
  }
}

export default withStyles(styles)(App);
