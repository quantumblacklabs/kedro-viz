//--- Config variables ---//

const DATA_NODE_COUNT = 30;
const TASK_NODE_COUNT = 10;
const MAX_LAYER_COUNT = 20;
const MAX_CONNECTED_NODES = 4;
const PARAMETERS_FREQUENCY = 0.05;
const LOREM_IPSUM = 'lorem ipsum dolor sit amet consectetur adipiscing elit vestibulum id turpis nunc nulla vitae diam dignissim fermentum elit sit amet viverra libero quisque condimentum pellentesque convallis sed consequat neque ac rhoncus finibus'.split(' ');

//--- Utility functions ---//

// Get a random array of numbers
const getArray = n => Array.from(Array(n).keys());

// Get a random number between 0 to n-1, inclusive
const randomIndex = n => Math.floor(Math.random() * n);

// Get a random number between 1 to n, inclusive
const randomNumber = n => Math.ceil(Math.random() * n);

// Get a random datum from an array
const getRandom = range => range[randomIndex(range.length)];

// Get a random datum from an array that matches a filter condition
const getRandomMatch = (array, condition) => getRandom(array.filter(condition));

// Generate a random name
const getRandomName = (n, join = '_') => getArray(n)
  .map(() => getRandom(LOREM_IPSUM))
  .join(join);

// Filter duplicate values from an array
const unique = (d, i, arr) => arr.indexOf(d) === i;

/**
 * Generate a random pipeline snapshot dataset
 */
class Snapshot {
  constructor() {
    this.LAYER_COUNT = randomNumber(MAX_LAYER_COUNT);
    this.CONNECTION_COUNT = randomNumber(MAX_CONNECTED_NODES);
    this.nodes = this.getNodes();
  }

  getRandomNodeName() {
    const params = Math.random() < PARAMETERS_FREQUENCY ? 'parameters_' : '';
    const name = getRandomName(randomNumber(10));
    return params + name;
  }

  generateNodeList(count, getLayer) {
    return getArray(count)
      .map(this.getRandomNodeName)
      .filter(unique)
      .map(id => ({
        id,
        layer: getLayer()
      }));
  }

  getNodes() {
    return {
      data: this.generateNodeList(
        DATA_NODE_COUNT,
        () => randomIndex(this.LAYER_COUNT + 1)
      ),
      task: this.generateNodeList(
        TASK_NODE_COUNT,
        () => randomIndex(this.LAYER_COUNT) + 0.5
      ),
    };
  }

  getConnectedNodes(condition) {
    return getArray(this.CONNECTION_COUNT)
      .map(() => getRandomMatch(this.nodes.data, condition))
      .filter(Boolean)
      .map(d => d.id)
      .filter(unique);
  }

  getSchema() {
    return this.nodes.task.map(node => ({
      inputs: this.getConnectedNodes(d => d.layer < node.layer),
      name: node.id,
      outputs: this.getConnectedNodes(d => d.layer > node.layer)
    }));
  }

  getDatum() {
    return {
      kernel_ai_schema_id: randomNumber(999999999999999),
      message: getRandomName(randomNumber(15), ' '),
      created_ts: new Date().getTime() - randomNumber(9999999999),
      json_schema: this.getSchema()
    };
  }
};

const generateRandomHistory = (n = 40) =>
  getArray(randomNumber(n))
    .map(() => new Snapshot().getDatum())
    .sort((a, b) => b.created_ts - a.created_ts);

export default generateRandomHistory;
