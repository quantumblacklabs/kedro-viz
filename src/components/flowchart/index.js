import React, { Component } from 'react';
import 'd3-transition';
import { select, event } from 'd3-selection';
import { curveBasis, line } from 'd3-shape';
// import { scaleOrdinal } from 'd3-scale';
import { zoom, zoomIdentity } from 'd3-zoom';
import dagre from 'dagre';
import imgCog from './cog.svg';
import imgDatabase from './database.svg';
import './flowchart.css';

/**
 * Get unique, reproducible ID for each edge, based on its nodes
 * @param {Object} edge - An edge datum
 */
const edgeID = edge => [edge.source.id, edge.target.id].join('-');

const DURATION = 777;

class FlowChart extends Component {
  constructor(props) {
    super(props);
    this.setChartHeight = this.setChartHeight.bind(this);
  }

  componentDidMount() {
    // Select d3 elements
    this.el = {
      svg: select(this._svg),
      inner: select(this._gInner),
      edgeGroup: select(this._gEdges),
      nodeGroup: select(this._gNodes),
      tooltip: select(this._tooltip)
    };

    this.setChartHeight();
    window.addEventListener('resize', this.setChartHeight);
    this.initZoomBehaviour();
    this.getLayout();
    this.drawChart();
    this.zoomChart();
    this.checkNodeCount();
  }

  componentWillUnmount() {
    document.removeEventListener('resize', this.setChartHeight);
  }

  componentDidUpdate(prevProps) {
    const rezoom = prevProps.textLabels !== this.props.textLabels;
    const updateView = prevProps.view !== this.props.view;

    if (rezoom || updateView || this.checkNodeCount()) {
      this.getLayout();
    }

    this.drawChart();

    if (rezoom || updateView) {
      this.zoomChart(true);
    }
  }

  setChartHeight() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.el.svg.attr('width', this.width).attr('height', this.height);
  }

  initZoomBehaviour() {
    this.zoomBehaviour = zoom().on('zoom', () => {
      this.el.inner.attr('transform', event.transform);
    });
    this.el.svg.call(this.zoomBehaviour);
  }

  /**
   * Calculate node/edge positoning, using dagre layout algorithm.
   * This is expensive and should only be run if the layout needs changing,
   * but not when just highlighting active nodes.
   */
  getLayout() {
    const { data, textLabels } = this.props;

    this.graph = new dagre.graphlib.Graph().setGraph({
      marginx: 40,
      marginy: 40
    });

    // Temporarily append text element to the DOM, to measure its width
    const textWidth = (name, padding) => {
      const text = this.el.nodeGroup.append('text').text(name);
      const bbox = text.node().getBBox();
      text.remove();
      return bbox.width + padding;
    };

    data.nodes.forEach(d => {
      if (!this.filter().node(d)) {
        return;
      }

      const nodeWidth = d.type === 'data' ? 50 : 40;

      this.graph.setNode(d.id, {
        ...d,
        label: d.name,
        width: textLabels ? textWidth(d.name, nodeWidth) : nodeWidth,
        height: nodeWidth
      });
    });

    data.edges.forEach(d => {
      if (!this.filter().edge(d)) {
        return;
      }
      this.graph.setEdge(d.source.id, d.target.id, {
        source: d.source,
        target: d.target
      });
    });

    // Run Dagre layout to calculate X/Y positioning
    dagre.layout(this.graph);

    // Map to objects
    this.layout = {
      nodes: this.graph
        .nodes()
        .map(d => this.graph.node(d))
        .reduce((nodes, node) => {
          nodes[node.id] = node;
          return nodes;
        }, {}),

      edges: this.graph.edges().reduce((edges, d) => {
        const edge = this.graph.edge(d);
        edge.id = edgeID(edge);
        edges[edge.id] = edge;
        return edges;
      }, {})
    };
  }

  /**
   * Keep a count of the number of nodes on screen,
   * and return true if the number of visible nodes has changed,
   * indicating that the dagre layout should be updated
   */
  checkNodeCount() {
    const newNodeCount = this.props.data.nodes.filter(d => !d.disabled).length;
    if (newNodeCount !== this.nodeCount) {
      this.nodeCount = newNodeCount;
      return true;
    }
    return false;
  }

  /**
   * Zoom and scale to fit
   * @param {Boolean} isUpdate - Whether chart is updating and should be animated
   */
  zoomChart(isUpdate) {
    const { width, height } = this.graph.graph();
    const zoomScale = Math.min(this.width / width, this.height / height);
    const translateX = this.width / 2 - width * zoomScale / 2;
    const translateY = this.height / 2 - height * zoomScale / 2;
    const svgZoom = isUpdate
      ? this.el.svg.transition().duration(DURATION)
      : this.el.svg;
    svgZoom.call(
      this.zoomBehaviour.transform,
      zoomIdentity.translate(translateX, translateY).scale(zoomScale)
    );
  }

  filter() {
    return {
      edge: d => {
        if (d.source.disabled || d.target.disabled) {
          return false;
        }
        const { view } = this.props;
        if (view === 'combined') {
          return d.source.type !== d.target.type;
        }
        return view === d.source.type && view === d.target.type;
      },
      node: d => {
        if (d.disabled) {
          return false;
        }
        const { view } = this.props;
        return view === 'combined' || view === d.type;
      }
    };
  }

  /**
   * Combine dagre layout with updated data from props
   */
  prepareData() {
    const { data } = this.props;

    return {
      edges: data.edges.filter(this.filter().edge).map(d => ({
        ...this.layout.edges[edgeID(d)],
        ...d
      })),

      nodes: data.nodes.filter(this.filter().node).map(d => ({
        ...this.layout.nodes[d.id],
        ...d
      }))
    };
  }

  drawChart() {
    const { onNodeUpdate, textLabels } = this.props;
    const data = this.prepareData();

    // Create selections
    this.el.edges = this.el.edgeGroup
      .selectAll('.edge')
      .data(data.edges, d => d.id);

    this.el.nodes = this.el.nodeGroup
      .selectAll('.node')
      .data(data.nodes, d => d.id);

    // Create arrowhead marker
    this.el.edgeGroup
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('class', 'flowchart__arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 7)
      .attr('refY', 5)
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', 8)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 L 4 5 z');

    // Set up line shape function
    const lineShape = line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveBasis);

    // Create edges
    const enterEdges = this.el.edges
      .enter()
      .append('g')
      .attr('class', 'edge');

    enterEdges
      .append('path')
      .attr('marker-end', d => `url(#arrowhead)`)
      .attr('d', d => lineShape(d.points));

    this.el.edges.exit().remove();

    this.el.edges = this.el.edges.merge(enterEdges);

    this.el.edges
      .select('path')
      .transition()
      .duration(DURATION)
      .attr('d', d => lineShape(d.points));

    // Create nodes
    const enterNodes = this.el.nodes
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    enterNodes.append('circle').attr('r', 25);

    enterNodes.append('rect');

    const imageSize = d => Math.round(d.height * 0.36);

    enterNodes
      .append('image')
      .attr('xlink:href', d => (d.type === 'data' ? imgDatabase : imgCog))
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('x', d => imageSize(d) / -2)
      .attr('y', d => imageSize(d) / -2)
      .attr('alt', d => d.name);

    enterNodes
      .append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 5);

    this.el.nodes.exit().remove();

    this.el.nodes = this.el.nodes
      .merge(enterNodes)
      .classed('node--data', d => d.type === 'data')
      .classed('node--task', d => d.type === 'task')
      .classed('node--icon', !textLabels)
      .classed('node--text', textLabels)
      .classed('node--active', d => d.active)
      .on('mouseover', d => {
        onNodeUpdate(d.id, 'active', true);
        this.tooltip().show(d);
        this.linkedNodes().show(d);
      })
      .on('mousemove', d => {
        this.tooltip().show(d);
      })
      .on('mouseout', d => {
        onNodeUpdate(d.id, 'active', false);
        this.linkedNodes().hide(d);
        this.tooltip().hide(d);
      });

    this.el.nodes
      .transition()
      .duration(DURATION)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    this.el.nodes
      .select('rect')
      .attr('width', d => d.width - 5)
      .attr('height', d => d.height - 5)
      .attr('x', d => (d.width - 5) / -2)
      .attr('y', d => (d.height - 5) / -2)
      .attr('rx', d => (d.type === 'data' ? d.height / 2 : 0));
  }

  /**
   * Provide methods to show/hide the tooltip
   */
  tooltip() {
    const { tooltip } = this.el;

    return {
      show: d => {
        const { clientX, clientY } = event;
        const isRight = clientX > this.width / 2;
        const x = isRight ? clientX - this.width : clientX;
        tooltip
          .classed('tooltip--visible', true)
          .classed('tooltip--right', isRight)
          .html(`<b>${d.name}</b><small>${d.layer.name}</small>`)
          .style('transform', `translate(${x}px, ${clientY}px)`);
      },

      hide: () => {
        tooltip.classed('tooltip--visible', false);
      }
    };
  }

  /**
   * Provide methods to highlight linked nodes on hover,
   * and fade non-linked nodes
   */
  linkedNodes() {
    const { nodes, edges } = this.el;

    return {
      show: ({ id }) => {
        const linkedNodes = this.getLinkedNodes(id);
        const nodeIsLinked = d => linkedNodes.includes(d.id) || d.id === id;

        nodes
          .classed('node--active', nodeIsLinked)
          .classed('node--faded', d => !nodeIsLinked(d));

        edges.classed('edge--faded', ({ source, target }) =>
          [source, target].some(d => !nodeIsLinked(d))
        );
      },

      hide: () => {
        edges.classed('edge--faded', false);
        nodes.classed('node--active', false).classed('node--faded', false);
      }
    };
  }

  getLinkedNodes(nodeID) {
    const { edges } = this.props.data;
    const linkedNodes = [];

    (function getParents(id) {
      edges.filter(d => d.target.id === id).forEach(d => {
        linkedNodes.push(d.source.id);
        getParents(d.source.id);
      });
    })(+nodeID);

    (function getChildren(id) {
      edges.filter(d => d.source.id === id).forEach(d => {
        linkedNodes.push(d.target.id);
        getChildren(d.target.id);
      });
    })(+nodeID);

    return linkedNodes;
  }

  render() {
    return (
      <div className="flowchart">
        <svg className="flowchart__graph" ref={el => (this._svg = el)}>
          <g ref={el => (this._gInner = el)}>
            <g className="flowchart__edges" ref={el => (this._gEdges = el)} />
            <g className="flowchart__nodes" ref={el => (this._gNodes = el)} />
          </g>
        </svg>
        <div className="flowchart__tooltip" ref={el => (this._tooltip = el)} />
      </div>
    );
  }
}

export default FlowChart;
