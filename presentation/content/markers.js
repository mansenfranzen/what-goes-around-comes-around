/* Timeline context. year: negative = BCE.
   DB.markers: world events, drawn as grey milestones (icon: assets/symbols/event-<id>.svg) in two rows above the milestones,
   alternating by year. prio: higher wins when two events need the same place. To add an event, add an entry and its icon.
   DB.timelineYears: the years labelled on the timeline axis, on both scales. */
DB.markers = [
  { id: 'agri',    year: -10000, label: 'Agriculture',          prio: 2 },
  { id: 'writing', year: -3400,  label: 'Writing',              prio: 4 },
  { id: 'press',   year: 1450,   label: 'Printing press',       prio: 2 },
  { id: 'comp',    year: 1945,   label: 'Electronic computers', prio: 3 },
  { id: 'web',     year: 1991,   label: 'World Wide Web',       prio: 2 }
];
DB.timelineYears = [-20000, -5000, 0, 1000, 1900, 1950, 2000];
