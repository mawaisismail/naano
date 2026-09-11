// Guard for the seed decision. Getting this wrong wipes a live database.
const parseCount = (out) => {
  const last = out.trim().split(/\r?\n/).map((l) => l.trim())
    .filter((l) => /^\d+$/.test(l)).pop();
  if (last === undefined) return null;
  return Number(last);
};

const cases = [
  ["0", 0, true],
  ["3", 3, false],
  ["10", 10, false],
  ["20", 20, false],
  ["100", 100, false],
  ["some warning\n0", 0, true],
  ["Warning: ssl\n12", 12, false],
];

let failed = 0;
for (const [input, expectCount, expectEmpty] of cases) {
  const n = parseCount(input);
  const empty = n === 0;
  const ok = n === expectCount && empty === expectEmpty;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${JSON.stringify(input).padEnd(24)} -> count ${n}, empty ${empty}`
  );
}
process.exit(failed ? 1 : 0);
