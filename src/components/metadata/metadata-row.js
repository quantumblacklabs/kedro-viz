import React from 'react';
import MetaDataList from './metadata-list';
import MetaDataValue from './metadata-value';
import './styles/metadata.css';

/**
 * Shows metadata label and a given single value, or a list of values, or child elements
 */
const MetaDataRow = ({
  label,
  property,
  value,
  kind = 'text',
  empty = '-',
  visible = true,
  inline = true,
  commas = true,
  children
}) => {
  const showList = Array.isArray(value) && value.length;
  const showValue = !showList && typeof value !== 'undefined';

  return (
    visible && (
      <div className="pipeline-metadata__row">
        <h3 className="pipeline-metadata__label">{label}</h3>
        {showList && (
          <MetaDataList
            property={property}
            inline={inline}
            commas={commas}
            kind={kind}
            empty={empty}
            values={value}
          />
        )}
        {showValue && <MetaDataValue value={value} kind={kind} empty={empty} />}
        {children}
      </div>
    )
  );
};

export default MetaDataRow;
