import type { Message } from "@shared/schema";

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

export function mockAiChat(messages: Message[]): string {
  // Count user messages (excluding system and initial assistant messages)
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  // If we have 5+ user messages, return the final reveal
  if (userMessageCount >= 5) {
    return FINAL_REVEAL;
  }

  // Otherwise, return the appropriate question based on message count
  const questionIndex = Math.min(userMessageCount - 1, QUESTIONS.length - 1);
  return QUESTIONS[questionIndex] || QUESTIONS[QUESTIONS.length - 1];
}
