const NODE_COUNT = 30;

const getArray = n => Array.from(Array(n).keys());

const randomNumber = n => Math.floor(Math.random() * n);

const getRandom = range => range[randomNumber(range.length)];

const loremIpsum = 'lorem ipsum dolor sit amet consectetur adipiscing elit vestibulum id turpis nunc nulla vitae diam dignissim fermentum elit sit amet viverra libero quisque condimentum pellentesque convallis sed consequat neque ac rhoncus finibus'.split(
  ' '
);

const randomName = (n, join = '_') =>
  getArray(n)
    .map(() => getRandom(loremIpsum))
    .join(join);

const generateRandomData = () => {
  const layers = [
    'Raw',
    'Intermediate',
    'Primary',
    'Feature',
    'Model Input',
    'Model Output'
  ].map((name, id) => ({ id, name }));

  const makeNode = type => id => {
    let r = randomName(Math.ceil(Math.random() * 10));
    if (Math.random() < 0.05) {
      r = 'parameters_' + r;
    }
    return {
      id: r + '-' + id,
      name: r.replace(/_/g, ' '),
      layer: getRandom(layers),
      type
    };
  };

  let nodes = getArray(NODE_COUNT).map(makeNode('data'));

  let edges = nodes.map((source, i) => {
    const targets = nodes.filter(
      d => d.id !== source.id && d.layer.id > source.layer.id
    );
    if (targets.length) {
      return {
        source,
        target: getRandom(targets)
      };
    }
    return {
      target: source,
      source: getRandom(nodes.filter(d => source.id !== d.id))
    };
  });

  edges.forEach(edge => {
    if (Math.random() > 0.5) {
      // Half the time, if there is already a node linking to that dataset,
      // join to its node
      const matchingEdge = edges.find(
        d => d.target.id === edge.target.id && d.source.type === 'task'
      );
      if (matchingEdge) {
        edges.push({
          source: edge.source,
          target: matchingEdge.source
        });
        return;
      }
    }
    const midWayNode = makeNode('task')(nodes.length);
    nodes.push(midWayNode);
    edges.push({
      source: edge.source,
      target: midWayNode
    });
    edges.push({
      source: midWayNode,
      target: edge.target
    });
  });

  edges.forEach(d => {
    if (d.source.type === 'task') {
      edges.forEach(dd => {
        if (dd.target.type === 'task' && dd.source.id === d.target.id) {
          edges.push({
            source: d.source,
            target: dd.target
          });
        }
      });
    }
  });

  const json_schema = nodes.filter(d => d.type === 'task').map(node => ({
    inputs: edges.filter(d => d.target.id === node.id)
      .map(d => d.source.id),
    name: node.id,
    outputs: edges.filter(d => d.source.id === node.id)
      .map(d => d.target.id),
  }));

  return {
    kernel_ai_schema_id: randomNumber(999999999999999),
    message: randomName(5, ' '),
    created_ts: new Date().getTime() - randomNumber(9999999999),
    layers,
    json_schema,
    nodes,
    edges
  };
};

export const generateRandomDataArray = (n = 30) =>
  getArray(randomNumber(n) + 1)
    .map(generateRandomData)
    .sort((a, b) => b.created_ts - a.created_ts);

export default generateRandomData;
