/*
Plotly templates are defined to override user-specified styles with Kedro-viz styles
More details can be found here - https://plotly.com/python/templates/
*/

const lightTemplate = {
  autosize: true,
  annotationdefaults: {
    arrowcolor: '#2a3f5f',
    arrowhead: 0,
    arrowwidth: 1,
  },
  autotypenumbers: 'strict',
  coloraxis: {
    autocolorscale: true,
    colorbar: {
      thickness: 20,
      showticklabels: true,
      ticks: 'outside',
      tickwidth: 1,
      tickcolor: 'rgba(0,0,0,0.30)',
      ticklen: 12,
      tickfont: {
        color: 'rgba(0,0,0,0.55)',
        family: 'Titillium+Web:400',
        size: 12,
      },
      ticklabelposition: 'outside',
      title: {
        font: {
          family: 'Titillium+Web:400',
          color: 'rgba(0,0,0,0.55)',
          size: 12,
        },
      },
    },
  },
  colorscale: {
    diverging: [
      'rgb(230,59,90)',
      'rgb(240,185,186)',
      'rgb(237,212,213)',
      'rgb(232,232,232)',
      'rgb(190,213,236)',
      'rgb(136,192,240)',
      'rgb(0,169,244)',
    ],
    sequential: [
      'rgb(0,169,244)',
      'rgb(60,175,245)',
      'rgb(148,203,250)',
      'rgb(195,225,254)',
      'rgb(214,235,255)',
    ],
    sequentialminus: [
      'rgb(0,169,244)',
      'rgb(60,175,245)',
      'rgb(148,203,250)',
      'rgb(195,225,254)',
      'rgb(214,235,255)',
    ],
  },
  colorway: [
    '#00a9f4',
    '#42459F',
    '#F4973B',
    '#E63B5A',
    '#948DCA',
    '#769D00',
    '#1A2E91',
    '#4F9596',
    '#F7D02A',
    '#F07179',
    '#3C7A34',
    '#B2DFE1',
    '#C1BCE5',
    '#AD544A',
    '#F4973B',
    '#B6CD70',
    '#65A6A8',
    '#F8E979',
  ],
  font: {
    family: 'Titillium+Web:400',
    color: 'rgba(0,0,0,0.55)',
  },
  height: undefined,
  hoverlabel: {
    align: 'left',
  },
  hovermode: 'closest',
  legend: {
    title: {
      font: {
        family: 'Titillium+Web:400',
        color: 'rgba(0,0,0,0.55)',
      },
    },
    font: {
      family: 'Titillium+Web:400',
      color: 'rgba(0,0,0,0.55)',
    },
  },
  mapbox: {
    style: 'light',
  },
  paper_bgcolor: '#EEEEEE',
  plot_bgcolor: '#EEEEEE',
  title: {
    font: {
      family: 'Titillium+Web:400',
      color: 'rgba(0,0,0,0.85)',
      size: 16,
    },
    xref: 'paper',
    yref: 'paper',
    x: 0,
    xanchor: 'left',
    yanchor: 'middle',
  },
  width: undefined,
  xaxis: {
    automargin: true,
    gridcolor: 'rgba(0,0,0,0.12)',
    layer: 'below traces',
    linewidth: 1,
    linecolor: 'rgba(0,0,0,0.30)',
    rangemode: 'normal',
    showline: true,
    showticklabels: true,
    ticks: 'outside',
    tickwidth: 1,
    tickcolor: 'rgba(0,0,0,0.30)',
    ticklen: 12,
    tickfont: {
      color: 'rgba(0,0,0,0.55)',
      family: 'Titillium+Web:400',
      size: 12,
    },
    ticklabelposition: 'outside',
    title: {
      font: {
        family: 'Titillium+Web:400',
        color: 'rgba(0,0,0,0.55)',
        size: 16,
      },
    },
    zerolinecolor: 'rgba(0,0,0,0.30)',
    zerolinewidth: 1,
  },
  yaxis: {
    automargin: true,
    gridcolor: 'rgba(0,0,0,0.12)',
    layer: 'below traces',
    linewidth: 1,
    linecolor: 'rgba(0,0,0,0.30)',
    rangemode: 'normal',
    showline: true,
    showticklabels: true,
    ticks: 'outside',
    tickwidth: 1,
    tickcolor: 'rgba(0,0,0,0.30)',
    ticklen: 12,
    tickfont: {
      color: 'rgba(0,0,0,0.55)',
      family: 'Titillium+Web:400',
      size: 12,
    },
    ticklabelposition: 'outside',
    title: {
      font: {
        family: 'Titillium+Web:400',
        color: 'rgba(0,0,0,0.55)',
        size: 16,
      },
    },
    zerolinecolor: 'rgba(0,0,0,0.30)',
    zerolinewidth: 1,
  },
  margin: {
    l: 72,
    r: 40,
    t: 64,
    b: 72,
  },
};

export const lightPreviewTemplate = {
  ...lightTemplate,
  title: '',
  margin: {
    l: 100,
    r: 40,
    t: 40,
    b: 70,
  },
  xaxis: {
    ...lightTemplate.xaxis,
    title: {
      ...lightTemplate.xaxis.title,
      font: {
        ...lightTemplate.xaxis.font,
        size: 8,
      },
    },
    tickfont: {
      ...lightTemplate.xaxis.tickfont,
      size: 8,
    },
    nticks: 5,
  },
  yaxis: {
    ...lightTemplate.yaxis,
    title: {
      ...lightTemplate.yaxis.title,
      font: {
        ...lightTemplate.yaxis.font,
        size: 8,
      },
    },
    tickfont: {
      ...lightTemplate.yaxis.tickfont,
      size: 8,
    },
    nticks: 5,
  },
  height: 300,
  width: 400,
};

export const lightModalTemplate = {
  ...lightTemplate,
};
