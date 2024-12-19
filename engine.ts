import { StockfishWorker, Evaluation, EngineLine } from './types/Engine';

declare function STOCKFISH(): StockfishWorker;

/**
 * Stockfish chess engine wrapper module.
 * Handles communication with the Stockfish WebAssembly instance.
 * @module engine
 */

class Stockfish {
  private worker: StockfishWorker;
  /** Maximum search depth for position analysis */
  public depth: number = 20;
  /** Engine ELO rating limit */
  public elo: number = 2200;
  /** Engine skill level (0-20) */
  public skill: number = 20;

  /**
   * Initializes Stockfish engine with default settings.
   */
  constructor() {
    this.worker = STOCKFISH();
    this.defaultCommands();

    this.worker.onerror = (event) => {
      console.log(`Problem with stockfish: ${event.message}`);
    };
  }

  /**
   * Sends initial UCI configuration commands to engine.
   */
  public defaultCommands(): void {
    this.worker.postMessage("uci");
    this.worker.postMessage("setoption name MultiPV value 1");
    this.worker.postMessage("setoption name Hash value 256");
    this.worker.postMessage("setoption name Ponder value true");
  }

  /**
   * Evaluates a chess position at specified depth.
   * @param {string} FEN - Position in FEN notation
   * @param {number} targetDepth - Desired analysis depth
   * @returns {Promise<EngineLine[]>} Analysis results
   */
  public evaluate(FEN: string, targetDepth: number): Promise<EngineLine[]> {
    this.worker.postMessage("position fen " + FEN);
    this.worker.postMessage("go depth " + targetDepth);

    const messages: string[] = [];
    const lines: EngineLine[] = [];

    return new Promise((resolve) => {
      this.worker.onmessage = (message: any) => {
        messages.unshift(message);

        let latestDepth = parseInt(
          message.match(/(?:depth )(\d+)/)?.[1] || "0"
        );
        this.depth = Math.max(latestDepth, this.depth);

        if (message.startsWith("bestmove") || message.includes("depth 0")) {
          let searchMessages = messages.filter((msg) =>
            msg.startsWith("info depth")
          );

          let promotionMatch = message.match(
            /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/
          );

          for (let searchMessage of searchMessages) {
            let idString = searchMessage?.match(/(?:multipv )(\d+)/)?.[1];
            let depthString = searchMessage?.match(/(?:depth )(\d+)/)?.[1];
            let moveUCI = searchMessage?.match(/(?: pv )(.+?)(?= |$)/)?.[1];
            let evaluation: Evaluation = {
              type: searchMessage.includes(" cp ") ? "cp" : "mate",
              value: parseInt(
                searchMessage?.match(/(?:(?:cp )|(?:mate ))([\d-]+)/)?.[1] || "0"
              ),
            };

            if (FEN.includes(" b ")) {
              evaluation.value *= -1; // Negate value for Black's turn
            }

            if (!idString || !depthString || !moveUCI) continue;

            let id = parseInt(idString);
            let currDepth = parseInt(depthString);

            if (currDepth !== targetDepth || lines.some((line) => line.id === id)) {
              continue;
            }

            lines.push({
              id,
              depth: currDepth,
              evaluation,
              moveUCI,
              moveSAN: moveUCI.substring(2, 4),
              promotion: promotionMatch[3] || undefined
            });
          }

          resolve(lines);
        }
      };
    });
  }
}

export default Stockfish;
