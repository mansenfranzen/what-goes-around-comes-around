DB.addMilestone({
  id: '14',
  slug: 'mapreduce',
  title: 'MapReduce',
  short: 'MapReduce',
  year: '2003',
  pos: 2003,
  category: 'language',
  verdict: 'Dead end',
  concept: 'GROUP BY',
  today: 'GROUP BY word',
  problem: 'Google had to process the entire web crawl on thousands of cheap, failing machines.',
  solution: 'Programmers write just map and reduce; the framework spreads the work and survives machine failures.',
  relevance: 'Scale-out, fault-tolerant execution lives on inside SQL engines; the job itself is a GROUP BY.',
  takeaway: 'Scale was real; the hand-written interface lost to SQL.',
  // Opened from the Relevance box. Java: simplified excerpt of SecondarySort.java in the Apache Hadoop examples
  // (the full file has 6 classes and ~140 lines of code without comments).
  compare: {
    button: 'Java vs SQL',
    kicker: 'Hadoop example · SecondarySort',
    title: 'Sort each user’s scores',
    intro: 'Custom keys, partitioners, comparators and serialization, for a very simple goal.',
    goal: 'For each user, sort the records by a secondary field (such as a timestamp) before processing them.',
    input: ['user=1, score=30', 'user=1, score=10', 'user=1, score=20', 'user=2, score=5', 'user=2, score=15'],
    output: ['User 1 → 10, 20, 30', 'User 2 → 5, 15'],
    hard: {
      label: 'Hadoop MapReduce · Java',
      note: 'Simplified excerpt from the Apache Hadoop examples',
      stat: '100+ lines · 6 classes',
      lang: 'java',
      blocks: [
        { title: 'IntPair', tag: 'composite key + sort order', code: [
          'public static class IntPair',
          '    implements WritableComparable<IntPair> {',
          '    private int first;',
          '    private int second;',
          '',
          '    @Override',
          '    public int compareTo(IntPair o) {',
          '        if (first != o.first) {',
          '            return first < o.first ? -1 : 1;',
          '        } else if (second != o.second) {',
          '            return second < o.second ? -1 : 1;',
          '        } else {',
          '            return 0;',
          '        }',
          '    }',
          '}'
        ].join('\n') },
        { title: 'FirstPartitioner', tag: 'custom partitioning', code: [
          'public static class FirstPartitioner',
          '    extends Partitioner<IntPair, IntWritable> {',
          '',
          '    @Override',
          '    public int getPartition(IntPair key,',
          '                            IntWritable value,',
          '                            int numPartitions) {',
          '        return Math.abs(key.getFirst() * 127)',
          '               % numPartitions;',
          '    }',
          '}'
        ].join('\n') },
        { title: 'FirstGroupingComparator', tag: 'custom grouping', code: [
          'public static class FirstGroupingComparator',
          '    extends WritableComparator {',
          '',
          '    @Override',
          '    public int compare(WritableComparable w1,',
          '                       WritableComparable w2) {',
          '        IntPair ip1 = (IntPair) w1;',
          '        IntPair ip2 = (IntPair) w2;',
          '',
          '        return Integer.compare(',
          '            ip1.getFirst(),',
          '            ip2.getFirst());',
          '    }',
          '}'
        ].join('\n') }
      ],
      needsLabel: 'Hadoop forces you to understand',
      needs: ['WritableComparable', 'custom serialization', 'composite keys', 'custom sort order',
        'custom partitioning', 'grouping comparator', 'shuffle mechanics', 'reducer invocation semantics']
    },
    easy: {
      label: 'SQL',
      note: 'Spark, Flink, Trino, Snowflake, DuckDB: dialects vary, the idea is the same',
      stat: '3–4 lines',
      lang: 'sql',
      joiner: 'or',
      blocks: [
        { title: 'Sorted rows', code: 'SELECT *\nFROM events\nORDER BY user_id, score;' },
        { title: 'One list per user', code: 'SELECT user_id,\n       ARRAY_AGG(score ORDER BY score)\nFROM events\nGROUP BY user_id;' }
      ]
    },
    verdict: '100+ lines of Hadoop plumbing for what is conceptually “sort each group’s values”.'
  }
});
