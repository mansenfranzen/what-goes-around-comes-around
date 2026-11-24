/* Bonus "Pitch" slide (after the big picture): why to try DuckDB on commodity compute.
   Step 0 is the hook, steps 1..6 the evidence scenes, the last step the ask; js/views/pitch.js draws each `chart`.
   Chart values are schematic: read off the charts in the cited sources and rounded. Re-check before quoting. */
DB.pitch = {
  kicker: 'Bonus',
  title: 'Pitch',
  subtitle: 'Stop renting clusters for phone-sized queries',
  cite: 'After G. Fraser, “I benchmarked Databricks against my iPhone”, Fivetran, Oct 2026',

  acts: [
    { n: 1, title: 'Our data is small' },
    { n: 2, title: 'Premium compute is a markup' },
    { n: 3, title: 'Proof & momentum' }
  ],

  // One scene per step. `act` groups the rail; `chart` selects the renderer in js/views/pitch.js.
  scenes: [
    {
      chart: 'hook', rail: 'The question', line: 'A phone or an 80-core cluster: which runs TPC-H faster?',
      title: 'Which one answers our queries faster?', sub: 'Same SQL benchmark (TPC-H, 22 queries). Guess before we look.',
      sides: [
        { kind: 'premium', name: 'Databricks Serverless SQL · M', cores: 80, ram: '448 GB RAM', price: '$16.80 / hour' },
        { kind: 'commodity', name: 'DuckDB on an iPhone 17 Pro', cores: 6, ram: '12 GB RAM', price: 'already in your pocket' }
      ],
      takeaway: 'Hold that guess. First: how big are our queries, really?',
      source: 'Cluster specs and prices: Fraser (Fivetran, 2026)'
    },
    {
      act: 1, chart: 'sizes', rail: 'Most queries are small', line: 'Median ≈ 100 MB · 99.9 % scan ≤ 300 GB',
      title: 'Most queries are small', sub: 'Data scanned per query in real Snowflake and Redshift workloads (share of queries)',
      // [lower bound of the doubling bin in MB, % of queries]
      bins: [[1, 2.0], [2, 3.2], [4, 4.9], [8, 6.0], [16, 9.5], [32, 14.5], [64, 13.2], [128, 12.6], [256, 11.0], [512, 11.2],
        [1024, 5.3], [2048, 3.1], [4096, 1.3], [8192, 0.7], [16384, 0.4], [32768, 0.2], [65536, 0.1]],
      median: 100, p999: 300000, vendor: 100000000,
      takeaway: '99.9 % of real queries could run on a single large machine.',
      source: 'Snowset + Redset query samples, analysed by Fraser (Fivetran, 2024); bars schematic'
    },
    {
      act: 1, chart: 'capacity', rail: 'One machine is enough', line: 'Largest EC2 machine: 1.7 GB → 32 TiB of RAM',
      title: 'One rentable machine grew ≈ 19,000×', sub: 'Memory of the largest single EC2 instance (log scale)',
      points: [
        { year: 2006.6, gb: 1.7, name: 'm1.small', cpu: '1 vCPU', label: '1.7 GB' },
        { year: 2009.8, gb: 68.4, name: 'm2.4xlarge', cpu: '8 vCPU', label: '68 GB' },
        { year: 2016.4, gb: 1952, name: 'x1.32xlarge', cpu: '128 vCPU', label: '2 TB' },
        { year: 2024.4, gb: 32768, name: 'u7in-32tb', cpu: '896 vCPU', label: '32 TB' }
      ],
      phone: { year: 2025.7, gb: 12, label: 'iPhone 17 Pro · 12 GB' },
      lines: [{ gb: 300, label: '99.9 % of queries ≤ 300 GB' }, { gb: 0.1, label: 'median query ≈ 100 MB' }],
      takeaway: 'Since 2016 even the 99.9th-percentile query fits in one machine’s memory.',
      source: 'AWS launch posts: EC2 2006, M2 2009, X1 2016, U7i 2024'
    },
    {
      act: 2, chart: 'price', rail: 'Compute got cheap', line: '≈ 12× cheaper per core-hour since 2014',
      title: 'Raw compute got ≈ 12× cheaper', sub: 'Best AWS C-series price per normalized core-hour (log scale)',
      // [year, USD per normalized core-hour]; `name` marks a new instance generation
      steps: [[2013.85, 0.083, 'c3'], [2014.25, 0.058], [2015.6, 0.0316, 'c4'], [2016.03, 0.030], [2016.94, 0.0283],
        [2017.88, 0.026, 'c5'], [2019.46, 0.0213], [2020.45, 0.0129, 'c6g'], [2022.39, 0.0091, 'c7g'], [2023.62, 0.0090],
        [2024.73, 0.0080, 'c8g'], [2025.91, 0.0073], [2026.48, 0.0070, 'c9g']],
      end: 2026.8,
      takeaway: 'Hardware prices fell ≈ 12×, while data platform margins grew.',
      source: 'Fraser (Fivetran, 2026), normalized to Geekbench single-core = 1000; values approximate'
    },
    {
      act: 2, chart: 'markup', rail: 'Premium is a markup', line: 'Snowflake 24×, Databricks 10.5× the price of raw EC2',
      title: 'Premium compute costs 10–24× the same CPUs', sub: 'USD per core-hour: on-demand service vs. comparable EC2 instances (3-year commit)',
      pairs: [
        { name: 'Snowflake M', premium: 0.336, raw: 0.0139, rawName: '4 × c7g.2xlarge', ratio: '24×', cents: '4 ¢' },
        { name: 'Databricks M', premium: 0.209, raw: 0.0199, rawName: '6 × r8g / m8g', ratio: '10.5×', cents: '10 ¢' }
      ],
      takeaway: 'Of every dollar spent on premium compute, only 4–10 ¢ pays for the CPUs.',
      source: 'Fraser (Fivetran, 2026); excludes attached SSDs, global services, software and overhead'
    },
    {
      act: 3, chart: 'bench', rail: 'The phone wins', line: 'DuckDB on an iPhone beats Databricks up to 100 GB',
      title: 'TPC-H: an iPhone outruns Databricks', sub: 'Geometric mean query time in seconds, 22 queries × 2 runs (lower is better)',
      scales: ['25 GB', '50 GB', '100 GB', '200 GB'],
      series: [
        { name: 'Databricks XS', note: '24 CPUs · $4.20/h', kind: 'premium', shade: 1, v: [1.91, 2.53, 3.93, 7.03] },
        { name: 'Databricks S', note: '40 CPUs · $8.40/h', kind: 'premium', shade: 2, v: [1.67, 2.07, 2.88, 4.66] },
        { name: 'Databricks M', note: '80 CPUs · $16.80/h', kind: 'premium', shade: 3, v: [1.35, 1.64, 2.73, 3.34] },
        { name: 'DuckDB on iPhone', note: '6 CPUs · 12 GB', kind: 'commodity', v: [0.46, 1.36, 2.64, 6.03] }
      ],
      takeaway: 'Six phone cores beat 24–80-core clusters up to 100 GB and stay competitive at 200 GB.',
      source: 'Fraser (Fivetran, 2026), github.com/fivetran/iphone_benchmark; values read from the published chart'
    },
    {
      act: 3, chart: 'aws', rail: 'AWS backs DuckDB', line: 'AWS acquired DuckLabs; DuckDB stays MIT',
      title: 'AWS bought the team behind DuckDB', sub: 'DuckDB is becoming a first-class AWS building block',
      deal: [
        { date: '26 Aug 2026', text: 'Acquisition agreed' },
        { date: '31 Aug 2026', text: 'Deal closed' }
      ],
      facts: [
        { big: 'Run best on AWS', text: 'Deep integration planned with S3, Athena, Redshift, EMR and Glue' },
        { big: '2.5 B+ queries', text: 'Amazon Quick’s engine already uses DuckDB: 30 % lower average latency' },
        { big: 'MIT licence', text: 'Open source under the DuckDB Foundation: no lock-in' },
        { big: '1 M+ / day', text: 'DuckDB downloads per day' }
      ],
      quote: '“We are excited to make DuckDB applications run best on AWS.”',
      quoteBy: 'AWS Big Data Blog, 26 Aug 2026',
      takeaway: 'Betting on DuckDB now means betting with AWS, not against it.',
      source: 'aboutamazon.com, AWS Big Data Blog and DuckLabs blog, Aug 2026'
    },
    {
      chart: 'ask', rail: 'The ask', line: 'Pilot DuckDB on commodity EC2',
      title: 'The ask: a low-risk pilot', sub: 'Test DuckDB on commodity compute before we renew premium compute',
      steps: [
        { n: 1, title: 'Measure', text: 'Ask our warehouse for a histogram of data scanned per query.' },
        { n: 2, title: 'Pilot', text: 'Run one real workload (a dbt model, a dashboard) with DuckDB on one EC2 instance, on the same Parquet / Iceberg data in S3.' },
        { n: 3, title: 'Compare', text: 'Runtime and cost per run against today’s premium compute bill.' }
      ],
      risk: 'One EC2 instance and an MIT-licensed binary',
      upside: 'Stop paying a 10–24× markup on compute',
      takeaway: 'Small data, commodity compute, open source: let’s measure it.',
      source: 'Measuring step suggested by Fraser (Fivetran, 2026)'
    }
  ]
};
