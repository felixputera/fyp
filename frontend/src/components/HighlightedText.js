import React from "react";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import styled from "styled-components";
import randomColor from "randomcolor";

const colorMemo = {};
const colorOfType = type => {
  if (colorMemo[type]) {
    return colorMemo[type];
  } else {
    colorMemo[type] = randomColor({ luminosity: "light" });
    return colorMemo[type];
  }
};

const Highlight = styled.span`
  padding: 4px 2px;
  border-width: 0;
  border-radius: 4px;
  background-color: ${props => colorOfType(props.type)};
`;

const HighlightedText = ({ highlight, text }) => {
  const segments = [];
  let prevLastIndex = 0;
  highlight.forEach((element, idx) => {
    segments.push(text.slice(prevLastIndex, element.position[0]));
    segments.push(
      <Tooltip title={element.type} key={idx}>
        <Highlight type={element.type}>
          {text.slice(element.position[0], element.position[1])}
        </Highlight>
      </Tooltip>
    );
    prevLastIndex = element.position[1];
  });
  segments.push(text.slice(prevLastIndex, text.length));

  return <Typography>{segments}</Typography>;
};

export default HighlightedText;
