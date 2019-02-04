import { select, event } from 'd3-selection';

/**
 * Cog icon, needs to be created like this to support exports
 * in studio ai (which struggles with xlink-hrefs)
 */
export default () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  const g = select(svg)
    .attr('viewBox', '0 0 268.76 268.76')
    .attr('width', '18px')
    .attr('height', '18px')
    .attr('x', `${18 / -2}px`)
    .attr('y', `${18 / -2}px`)
    .append('g')
    .attr('fill', '#fff');

  g.append('path')
    .attr('d', 'M267.92 119.46c-.42-3.78-4.83-6.62-8.64-6.62-12.31 0-23.24-7.23-27.82-18.41a29.93 29.93 0 0 1 7.51-33.23 7.46 7.46 0 0 0 .82-10.13c-6.3-8-13.47-15.24-21.3-21.5a7.48 7.48 0 0 0-10.2.82c-8.01 8.87-22.4 12.17-33.52 7.53a29.85 29.85 0 0 1-18.15-29.18 7.46 7.46 0 0 0-6.6-7.85A134.16 134.16 0 0 0 119.8.81a7.48 7.48 0 0 0-6.65 7.7 29.9 29.9 0 0 1-18.4 28.67c-10.99 4.48-25.28 1.21-33.27-7.58a7.5 7.5 0 0 0-10.14-.85 133.48 133.48 0 0 0-21.74 21.5 7.48 7.48 0 0 0 .8 10.2A29.78 29.78 0 0 1 37.9 94c-4.63 11.04-16.1 18.16-29.24 18.16a7.3 7.3 0 0 0-7.76 6.6 134.62 134.62 0 0 0-.06 30.56c.43 3.8 4.97 6.6 8.82 6.6 11.7-.3 22.93 6.95 27.65 18.42a29.88 29.88 0 0 1-7.52 33.23 7.47 7.47 0 0 0-.81 10.13 133.46 133.46 0 0 0 21.25 21.5 7.47 7.47 0 0 0 10.23-.8c8.04-8.9 22.43-12.19 33.5-7.54a29.8 29.8 0 0 1 18.18 29.17 7.46 7.46 0 0 0 6.6 7.85 133.57 133.57 0 0 0 30.23.08 7.48 7.48 0 0 0 6.66-7.7A29.87 29.87 0 0 1 174 231.6c11.06-4.51 25.29-1.2 33.28 7.58a7.5 7.5 0 0 0 10.14.84 133.79 133.79 0 0 0 21.74-21.49 7.46 7.46 0 0 0-.8-10.21 29.78 29.78 0 0 1-7.53-33.53 30.09 30.09 0 0 1 27.5-18.21l1.66.04a7.48 7.48 0 0 0 7.86-6.59 134.5 134.5 0 0 0 .06-30.56zM134.59 179.5a44.87 44.87 0 0 1-44.82-44.82 44.87 44.87 0 0 1 44.83-44.83 44.87 44.87 0 0 1 44.82 44.83 44.87 44.87 0 0 1-44.82 44.82z')

  return svg
}
