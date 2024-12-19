export interface StockfishWorker {
  postMessage(message: any): void;
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
}

export interface Evaluation {
  type: "cp" | "mate";
  value: number;
}

export interface EngineLine {
  id: number;
  depth: number;
  evaluation: Evaluation;
  moveUCI: string;
  moveSAN?: string;
  promotion?: string;
}
