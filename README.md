# بيني وبينك

مساحة آمنة للمستخدم. تستمع، تفهم، وتساعده يكتشف مشكلته الحقيقية بشكل مبدئي.

## الميزات

- محادثة تفاعلية باللغة العربية بلهجة سعودية بيضاء
- وضعين للتشغيل: Mock Mode (بدون API) و Real AI Mode (مع OpenAI)
- واجهة مستخدم بسيطة ومركزة
- حماية من الإفراط في الطلبات (Rate Limiting)

## المتطلبات

- Node.js 18+ 
- npm أو yarn

## التثبيت

```bash
npm install
```

## التشغيل

### وضع Mock (بدون OpenAI API)

يعمل التطبيق بشكل افتراضي في وضع Mock بدون الحاجة لمفتاح API:

```bash
npm run dev
```

التطبيق سيعمل على `http://localhost:5000`

### وضع Real AI (مع OpenAI API)

1. أنشئ ملف `.env.local` في المجلد الرئيسي:

```bash
cp env.example .env.local
```

2. أضف مفتاح OpenAI API في `.env.local`:

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

3. شغّل التطبيق:

```bash
npm run dev
```

**ملاحظة:** إذا لم يتم العثور على `OPENAI_API_KEY`، سيعمل التطبيق تلقائياً في وضع Mock.

## البناء للإنتاج

```bash
npm run build
npm start
```

## النشر على Vercel

### الخطوات:

1. **ارفع المشروع إلى GitHub**

2. **قم بتوصيل المشروع في Vercel:**
   - اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
   - اضغط "New Project"
   - اختر المستودع الخاص بك

3. **إعدادات البناء:**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

4. **إضافة متغيرات البيئة:**
   - في صفحة إعدادات المشروع، اذهب إلى "Environment Variables"
   - أضف المتغيرات التالية:
     - `OPENAI_API_KEY`: مفتاح OpenAI API الخاص بك
     - `OPENAI_MODEL`: `gpt-4o-mini` (أو أي نموذج آخر)
     - `PORT`: `5000` (اختياري)
     - `NODE_ENV`: `production`

5. **النشر:**
   - اضغط "Deploy"
   - بعد اكتمال النشر، سيعمل التطبيق على رابط Vercel

### ملاحظات مهمة للنشر:

- تأكد من أن `.env.local` موجود في `.gitignore` (موجود بالفعل)
- لا تضع مفاتيح API في الكود أو في المستودع
- Vercel سيعيد بناء المشروع تلقائياً عند كل push إلى main branch

## هيكل المشروع

```
.
├── client/          # واجهة المستخدم (React + Vite)
├── server/          # خادم Express
│   ├── routes.ts    # مسارات API (Chat endpoint)
│   └── mockAi.ts    # محرك Mock AI
├── shared/          # كود مشترك (Schemas, Types)
└── dist/            # ملفات البناء (يتم إنشاؤها)

```

## API

### POST `/api/chat`

يرسل رسائل المستخدم ويستقبل رد من AI.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "أشعر بالتعب" }
  ]
}
```

**Response:**
```json
{
  "reply": "خلّني أتأكد إني فاهمك صح…"
}
```

**Rate Limit:** 10 طلبات في الدقيقة لكل IP

## الأمان

- جميع طلبات OpenAI تتم من جانب الخادم فقط
- لا يتم تخزين أو تسجيل بيانات المستخدم
- مفاتيح API محمية ولا تظهر في الكود
- Rate limiting لمنع الإساءة

## التطوير

```bash
# وضع التطوير
npm run dev

# فحص الأنواع
npm run check

# بناء للإنتاج
npm run build
```

## الترخيص

MIT

