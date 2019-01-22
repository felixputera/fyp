# FYP Server

## Requirement
- Python 3.6+ (or [pyenv](https://github.com/pyenv/pyenv))
- [pipenv](https://pipenv.readthedocs.io/en/latest/)

## Usage
### Installation
1. Install the required dependencies  
`$ pipenv install`
2. Download the NER model archive [here](https://drive.google.com/file/d/1D4_5mY7-ulR5FEs94uoKG5AkesouJ15s/view?usp=sharing), and copy it to `models/` directory. Optionally, if you use your own NER model, modify the archived model path in `config.yaml`
3. **IMPORTANT** activate the virtualenv, always do this before running anything in this project  
`$ pipenv shell`

### Starting the server
To start the server
```bash
$ ./run_server.py
```
Optionally, you can also specify the port which you want the server to be served
```bash
$ ./run_server.py --port 8888
```

### API
Currently, you make an API call to the server only via WebSocket. Simply establish connection to the server's root URL (`/`), and then send the text in string directly on the message.

Example in JavaScript:
```js
// First, create a websocket connection
const ws = new WebSocket("ws://localhost:5000/");
// Pass callback function to `onmessage` when receive message from server
ws.onmessage = (e) => {
    console.log(e.data);
}
// Using `send` method, send message to server
ws.send("singapore one two cleared for takeoff");
```
