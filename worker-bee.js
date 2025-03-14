
// to do - export this from a file
import { SubModel } from "./life-submodel.js";

let instance = null;

self.onmessage = async (event) => {
    const { command, params } = event.data;

    try {
        if (command === 'create') {
            instance = new SubModel(params);
            postMessage({ status: 'ok' });
        } else if (command === 'compute') {
            if (!instance) {
                throw new Error("Instance not created yet.");
            }
            const result = instance.computeNext(params);
            postMessage({ status: 'ok', result });
        } else {
            throw new Error("Unknown command");
        }
    } catch (error) {
        postMessage({ status: 'error', error: { message: error.message } });
    }
};


