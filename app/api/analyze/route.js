import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { type, data } = await request.json()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ success: true, result: text })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}