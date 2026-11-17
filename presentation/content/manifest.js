/* Single source of truth for WHAT is in the presentation and in which ORDER.
   - milestones: slugs "NN-name". For each slug the loader expects (missing files are tolerated):
       content/milestones/<slug>.js   copy + metadata     (DB.addMilestone)
       js/games/<slug>.js             mini game           (DB.addGame)
       css/games/<slug>.css           game styles, scoped to .game-<NN>
       assets/symbols/<slug>.svg      hand-made symbol
       assets/images/<slug>.<ext>     real image, declared in content/images.js
   - views: one js/views/<v>.js + css/views/<v>.css each (landing -> timeline -> milestone/transition -> bigpicture). */
window.DB = window.DB || {};
DB.manifest = {
  views: ['landing', 'timeline', 'milestone', 'transition', 'bigpicture'],
  milestones: [
    '01-tally-bone',
    '02-clay-tokens',
    '03-clay-tablet',
    '04-pinakes',
    '05-card-catalog',
    '06-punch-cards',
    '07-ramac-disk',
    '08-ims',
    '09-codasyl',
    '10-relational',
    '11-sql',
    '12-arrays',
    '13-objects',
    '14-mapreduce',
    '15-bigtable',
    '16-columnar',
    '17-key-value',
    '18-graph',
    '19-documents',
    '20-blockchain',
    '21-cloud',
    '22-vectors',
    '23-sql-absorbs'
  ]
};
