import styled from "styled-components";
import randomColor from "randomcolor";

const RANDOM_COLOR_SEED = 250;

const colorMemo = {
  CALL: "#f59f00",
  RWY: "#82c91e",
  WS: "#3bc9db",
  FREQ: "#da77f2",
  ACTION: "#ff8787"
};
const randomColors = randomColor({
  luminosity: "bright",
  seed: RANDOM_COLOR_SEED,
  count: 1000
});
let randomColorIdx = 0;
const colorOfType = type => {
  if (colorMemo[type]) {
    return colorMemo[type];
  } else {
    colorMemo[type] = randomColors[randomColorIdx];
    randomColorIdx += 10;
    return colorMemo[type];
  }
};

const HighlightMark = styled.mark`
  display: inline-block;
  padding-left: 0.35em;
  line-height: 1;
  background-color: transparent;
  color: inherit;
  border: 2px solid ${props => colorOfType(props.type)};
  border-radius: 8px;

  &::after {
    display: inline-block;
    box-sizing: border-box;
    content: "${props => props.type}";
    line-height: 1;
    padding: 0.25em 0.35em;
    margin-left: 0.35em;
    color: #fff;
    font-size: 0.95em;
    font-weight: bold;
    background-color: ${props => colorOfType(props.type)};
  }
`;

export default HighlightMark;
