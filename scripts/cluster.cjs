// scripts/cluster.cjs

const fs     = require('fs')
const { parse } = require('csv-parse/sync')
const skmeans   = require('skmeans')

// 1) Read & parse the CSV
const raw  = fs.readFileSync('data/Mall_Customers.csv', 'utf8')
const rows = parse(raw, { columns: true, skip_empty_lines: true })

// 2) Build the 2-D array [[income, score], …]
const X = rows.map(r => [
  Number(r['Annual Income (k$)']),
  Number(r['Spending Score (1-100)'])
])

// 3) Cluster into 5 groups
const result   = skmeans(X, 5)
const clusters = result.idxs   // an array of length N with values 0–4

// 4) Attach each customer’s cluster
const labeled = rows.map((r, i) => ({
  id:      r.CustomerID,
  age:     r.Age,
  income:  r['Annual Income (k$)'],
  score:   r['Spending Score (1-100)'],
  cluster: clusters[i]
}))
fs.writeFileSync(
  'data/labeled_customers.json',
  JSON.stringify(labeled, null, 2)
)

// 5) Define a simple to-do task for each cluster
const tasks = [
  'Email budget-friendly coupons',
  'Launch VIP loyalty program',
  'Send premium upsell offers',
  'Invite to customer survey',
  'Offer new-signup discount'
].map((task, cluster) => ({ cluster, task }))

fs.writeFileSync(
  'data/cluster_tasks.json',
  JSON.stringify(tasks, null, 2)
)

console.log('✅ data/labeled_customers.json & data/cluster_tasks.json created')
