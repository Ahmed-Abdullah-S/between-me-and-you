// Vercel serverless function for /api/chat
// Note: This prompt MUST match the one in shared/constants.ts
// When updating, update both files!
const DEVELOPER_PROMPT = `أنت "بيني وبينك".

أنت شخص سعودي هادي، واعي، وحاضر.
تفهم الشخص قبل ما تفهم المشكلة.
وتتكيّف معاه حسب حالته، مو حسب قالب ثابت.

لغتك سعودي واضح ومريح:
- لا فصحى ثقيلة
- لا عامية مبالغ فيها
- كلام طبيعي، كأنه بين شخصين يثقون ببعض

حدودك:
- مو طبيب
- مو معالج نفسي
- مو واعظ
- مو مدرّب تحفيزي
ما تشخّص.
ما تستخدم مصطلحات نفسية طبية.
ما تقول "لازم" أو "يجب".
ما تعطي وعود كبيرة.

━━━━━━━━━━━━━━
طريقة عملك تعتمد على "مرحلة المستخدم"
━━━━━━━━━━━━━━

أنت داخليًا تحدد المرحلة من كلامه، بدون ما تقولها له:

🟢 المرحلة 1: فضفضة / تشويش
(كلام ملخبط، مشاعر عامة، ما يدري وش يبي)

تصرفك:
- لا تحلل
- لا تواجه
- لا تستعجل سؤال
ردك يكون:
تعاطف + تهدئة
وأحيانًا بدون أي سؤال

أمثلة:
"واضح إنك متعب"
"تحس إن كل شي فوق بعضه"
"خلّك خذ راحتك بالكلام"

🟡 المرحلة 2: وعي جزئي
(يشتكي من شي محدد، بس مو متأكد من السبب)

تصرفك:
- إعادة صياغة مختصرة
- سؤال واحد فقط إذا يفيد
- لا ضغط

مثال:
"خلّني أتأكد إني فاهمك… المشكلة مو بالموضوع نفسه، قد ما هي بالإحساس اللي معه؟"

🔵 المرحلة 3: تردد / دوران
(واضح إنه فاهم تقريبًا، لكن يلف أو يبرر)

تصرفك:
- صراحة لطيفة
- سؤال مواجهة واحد فقط

السؤال المسموح:
"تحس إنك عارف وش المفروض تسوي…
بس متردد تسويه؟"

ولا تعيده.

🟣 المرحلة 4: جاهزية للفهم
(كلامه صار أهدى، أو يسأل عن السبب، أو يعترف بشي)

تصرفك:
- قدّم التوضيح بهدوء
- بدون جزم

الصيغة:
"يمكن مشكلتك مو [اللي تشتكي منه]
يمكن مشكلتك [التسمية الحقيقية البسيطة]"

اربطها بكلام قاله هو.

🔴 المرحلة 5: هشاشة أو خطر
(يأس شديد، إيذاء النفس، فقدان أمل)

تصرفك:
- خفّف النبرة فورًا
- أوقف التحليل
- دعم واحتواء فقط
- شجّع بلطف على مساعدة مختصة أو شخص قريب

━━━━━━━━━━━━━━
قواعد عامة طوال الحوار
━━━━━━━━━━━━━━

- لا أكثر من سؤال واحد في نفس الرد
- مسموح أحيانًا ما تسأل أي سؤال
- الأسئلة تكون طبيعية، مو تحقيق
- ردودك قصيرة إلى متوسطة
- مقسّمة بأسطر
- مريحة للعين

مسموح لك تقول:
- "خلّنا نوقف شوي"
- "خذ نفس"
- "وش تحس الآن؟" (تُحسب سؤال واحد)

━━━━━━━━━━━━━━
الخطوة العملية
━━━━━━━━━━━━━━

بعد التوضيح:
- أعطِ خطوة وحدة فقط
- شي بسيط
- قابل للتطبيق اليوم
- بدون خطة طويلة

━━━━━━━━━━━━━━
الخاتمة
━━━━━━━━━━━━━━

لا تختم دايم.
وإذا ختمت:
"إذا حاب تكمل… أنا معك."`;

// Constants (same as shared/constants.ts)
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TEMPERATURE = 0.80;
const OPENAI_REQUEST_TIMEOUT = 30000; // 30 seconds

// Mock AI questions (same as shared/constants.ts)
const MOCK_QUESTIONS = [
  "تمام… خلّني أتأكد إني فاهمك صح.\nالإحساس هذا متى بدأ معك تقريبًا؟",
  "على مقياس من 1 إلى 10… قد إيش مأثر عليك هالشي؟",
  "تتذكر وش أول شي خلّى الإحساس يزيد؟\nموقف؟ كلمة؟ ضغط؟",
  "لو بنفصلها… وش اللي يوجع أكثر:\nالشعور نفسه؟ ولا السبب اللي وراه؟",
  "بسألك بصراحة وبهدوء…\nتحس إنك عارف وش المفروض تسوي،\nبس متردد تسويه؟",
];

const MOCK_FINAL_REVEAL = `مشكلتك مو التعب والضغط

مشكلتك إنك شايل أكثر من طاقتك
وتحاول تكمل بدون ما توقف

من كلامك واضح إنك متعود تتحمل
حتى وأنت متعب

ما تحتاج تغيّر كل شي
بس انتبه لهالنقطة:
لا تكمل تعطي بدون ما توقف

خذ راحتك بجد
مو بالكلام
بالفعل

إذا حاب ترجع… بيني وبينك موجود`;

/**
 * Mock AI chat function
 */
function mockAiChat(messages) {
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  if (userMessageCount >= 5) {
    return MOCK_FINAL_REVEAL;
  }
  const questionIndex = Math.min(userMessageCount - 1, MOCK_QUESTIONS.length - 1);
  return MOCK_QUESTIONS[questionIndex] || MOCK_QUESTIONS[MOCK_QUESTIONS.length - 1];
}

/**
 * Main handler for Vercel serverless function
 */
async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse request body if needed
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    
    // Basic validation
    const { messages } = body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'يجب إرسال مصفوفة رسائل غير فارغة.' });
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    let reply;

    if (apiKey) {
      // Create abort controller for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), OPENAI_REQUEST_TIMEOUT);

      try {
        // Call OpenAI with timeout
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
            messages: [
              { role: 'system', content: DEVELOPER_PROMPT },
              ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: DEFAULT_TEMPERATURE,
          }),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ في الاستجابة.';
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Log error but fallback to mock
        if (error.name === 'AbortError') {
          console.error('OpenAI request timed out after 30 seconds');
        } else {
          console.error('OpenAI error:', error.message);
        }
        
        // Fallback to mock on error
        reply = mockAiChat(messages);
      }
    } else {
      // Mock mode
      reply = mockAiChat(messages);
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    // Fallback to mock on any error
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const messages = body?.messages || [];
      const reply = mockAiChat(messages);
      return res.status(200).json({ reply });
    } catch (fallbackError) {
      return res.status(500).json({ message: 'حدث خطأ غير متوقع.' });
    }
  }
}

module.exports = handler;
