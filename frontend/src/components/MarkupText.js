import React from "react";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import styled from "styled-components";
import randomColor from "randomcolor";

const OPENING_TAG_RE = /<([a-zA-Z]+)>/;
const CLOSING_TAG_RE = /<\/([a-zA-Z]+)>/;

const markupToSegments = markupText => {
  const segments = [];
  const tokens = markupText.split(" ");
  let curSegment = { tokens: [] };

  tokens.forEach(token => {
    const openingTagMatch = token.match(OPENING_TAG_RE);
    const closingTagMatch = token.match(CLOSING_TAG_RE);

    if (openingTagMatch) {
      segments.push(curSegment);
      curSegment = { tokens: [], tag: openingTagMatch[1] };
    } else if (closingTagMatch) {
      segments.push(curSegment);
      curSegment = { tokens: [] };
    } else {
      curSegment["tokens"].push(token);
    }
  });

  if (curSegment["tokens"].length !== 0) {
    segments.push(curSegment);
  }

  return segments;
};

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

const MarkupText = ({ text }) => {
  const renderSegments = [];
  markupToSegments(text).forEach((segment, idx) => {
    if (segment.hasOwnProperty("tag")) {
      renderSegments.push(
        <Tooltip title={segment.tag} key={idx}>
          <Highlight type={segment.tag}>{segment.tokens.join(" ")}</Highlight>
        </Tooltip>
      );
    } else {
      renderSegments.push(segment.tokens.join(" "));
    }
    renderSegments.push(" ");
  });

  return <Typography>{renderSegments}</Typography>;
};

export default MarkupText;
