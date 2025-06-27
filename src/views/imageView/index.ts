/**
 * @fileoverview
 * @author @jarenm1
 * 
 * Image View - Index
 * Exports the image view component and registration
 */

import React from 'react';
import { ImageView } from './ImageView';
import type { DefaultView } from '../../api/ui/views/types';

export const imageViewConfig: DefaultView = {
  id: 'imageView',
  name: 'Image Viewer',
  render: (props) => React.createElement(ImageView, props),
};

// TODO: Export view component for direct use
export { ImageView }; 