import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

// POST /api/slack  { webhookUrl, text }
app.post('/api/slack', async (req, res) => {
  const { webhookUrl, text } = req.body

  if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
    return res.status(400).json({ error: 'Invalid Slack webhook URL' })
  }
  if (!text) {
    return res.status(400).json({ error: 'Missing text' })
  }

  try {
    await axios.post(webhookUrl, { text }, {
      headers: { 'Content-Type': 'application/json' },
    })
    res.json({ ok: true })
  } catch (err) {
    const status  = err.response?.status  || 500
    const message = err.response?.data    || err.message
    console.error('Slack error:', status, message)
    res.status(status).json({ error: message })
  }
})

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`\n🚀  Taskflow proxy server running on http://localhost:${PORT}`)
  console.log(`   Slack webhook proxy: POST http://localhost:${PORT}/api/slack\n`)
})
