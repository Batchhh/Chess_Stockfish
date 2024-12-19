import { ChessGame } from "./board";

const Queue = new (class {

  private requeueLastGamePath: string;
  private requeueAttempts: number;

  constructor() {

    this.requeueLastGamePath = "";
    this.requeueAttempts = 0;
  }

  private get board(): { game: ChessGame } | null {
    const chessBoardElement = document.querySelector("wc-chess-board") as {
      game: ChessGame;
    } | null;
    return chessBoardElement;
  }

  public JoinGame() {

    if (!this.board) return;
    if (!this.board?.game.getPositionInfo().gameOver) return;

    if (this.requeueLastGamePath === "") {
      this.requeueLastGamePath = window.location.pathname;
      this.requeueAttempts = 0;
    } else if (this.requeueLastGamePath !== window.location.pathname) {
      this.requeueLastGamePath = "";
    }

    if (this.requeueLastGamePath === window.location.pathname) {
      try {
        // Use type assertion to specify that the elements are HTML elements
        const tabElement = document.querySelector(
          "div.tabs-tab:nth-child(2)"
        ) as HTMLElement | null;
        const buttonElement = document.querySelector(
          ".create-game-component > button:nth-child(2)"
        ) as HTMLElement | null;

        // Check if the elements are not null before calling click
        if (tabElement) {
          tabElement.click();
        } else {
          throw new Error("Tab element not found");
        }

        if (buttonElement) {
          buttonElement.click();
        } else {
          throw new Error("Button element not found");
        }
        console.log("Joining a game...");
      } catch (error) {
        console.error(error); // Log the error for debugging
        if (this.requeueAttempts > 10) {
          this.requeueLastGamePath = "";
          this.requeueAttempts = 0;
        } else {
          this.requeueAttempts++;
        }
      }
    }
  }
})();

export default Queue;
