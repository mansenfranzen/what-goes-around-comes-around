/* Fresh set memberships per game: CODASYL reorders one chain during replay. */
DB.partsCatalog = function () {
  return {
    sup: { Acme: ['valve', 'pump', 'seal'], Orbit: ['nut', 'bolt'] },
    use: { Engine: ['valve', 'nut'], Tank: ['pump', 'bolt'], Hull: ['seal'] }
  };
};
