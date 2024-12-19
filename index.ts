/**
 * Main entry point for the chess analysis application.
 * Handles initialization of Stockfish engine and game state management.
 * @module index
 */

import Stockfish from "./engine";
import { EvaluatedPosition } from "./types/Position";
import analyse from "./analysis";
import { createMark, getBoard } from "./board";
import { Classification } from "./classification";
import Queue from "./autoqueue";
import ControlPanel from "./UI/ControlPanel";

declare global {
    interface Window {
        main: Main;
    }
}

/**
 * Main application class that coordinates chess analysis and automated gameplay.
 */
class Main {
    /** Stockfish chess engine instance */
    public stockfish: Stockfish = new Stockfish();

    /** History of evaluated chess positions */
    public positions: EvaluatedPosition[] = [];

    /** Most recently analyzed FEN position */
    public lastKnownFEN: string = "";

    /** Whether to display move suggestions on the board */
    public marking: Boolean = false;

    /** Whether to automatically play the best move */
    public autoMove: Boolean = false;

    /** Whether to automatically join new games */
    public autoQueue: Boolean = false;

    /** Control panel instance */
    public controlPanel: ControlPanel | null = null;

    /**
     * Analyzes the current position and optionally makes the best move.
     * @param {string} FEN - Forsyth–Edwards Notation of current position
     * @param {number} depth - Search depth for engine analysis
     */
    public getBestMove(FEN: string): void {
        const randomDelay = this.controlPanel?.getRandomDelay() || 1000;
        const depth = this.controlPanel?.getDepth() || 15;
        // Chiamata a Stockfish per ottenere le mosse più forti
        this.stockfish.evaluate(FEN, depth).then((lines) => {
            for (let line of lines) {

                const analyseMove = analyse(line.evaluation) || null;
                const from = line.moveUCI.substring(0, 2);
                const to = line.moveUCI.substring(2, 4);

                if (this.marking) createMark(from, to, analyseMove ? analyseMove : Classification.BOOK);

                // Log della mossa e della valutazione
                console.log(`[STOCKFISH] Calculated move: ${line.moveUCI}, Evaluation: ${line.evaluation.type} ${line.evaluation.value}`);

                // Update the calculated move in the control panel
                this.controlPanel?.updateCalculatedMove(line.moveUCI, line.evaluation.type, randomDelay);
            }

            if (this.autoMove && lines.length > 0) {
                const bestLine = lines[0];
                const from = bestLine.moveUCI.substring(0, 2);
                const to = bestLine.moveUCI.substring(2, 4);
                const promotion = bestLine.promotion || "";
                const automove = {
                    from,
                    to,
                    promotion,
                    animate: false,
                    userGenerated: true
                };

                setTimeout(() => {
                    getBoard()?.game.move(automove);
                }, randomDelay);
            }
        }).catch(err => {
            console.error("Error evaluating the move:", err);
        });
    }

    /**
     * Main render loop that monitors the board state and triggers analysis.
     * Runs every 20ms to check for position changes.
     */
    public render(): void {

        const renderloop = () => {

            if (this.autoQueue) Queue.JoinGame();

            const FEN: string | undefined = getBoard()?.game.getFEN();
            if (!FEN) return;

            if (FEN === this.lastKnownFEN) return;

            this.getBestMove(FEN);

            this.lastKnownFEN = FEN;

        };

        setInterval(renderloop, 20);
    }
}


window.addEventListener('load', () => {
    window.main = new Main();
    window.main.controlPanel = new ControlPanel();
    window.main.render();
});
