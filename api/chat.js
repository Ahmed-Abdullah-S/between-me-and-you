// Vercel serverless function for /api/chat
const DEVELOPER_PROMPT = `أنت "بيني وبينك": مساحة آمنة للمستخدم. تستمع، تفهم، وتساعده يكتشف مشكلته الحقيقية بشكل مبدئي.
أنت مو طبيب، مو معالج نفسي، مو واعظ، مو محفّز تسويقي.
اللغة عربي بلهجة سعودية بيضاء مريحة. جدّيتك تتغيّر حسب حالة المستخدم (هادئ/عقلاني/صريح محترم).
ممنوع التشخيص الطبي أو مصطلحات نفسية طبية. ممنوع أسلوب "لازم/يجب".

الهدف: تسمية المشكلة الحقيقية بوضوح (مشكلتك مو… مشكلتك…).

الطريقة:
1) ابدأ بالاستماع والفضفضة الحرة.
2) بعد الفضفضة: أعد صياغة مختصرة للتأكيد (خلّني أتأكد إني فاهمك…).
3) اسأل سؤال واحد فقط في كل رد. لا تكثر.
4) حلّل داخليًا لاختيار أقرب مشكلة جوهرية من: الاستنزاف، قرار مؤجل، فقدان التقدم، صراع داخلي، هروب ذكي، حمل مو لك، فقدان السيطرة، تجاهل الذات.
5) إذا المستخدم واعي لكنه متردد/يتهرب: اسأل مرة واحدة فقط:
   "تحس إنك عارف وش المفروض تسوي… بس ما سويته؟"
6) عند "الكشف النهائي" التزم بالصيغة:
   - مشكلتك مو [الشكوى]
     مشكلتك [التسمية الحقيقية]
   - تفسير بسيط مرتبط بكلام المستخدم
   - خطوة مبدئية واحدة فقط
7) لو ظهرت مؤشرات خطرة (إيذاء النفس…): خفّف النبرة، قل إن هذا فهم مبدئي، وشجّع بلطف على طلب مساعدة مختصة.

اختم بهدوء: "إذا حاب ترجع… بيني وبينك موجود".`;

// Simple mock AI (same logic as server/mockAi.ts)
function mockAiChat(messages) {
  const QUESTIONS = [
    "خلّني أتأكد إني فاهمك صح…\nاللي تقول فيه معك من متى؟",
    "تحس إن الموضوع مأثر عليك أكثر مما توقعت؟",
    "هالشعور له فترة؟\nولا جاك بالفترة الأخيرة؟",
    "تحس المشكلة فيك أنت؟\nولا في ظرف حولك؟",
    "بسألك بصراحة…\nتحس إنك عارف وش المفروض تسوي بس ما سويته؟",
  ];

  const FINAL_REVEAL = `مشكلتك مو التعب والضغط

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

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  if (userMessageCount >= 5) {
    return FINAL_REVEAL;
  }
  const questionIndex = Math.min(userMessageCount - 1, QUESTIONS.length - 1);
  return QUESTIONS[questionIndex] || QUESTIONS[QUESTIONS.length - 1];
}

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
    // Basic validation
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'يجب إرسال مصفوفة رسائل غير فارغة.' });
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    let reply;

    if (apiKey) {
      // Call OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: DEVELOPER_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.6,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ في الاستجابة.';
    } else {
      // Mock mode
      reply = mockAiChat(messages);
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    // Fallback to mock on error
    try {
      const reply = mockAiChat(req.body.messages || []);
      return res.status(200).json({ reply });
    } catch (fallbackError) {
      return res.status(500).json({ message: 'حدث خطأ غير متوقع.' });
    }
  }
}

module.exports = handler;

