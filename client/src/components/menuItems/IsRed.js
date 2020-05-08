import React from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

function IsRed(props) {
  return (
    <ButtonGroup onChange={props.handleChange} className="button-group-layout" toggle>
      <ToggleButton className="panel-button panel-button-header" variant="dark" type="radio" name="isRed" disabled>
        Choose which color to play:
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="isRed" defaultChecked value="false">
        Black (goes first)
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="isRed" value="true">
        Red (goes second)
      </ToggleButton>
    </ButtonGroup>
  );
}

export default IsRed;
