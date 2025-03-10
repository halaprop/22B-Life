
// to do - export this from a file
class MyClass {
  constructor(params) {
      this.params = params;
  }

  compute(params) {
      // Example: add a value to the stored params
      return { result: this.params.value + params.value };
  }
}

let instance = null;

self.onmessage = async (event) => {
    const { command, params } = event.data;

    try {
        if (command === 'create') {
            instance = new MyClass(params);
            postMessage({ status: 'ok' });
        } else if (command === 'compute') {
            if (!instance) {
                throw new Error("Instance not created yet.");
            }
            const result = instance.compute(params);
            postMessage({ status: 'ok', result });
        } else {
            throw new Error("Unknown command");
        }
    } catch (error) {
        postMessage({ status: 'error', error: { message: error.message } });
    }
};


