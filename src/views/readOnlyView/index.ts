/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Read-Only View - Index
 * Exports the read-only view component and registration
 */

import React from 'react';
import { ReadOnlyView } from './ReadOnlyView';
import type { DefaultView } from '../../api/ui/views/types';

export const readOnlyViewConfig: DefaultView = {
  id: 'readOnly',
  name: 'Read-Only View',
  render: (props) => React.createElement(ReadOnlyView, props),
};

// TODO: Export view registration for easy import
export { ReadOnlyView };