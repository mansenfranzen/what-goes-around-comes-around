/* Vertical markers on the timeline. year: negative = BCE. prio: higher wins when labels collide.
   Edit this file to add/remove markers; no other file needs to change. */
DB.markers = [
  { id: 'agri',    year: -10000, label: 'Agriculture',          prio: 2 },
  { id: 'writing', year: -3400,  label: 'Writing',              prio: 4 },
  { id: 'zero',    year: 0,      label: '0 · BCE | CE',         prio: 5, strong: true },
  { id: 'press',   year: 1450,   label: 'Printing press',       prio: 2 },
  { id: 'comp',    year: 1945,   label: 'Electronic computers', prio: 3 },
  { id: 'web',     year: 1991,   label: 'World Wide Web',       prio: 2 }
];
