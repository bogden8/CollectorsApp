// Shared line-icon set for the Collector app.
// Action glyphs only — collection/category emoji stay as user data.
const S = (p) => (props) => (
  <svg viewBox="0 0 24 24" className={'ic' + (props?.className ? ' ' + props.className : '')}
    fill={p.fill ? 'currentColor' : 'none'} stroke={p.fill ? 'none' : 'currentColor'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {p.d.map((d, i) => <path key={i} d={d} />)}
    {p.c && p.c.map((c, i) => <circle key={'c' + i} cx={c[0]} cy={c[1]} r={c[2]} />)}
  </svg>
)

export const Icon = {
  home:    S({ d: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'] }),
  back:    S({ d: ['M15 5l-7 7 7 7'] }),
  plus:    S({ d: ['M12 5v14M5 12h14'] }),
  search:  S({ d: ['M20 20l-3.6-3.6'], c: [[11, 11, 7]] }),
  star:    S({ fill: true, d: ['M12 3.2l2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.6l1.2-6L3.3 9.5l6.1-.7z'] }),
  edit:    S({ d: ['M4 20h4L19 9l-4-4L4 16v4z', 'M13.5 6.5l4 4'] }),
  trash:   S({ d: ['M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'] }),
  save:    S({ d: ['M5 3h11l3 3v15H5z', 'M8 3v6h7', 'M8 21v-7h8v7'] }),
  chev:    S({ d: ['M9 6l6 6-6 6'] }),
  printer: S({ d: ['M6 9V3h12v6', 'M6 18H4v-7h16v7h-2', 'M8 14h8v7H8z'] }),
  sort:    S({ d: ['M7 4v16M7 20l-3-3M7 4l3 3', 'M17 20V4M17 4l3 3M17 20l-3-3'] }),
  check:   S({ d: ['M5 12.5l4.5 4.5L19 6.5'] }),
  x:       S({ d: ['M6 6l12 12M18 6L6 18'] }),
  download:S({ d: ['M12 4v11M8 11l4 4 4-4', 'M5 20h14'] }),
  upload:  S({ d: ['M12 15V4M8 8l4-4 4 4', 'M5 20h14'] }),
  box:     S({ d: ['M3 8l9-4 9 4-9 4-9-4z', 'M3 8v8l9 4 9-4V8', 'M12 12v8'] }),
  undo:    S({ d: ['M9 7L4 12l5 5', 'M4 12h11a5 5 0 0 1 0 10h-1'] }),
  sparkle: S({ d: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'] }),
  pin:     S({ d: ['M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z'], c: [[12, 10, 2.4]] }),
  camera:  S({ d: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z'], c: [[12, 13, 4]] }),
  qrscan:  S({ d: ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M5 12h14'] }),
  copy:    S({ d: ['M9 9h10v10H9z', 'M5 15V5h10'] }),
  tag:     S({ d: ['M20.59 13.41L11 22l-9-9 8.59-8.59A2 2 0 0 1 12 4h7a1 1 0 0 1 1 1v7a2 2 0 0 1-.41 1.41z'], c: [[15.5, 7.5, 0.5]] }),
  chart:   S({ d: ['M3 3v18h18', 'M7 15l4-5 3 3 5-6'] }),
  grip:    S({ d: ['M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01'] }),
  up:      S({ d: ['M12 19V5M5 12l7-7 7 7'] }),
  down:    S({ d: ['M12 5v14M5 12l7 7 7-7'] }),
}

export default Icon
