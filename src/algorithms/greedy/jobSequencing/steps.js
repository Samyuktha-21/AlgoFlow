/* Job sequencing with deadlines: each job takes one time unit and pays only if
   it finishes by its deadline. Take the most profitable jobs first, and place
   each in the LATEST free slot at or before its deadline — placing it late
   leaves the early slots open for jobs that have no other option.

   Input: pairs of numbers, each pair a (deadline, profit). */
export function generateSteps(inputArray) {
  const nums = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.trunc(v))
    : [2, 100, 1, 19, 2, 27, 1, 25, 3, 15]

  const jobs = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    /* Deadlines are slot numbers, so they have to be at least 1 and small
       enough that the slot array stays sane. */
    jobs.push({
      id: jobs.length,
      deadline: Math.min(Math.max(1, Math.abs(nums[i])), 12),
      profit: Math.abs(nums[i + 1]),
    })
  }
  jobs.sort((a, b) => b.profit - a.profit)

  const maxD = Math.max(...jobs.map(j => j.deadline))
  const slot = new Array(maxD + 1).fill(-1)
  const arr = jobs.map(j => j.profit)
  const steps = [], sorted = []
  const addStep = (i, description, codeLine) => steps.push({
    array: arr,
    current: i,
    highlight: i >= 0 ? [i] : [],
    sorted: [...sorted],
    pointers: [],
    extra: {
      scheduled: sorted.length,
      profit: sorted.reduce((s, idx) => s + jobs[idx].profit, 0),
      slots: slot.slice(1).map(x => (x === -1 ? '·' : jobs[x].profit)).join(' '),
    },
    description,
    codeLine,
  })

  addStep(-1, `Sorted by profit: ${jobs.map(j => `${j.profit}(by ${j.deadline})`).join(', ')}. There are ${maxD} time slots.`, 7)

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]
    addStep(i, `Job pays ${job.profit}, due by slot ${job.deadline}. Look for a free slot, latest first.`, 11)
    let scheduled = false
    for (let j = job.deadline; j >= 1; j--) {
      if (slot[j] === -1) {
        slot[j] = i
        sorted.push(i)
        scheduled = true
        addStep(i, `Slot ${j} is free — schedule it there. Taking the latest slot keeps the earlier ones open for tighter deadlines.`, 12)
        break
      }
    }
    if (!scheduled) addStep(i, `Every slot up to ${job.deadline} is taken — this job cannot be run at all.`, 10)
  }

  const total = sorted.reduce((s, i) => s + jobs[i].profit, 0)
  addStep(-1, `Scheduled ${sorted.length} of ${jobs.length} jobs for a total profit of ${total}.`, 15)
  steps[steps.length - 1].result = `${sorted.length} jobs, profit ${total}`
  return steps
}
