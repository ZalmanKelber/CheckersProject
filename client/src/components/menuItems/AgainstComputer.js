import React from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

function AgainstComputer(props) {
  return (
    <ButtonGroup onChange={props.handleChange} className="button-group-layout" toggle>
      <ToggleButton className="panel-button panel-button-header" variant="dark" type="radio" name="againstComputer" disabled>
        Choose game type:
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="againstComputer" defaultChecked value="true">
        Play against computer
      </ToggleButton>
      <ToggleButton className="panel-button" variant="outline-dark" type="radio" name="againstComputer" value="false">
        Play against user (must be logged in)
      </ToggleButton>
    </ButtonGroup>
  );
}

export default AgainstComputer;
