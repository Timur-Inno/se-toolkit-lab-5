import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
)

interface ScoreBucket {
  bucket: string
  count: number
}

interface PassRate {
  task: string
  avg_score: number
  attempts: number
}

interface TimelineEntry {
  date: string
  submissions: number
}

interface DashboardProps {
  token: string
}

const LABS = ['lab-04', 'lab-03', 'lab-02', 'lab-01']

export default function Dashboard({ token }: DashboardProps) {
  const [lab, setLab] = useState('lab-04')
  const [scores, setScores] = useState<ScoreBucket[]>([])
  const [passRates, setPassRates] = useState<PassRate[]>([])
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError('')

    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`/analytics/scores?lab=${lab}`, { headers }).then((r) => r.json() as Promise<ScoreBucket[]>),
      fetch(`/analytics/pass-rates?lab=${lab}`, { headers }).then((r) => r.json() as Promise<PassRate[]>),
      fetch(`/analytics/timeline?lab=${lab}`, { headers }).then((r) => r.json() as Promise<TimelineEntry[]>),
    ])
      .then(([s, p, t]) => {
        setScores(s)
        setPassRates(p)
        setTimeline(t)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [lab, token])

  const scoreChartData = {
    labels: scores.map((s) => s.bucket),
    datasets: [
      {
        label: 'Students',
        data: scores.map((s) => s.count),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
    ],
  }

  const timelineChartData = {
    labels: timeline.map((t) => t.date),
    datasets: [
      {
        label: 'Submissions',
        data: timeline.map((t) => t.submissions),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  }

  return (
    <div className="dashboard">
      <div className="dashboard-controls">
        <label htmlFor="lab-select">Lab: </label>
        <select
          id="lab-select"
          value={lab}
          onChange={(e) => setLab(e.target.value)}
        >
          {LABS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="chart-container">
            <h2>Score Distribution</h2>
            <Bar data={scoreChartData} options={{ responsive: true }} />
          </div>

          <div className="chart-container">
            <h2>Submissions Over Time</h2>
            <Line data={timelineChartData} options={{ responsive: true }} />
          </div>

          <div className="chart-container">
            <h2>Pass Rates by Task</h2>
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Avg Score</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {passRates.map((p) => (
                  <tr key={p.task}>
                    <td>{p.task}</td>
                    <td>{p.avg_score}</td>
                    <td>{p.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
