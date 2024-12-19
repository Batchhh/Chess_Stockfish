/**
 * Chess board interface module.
 * Provides utilities for interacting with the web chess board component.
 * @module board
 */

import { Classification, classificationColorMap } from "./classification";

export interface ChessGame {
  turn: () => string;
  getFEN: () => string;

  // Allow `move` to accept either a string or an object with specific properties
  move: (
    move: string | { from: string; to: string; promotion?: string }
  ) => void;

  agreeDraw: () => void;
  getPlayingAs: () => number | null; // Gets the player color as a number (1 for white, 2 for black)

  markings: {
    removeAll: () => void;
    addOne: (marking: {
      type: string;
      data: {
        color: string;
        square?: string;
        from?: string;
        to?: string;
      };
    }) => void;
    removeOne: any;
  };

  getJCEGameCopy: () => {
    threats: () => {
      pins: string[];
      undefended: string[];
      underdefended: string[];
      mates: string[];
    };
  };

  // New method to get position information, including game over status
  getPositionInfo: () => {
    gameOver: boolean; // Indicates whether the game is over
    // Additional properties can be added here if needed
    // check: boolean; // Indicates if there's a check
    // checkmate: boolean; // Indicates if it's checkmate
    // stalemate: boolean; // Indicates if it's stalemate
  };
}



export interface Marking {
  type: string,
  data: {
    color: string,
    from: string,
    to: string
  }
}

/**
 * Retrieves the chess board element and game interface.
 * @returns {Object|null} Chess board interface or null if not found
 */
export function getBoard(): { game: ChessGame } | null {
  const chessBoardElement = document.querySelector("wc-chess-board") as {
    game: ChessGame;
  } | null;
  return chessBoardElement;
}

/**
 * Checks if it's the current player's turn to move.
 * @returns {boolean} True if it's the player's turn
 */
export function isMyTurn(): boolean {
  const FEN = getBoard()?.game.getFEN() || null;
  if (!FEN) return false;
  const playingAs = getBoard()?.game.getPlayingAs();
  const playerColor = playingAs === 1 ? "w" : playingAs === 2 ? "b" : null;
  return playerColor === null || FEN.split(" ")[1] === playerColor;
}

let lastMark: Marking;

/**
 * Creates an arrow marking on the chess board.
 * @param {string} from - Starting square
 * @param {string} to - Target square
 * @param {Classification} classification - Move classification type
 */
export function createMark(from: string, to: string, classification: Classification) {

  if (isMyTurn()) {
    if (lastMark) getBoard()?.game.markings.removeOne(lastMark);

    const color = classificationColorMap[classification] || "#000000";

    lastMark = {
      type: "arrow",
      data: {
        color,
        from,
        to,
      },
    };

    getBoard()?.game.markings.addOne(lastMark);

  } else {
    getBoard()?.game.markings.removeAll();
  }

}
