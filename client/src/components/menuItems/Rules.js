import React from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

function Rules(props) {
  return(
    <ButtonGroup onChange={props.handleChange} className="button-group-layout" toggle>
      <ToggleButton className="panel-button panel-button-header" variant="dark" type="radio" name="rules" disabled>
        Select rules:
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="rules" defaultChecked value="0">
        Move freely
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="rules" value="1">
        Must jump when possible
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="rules" value="2">
        Must jump until end of path
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="rules" value="3">
        Must jump longest path
      </ToggleButton>
    </ButtonGroup>
  )
}

export default Rules;
