import { initializeWidget } from '@vikadata/widget-sdk';
import { MapComponent } from './map';

initializeWidget(MapComponent, process.env.WIDGET_PACKAGE_ID!);