import { ServerRespond } from './DataStreamer';

// Update Row interface to match the new schema
export interface Row {
  /**
   * Older Row Interface:
   * // stock: string,
   * // top_ask_price: number,
   * // timestamp: Date,
   */

  // Change is necessary because it determines the structure of the object returned by the generateRow function
  // This return object must correspond to the schema of the table in the Graph component
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bonud: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}



export class DataManipulator {

  /**
   * Editing
   * // Compute price_abc and price_def properly
   * // Compute the ratio using both prices, set lower and upper bounds, and determine trigger_alert.
   */
  static generateRow(serverResponds: ServerRespond[]) {
    // Adding
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;
    const upperBound = 1 + 0.05;
    const lowerBound = 1 - 0.05;
    // Removing
    // return serverResponds.map((el: any) => {
      return {
        // Previous Code
        /**
         * stock: el.stock,
         * top_ask_price: el.top_ask && el.top_ask.price || 0,
         * timestamp: el.timestamp,
         */

        // Adding
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ?
          serverResponds[0].timestamp : serverResponds[1].timestamp,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
    }
  }
