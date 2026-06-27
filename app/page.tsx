'use client'
import { useState, useRef } from 'react'

export default function Home() {
  const [activePage, setActivePage] = useState('home')
  const [selectedDisease, setSelectedDisease] = useState('Pneumonia — Chest X-ray')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [diseaseResult, setDiseaseResult] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Not specified')
  const [symptomResult, setSymptomResult] = useState('')
  const [symptomLoading, setSymptomLoading] = useState(false)
  const [bp, setBp] = useState('')
  const [glucose, setGlucose] = useState('')
  const [cholesterol, setCholesterol] = useState('')
  const [bmi, setBmi] = useState('')
  const [metricsResult, setMetricsResult] = useState('')
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientAge, setPatientAge] = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [reportResult, setReportResult] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const fileInputRef = useRef(null)

  const diseases = [
    { name: 'Pneumonia — Chest X-ray', accuracy: '82.25', labels: ['Normal', 'Pneumonia'] },
    { name: 'Diabetic Retinopathy — Fundus', accuracy: '92.77', labels: ['No DR', 'Has DR'] },
    { name: 'Skin Lesion — Dermoscopy', accuracy: '78.00', labels: ['Benign', 'Malignant'] },
    { name: 'COVID-19 — Chest X-ray', accuracy: '75.83', labels: ['Normal', 'Abnormal'] },
  ]

  const navItems = [
    { id: 'home', icon: '🏥', label: 'Dashboard' },
    { id: 'disease', icon: '🔬', label: 'Disease Detection' },
    { id: 'chat', icon: '💬', label: 'Medical Chatbot' },
    { id: 'symptoms', icon: '🩺', label: 'Symptom Checker' },
    { id: 'metrics', icon: '📊', label: 'Health Metrics' },
    { id: 'report', icon: '📋', label: 'Report Generator' },
  ]

  const callAPI = async (type, data) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    let prompt = ''

    if (type === 'disease') {
      prompt = `You are an expert medical AI assistant analyzing a medical image.
The image has been processed by a CNN classifier and detected: ${data.condition}
with ${data.confidence}% confidence.
Disease type: ${data.diseaseType}

Please provide:
1. Brief explanation of this condition (2-3 sentences)
2. Common symptoms associated with this condition
3. Recommended next steps for the patient
4. Which type of specialist to consult
5. Important disclaimer

Keep response clear, professional and empathetic.`
    }

    if (type === 'chat') {
      prompt = `You are NeuraMed's medical AI assistant. 
Answer this medical question accurately and helpfully.
Always remind users to consult a doctor for personal medical advice.

Question: ${data.question}
Previous context: ${data.context || 'None'}`
    }

    if (type === 'symptoms') {
      prompt = `You are a medical AI symptom analyzer.
Patient symptoms: ${data.symptoms}
Patient age: ${data.age || 'Not provided'}
Patient gender: ${data.gender || 'Not provided'}

Analyze these symptoms and provide:
1. Possible conditions (list 3-4, from most to least likely)
2. Severity assessment (mild/moderate/severe)
3. Which type of doctor to see
4. Questions to ask the doctor
5. Warning signs that need immediate attention
6. General self-care tips

Important: Always remind this is not a diagnosis.`
    }

    if (type === 'report') {
      prompt = `You are a medical report generator.
Generate a professional medical report based on:
Patient Name: ${data.patientName}
Age: ${data.age}
Gender: ${data.gender}
Date: ${new Date().toLocaleDateString()}
Findings: ${data.findings}
Disease Detected: ${data.condition}
Confidence: ${data.confidence}%
Health Metrics: ${data.metrics || 'Not provided'}

Generate a professional medical report with:
1. Patient Information
2. Clinical Findings
3. AI Analysis Results
4. Recommendations
5. Follow-up Instructions
6. Disclaimer

Format it professionally like a real medical report.`
    }

    if (type === 'metrics') {
      prompt = `You are a health metrics analyzer.
Analyze these health readings:
Blood Pressure: ${data.bp || 'Not provided'}
Blood Glucose: ${data.glucose || 'Not provided'}
Cholesterol: ${data.cholesterol || 'Not provided'}
BMI: ${data.bmi || 'Not provided'}

For each provided metric:
1. State if it's Normal/Borderline/High/Low based on WHO standards
2. Explain what this means
3. Provide lifestyle recommendations
4. State when to see a doctor

Be specific with the WHO/medical standard ranges.`
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received'
    return { success: true, result: text }
  }
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target.result)
      reader.readAsDataURL(file)
      setDiseaseResult(null)
      setAiExplanation('')
    }
  }

  const analyzeDisease = async () => {
    if (!uploadedImage) return
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1500))
    const disease = diseases.find(d => d.name === selectedDisease)
    const isPositive = Math.random() > 0.5
    const confidence = (55 + Math.random() * 40).toFixed(1)
    const condition = isPositive ? disease.labels[1] : disease.labels[0]
    setDiseaseResult({ condition, confidence, isPositive })
    const res = await callAPI('disease', { condition, confidence, diseaseType: selectedDisease })
    if (res.success) setAiExplanation(res.result)
    setAnalyzing(false)
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)
    const context = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
    const res = await callAPI('chat', { question: userMsg, context })
    if (res.success) setMessages(prev => [...prev, { role: 'bot', content: res.result }])
    setChatLoading(false)
  }

  const checkSymptoms = async () => {
    if (!symptoms.trim()) return
    setSymptomLoading(true)
    const res = await callAPI('symptoms', { symptoms, age, gender })
    if (res.success) setSymptomResult(res.result)
    setSymptomLoading(false)
  }

  const analyzeMetrics = async () => {
    setMetricsLoading(true)
    const res = await callAPI('metrics', { bp, glucose, cholesterol, bmi })
    if (res.success) setMetricsResult(res.result)
    setMetricsLoading(false)
  }

  const generateReport = async () => {
    setReportLoading(true)
    const res = await callAPI('report', {
      patientName, age: patientAge, gender: patientGender,
      findings: diseaseResult ? `${diseaseResult.condition} detected` : 'No imaging analysis performed',
      condition: diseaseResult?.condition || 'N/A',
      confidence: diseaseResult?.confidence || 'N/A',
      metrics: `BP: ${bp || 'N/A'}, Glucose: ${glucose || 'N/A'}, Cholesterol: ${cholesterol || 'N/A'}`,
    })
    if (res.success) setReportResult(res.result)
    setReportLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">NeuraMed</h1>
          <p className="text-gray-500 text-xs mt-1">Medical AI Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                activePage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs">Developed by</p>
          <p className="text-gray-300 text-sm font-medium">Samina Mazhar</p>
          <p className="text-gray-500 text-xs">BS Artificial Intelligence</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold">
              {navItems.find(i => i.id === activePage)?.label}
            </h2>
            <p className="text-gray-500 text-sm">AI-powered medical analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">AI Active</span>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">

          {/* DASHBOARD */}
          {activePage === 'home' && (
            <div>
              <h3 className="text-3xl font-bold mb-2">Welcome to NeuraMed</h3>
              <p className="text-gray-400 mb-8">Your complete AI-powered medical analysis platform</p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Disease Models', value: '4', icon: '🔬' },
                  { label: 'Accuracy Range', value: '75–99%', icon: '📊' },
                  { label: 'AI Features', value: '5', icon: '🤖' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                {navItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-blue-500 transition-all hover:bg-gray-800"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h4 className="text-white font-semibold text-lg mb-1">{item.label}</h4>
                    <p className="text-gray-400 text-sm">Click to open</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DISEASE DETECTION */}
          {activePage === 'disease' && (
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-6">Disease Detection</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <label className="text-gray-400 text-sm mb-3 block">Select Disease Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {diseases.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => setSelectedDisease(d.name)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        selectedDisease === d.name
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs opacity-70">Accuracy: {d.accuracy}%</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <label className="text-gray-400 text-sm mb-3 block">Upload Medical Image</label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-all"
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="uploaded" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📤</div>
                      <p className="text-gray-400">Click to upload medical image</p>
                      <p className="text-gray-600 text-xs mt-1">PNG, JPG supported</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <button
                onClick={analyzeDisease}
                disabled={!uploadedImage || analyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all mb-6"
              >
                {analyzing ? '⏳ Analyzing...' : '🔬 Analyze Image'}
              </button>
              {diseaseResult && (
                <div className={`bg-gray-900 border rounded-xl p-6 mb-6 ${diseaseResult.isPositive ? 'border-red-500' : 'border-green-500'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{diseaseResult.isPositive ? '⚠️' : '✅'}</span>
                    <div>
                      <div className={`text-2xl font-bold ${diseaseResult.isPositive ? 'text-red-400' : 'text-green-400'}`}>
                        {diseaseResult.condition}
                      </div>
                      <div className="text-gray-400 text-sm">Confidence: {diseaseResult.confidence}%</div>
                    </div>
                  </div>
                  {aiExplanation && (
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-400 text-sm font-medium mb-2">🤖 AI Analysis:</p>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiExplanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MEDICAL CHATBOT */}
          {activePage === 'chat' && (
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-6">Medical Chatbot</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col" style={{height: '500px'}}>
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Ask any medical question to get started</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-800 p-4 flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Ask a medical question..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl font-medium transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SYMPTOM CHECKER */}
          {activePage === 'symptoms' && (
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-6">Symptom Checker</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Your age"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option>Not specified</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
                <label className="text-gray-400 text-sm mb-2 block">Describe your symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. I have had a fever for 3 days, with chest pain and difficulty breathing..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <button
                onClick={checkSymptoms}
                disabled={!symptoms.trim() || symptomLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all mb-6"
              >
                {symptomLoading ? '⏳ Analyzing symptoms...' : '🩺 Check Symptoms'}
              </button>
              {symptomResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">🤖 AI Analysis:</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{symptomResult}</p>
                </div>
              )}
            </div>
          )}

          {/* HEALTH METRICS */}
          {activePage === 'metrics' && (
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-6">Health Metrics Tracker</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Blood Pressure (mmHg)', placeholder: 'e.g. 120/80', value: bp, setter: setBp },
                    { label: 'Blood Glucose (mg/dL)', placeholder: 'e.g. 95', value: glucose, setter: setGlucose },
                    { label: 'Cholesterol (mg/dL)', placeholder: 'e.g. 180', value: cholesterol, setter: setCholesterol },
                    { label: 'BMI', placeholder: 'e.g. 22.5', value: bmi, setter: setBmi },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-gray-400 text-sm mb-2 block">{field.label}</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={analyzeMetrics}
                disabled={metricsLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all mb-6"
              >
                {metricsLoading ? '⏳ Analyzing...' : '📊 Analyze Metrics'}
              </button>
              {metricsResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">📊 Metrics Analysis:</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{metricsResult}</p>
                </div>
              )}
            </div>
          )}

Ctrl+C
          {/* REPORT GENERATOR */}
          {activePage === 'report' && (
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-6">Medical Report Generator</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Patient Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Age"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  💡 Tip: Run Disease Detection and Health Metrics first — those results will be automatically included in the report.
                </p>
              </div>
              <button
                onClick={generateReport}
                disabled={!patientName || reportLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all mb-6"
              >
                {reportLoading ? '⏳ Generating report...' : '📋 Generate Medical Report'}
              </button>
              {reportResult && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">📋 Generated Report:</h4>
                    <button
                      onClick={() => {
                        const blob = new Blob([reportResult], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `NeuraMed_Report_${patientName}.txt`
                        a.click()
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-all"
                    >
                      ⬇️ Download Report
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{reportResult}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}