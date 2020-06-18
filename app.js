import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { init, locations } from 'contentful-ui-extensions-sdk';
import ValidationMessage from '@contentful/forma-36-react-components/dist/components/ValidationMessage';
import Note from '@contentful/forma-36-react-components/dist/components/Note';

import '@contentful/forma-36-react-components/dist/styles.css';

init(sdk => {
  if (!sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    render(<ValidatedJSON sdk={sdk} />, document.getElementById('root'));
    sdk.window.startAutoResizer();
  } else {
    sdk.app.setReady();
  }
});

function ValidatedJSON ({ sdk }) {
  const validationPropsField = sdk.entry.fields['validation_props'];
  const validationProps = validationPropsField.getValue() || {};
  const [isValid, setValidState] = useState(() => {
    return checkValid(validationProps);
  });
  const validationField = sdk.field;

  useEffect(() => {
    if (!isValid) {
      validationField.removeValue();
    } else {
      validationField.setValue(true);
    }
  }, [isValid, validationField]);

  useEffect(() => {
    const validationPropsFieldChanged = validationPropsField.onValueChanged(value => {
      setValidState(checkValid(value));
    });

    return validationPropsFieldChanged;
  }, [validationPropsField]);

  return (
    <>
      {!isValid && <ValidationMessage>{Object.keys(validationProps).map(key => (
          !validationProps[key] && <div key={key}>{sdk.contentType.fields.find(element => element.id === key).name} is invalid.</div>
      ))}</ValidationMessage>}
      {isValid && <Note noteType="positive">Custom validation looks good!</Note>}
    </>
  )
}

function checkValid(fields) {
  if (!fields) return false;

  if (Object.values(fields).indexOf(false) !== -1) return false;

  return true;
}

ValidatedJSON.propTypes = {
  sdk: PropTypes.object
};
