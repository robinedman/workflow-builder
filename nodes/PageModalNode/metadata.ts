import type { NodeMetadata } from '../types';
import { MonitorPlay } from 'lucide-react';

export const metadata: NodeMetadata = {
  type: 'pageModal',
  label: 'Page Modal',
  description: 'Display output in a modal overlay on the page',
  category: 'output',
  icon: MonitorPlay,
  color: '#66BB6A',
  defaultConfig: {},
};

