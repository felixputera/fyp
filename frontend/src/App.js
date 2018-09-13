import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";
import ErrorIcon from "@material-ui/icons/Error";
import styled from "styled-components";

import HighlightedText from "./components/HighlightedText";

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
  grid-template-rows: 240px;
  grid-template-areas: "input output";
  grid-column-gap: 24px;
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

class App extends Component {
  state = {
    text: "",
    highlight: [],
    errorVisible: false
  };

  componentDidMount() {
    this._handleConnectWs();
  }

  _onWsMessage = e => {
    const parsedData = JSON.parse(e.data);
    this.setState({ highlight: parsedData });
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
    this.ws.send(e.target.value);
  };

  render() {
    const { classes } = this.props;
    const { text, highlight, errorVisible } = this.state;
    return (
      <>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Online Text Highlighter
            </Typography>
          </Toolbar>
        </AppBar>
        <GridContainer>
          <InputGrid>
            <Typography variant="subheading">Input</Typography>
            <Paper className={classes.paper}>
              <TextField
                multiline
                fullWidth
                placeholder="Type here..."
                onChange={this._handleTextAreaChange}
                value={text}
              />
            </Paper>
          </InputGrid>
          <OutputGrid>
            <Typography variant="subheading">Output</Typography>
            <Paper className={classes.paper}>
              <HighlightedText text={text} highlight={highlight} />
            </Paper>
          </OutputGrid>
        </GridContainer>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={errorVisible}
          message={
            <span className={classes.snackbarMessage}>
              <ErrorIcon className={classes.errorIcon} />
              Failed to connect to server
            </span>
          }
          action={
            <Button color="inherit" size="small" onClick={this._handleRetryWs}>
              Retry
            </Button>
          }
        />
      </>
    );
  }
}

export default withStyles(styles)(App);
