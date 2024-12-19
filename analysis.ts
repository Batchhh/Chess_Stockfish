import { Classification } from "./classification";
import { Evaluation } from "./types/Engine";

export default function analyse(evaluation: Evaluation): Classification | undefined {

    if (!evaluation) return undefined;

    const type = evaluation.type;

    if (type === "mate") {
        return Classification.FORCED;
    }

    if (type === "cp") {
        return Classification.BEST;
    }

    return undefined;
}
