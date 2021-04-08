const light = {
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
          size: 16,
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
  paper_bgcolor: 'rgba(0, 0, 0, 0)',
  plot_bgcolor: 'rgba(0, 0, 0, 0)',
  title: {
    font: {
      family: 'Titillium+Web:400',
      color: 'rgba(0,0,0,0.85)',
      size: 20,
    },
    xref: 'paper',
    yref: 'paper',
    x: 0,
    xanchor: 'left',
    yanchor: 'middle',
  },
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

export const light_metadata = {
  ...light,
  title: {
    ...light.title,
    font: {
      ...light.title.font,
      size: 16,
    },
  },
  margin: {
    l: 0,
    r: 10,
    t: 40,
    b: 20,
  },
  xaxis: {
    ...light.xaxis,
    title: {
      ...light.xaxis.title,
      font: {
        ...light.xaxis.font,
        size: 8,
      },
    },
    tickfont: {
      ...light.xaxis.tickfont,
      size: 8,
    },
  },
  yaxis: {
    ...light.yaxis,
    title: {
      ...light.yaxis.title,
      font: {
        ...light.yaxis.font,
        size: 8,
      },
    },
    tickfont: {
      ...light.yaxis.tickfont,
      size: 8,
    },
  },
  height: 200,
  width: 320,
};

export const light_modal = {
  ...light,
};