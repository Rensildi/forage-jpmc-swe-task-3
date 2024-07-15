import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;


    // Implementing one main line tracking the ratio of two stocks, as well as upper and lower bounds
    // Adding ratio field
    // Adding upper_bound and lower_bound to track
    // The moment these bounds are crossed there will be a 'trigger_alert'
    // Since everything is being tracked with respect to time, a timestamp field is needed
    const schema = {
      //Edited
      /**
       * Previous
       * // stock: 'string',
      // top_ask_price: 'float',
      // top_bid_price: 'float',
      // timestamp: 'date',
      // upper_bound: 'float',
      // lower_bound: 'float',
      // trigger_alert: 'float',
       */

      // Updated
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      
      // To configure the graph, modifying/adding more attributes to the element.
      /**
       * 1. 'view' is the kind of graph that we want to visualize the data with. Initially, is set to y_line
       * 2. 'column-pivots' used to exist and was what allowed to distinguish / split stock ABC with DEF back in task 2. I removed this becasue the task is concerened about the ratios between the two stocks and not their separate prices
       * 3. 'row-pivots' takes care of x-axis. This allows us to map each datapoint based on its timestamp. Without it, x-axis would be blank.
       * 4. 'columns' is what allows us to focus on a particular part of a datapoint's data along the y-axis. Without it, the graph would plot all the filed sand values of each datapoint, yielding significatn noise.
       *     We want to track ratio, lower_bound, upper_bound, and trigger_alert.
       * 5. 'aggregates' allows to handle the duplicate data we observed in task 2 and consolidate them into one data point.
       *     In our task we only want to consider a data point unique if it has a timestamp.
       *     Otherwise, we'll average the values of the other non-unique fields similar data points share before treating them as one.
       */
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }


  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
