import type { CallState } from '@/types/domain'
import type { AlertLevel } from '../types'
import type { RealtimeInbound, TimedEvent } from '@/ws/types'
import type { DemoScenarioDebrief, DemoScenarioDetail, DemoScenarioListItem } from '../types'

/** A bilingual string. Resolved to the active web language at read time so the
 * simulated-call content matches whatever language the site is showing. */
type Loc = { en: string; th: string }

const STORAGE_KEY = 'vg.lang'

/** Mirror of LangProvider's language resolution, for use outside of React
 * (the scenario data flows through the plain query/service layer). */
function currentLang(): 'en' | 'th' {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'th') return stored
  } catch {
    /* ignore private-mode storage failures */
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('th') ? 'th' : 'en'
}

function tr(v: Loc): string {
  return currentLang() === 'th' ? v.th : v.en
}

/** Bilingual mirrors of the realtime event shapes that carry copy. */
type LocInbound =
  | { type: 'spoof_score'; seq: number; score: number }
  | { type: 'transcript'; seq: number; speaker: 'caller' | 'user'; text: Loc }
  | { type: 'context_update'; summary: Loc; intents: Loc[] }
  | { type: 'risk_score'; score: number; threshold: number }
  | { type: 'state'; value: CallState }
  | { type: 'alert'; level: AlertLevel; reasonMain: Loc; reasons: Loc[]; guardiansNotified: boolean }

interface LocTimedEvent {
  t: number
  event: LocInbound
}

interface ScenarioDefinition {
  list: {
    id: string
    title: Loc
    tag: Loc
    description: Loc
    icon: string
  }
  events: LocTimedEvent[]
  debrief: {
    verdict: DemoScenarioDebrief['verdict']
    caption: Loc
    stages: { title: Loc; description: Loc }[]
  }
}

function resolveEvent(e: LocInbound): RealtimeInbound {
  switch (e.type) {
    case 'transcript':
      return { type: 'transcript', seq: e.seq, speaker: e.speaker, text: tr(e.text) }
    case 'context_update':
      return { type: 'context_update', summary: tr(e.summary), intents: e.intents.map(tr) }
    case 'alert':
      return {
        type: 'alert',
        level: e.level,
        reasonMain: tr(e.reasonMain),
        reasons: e.reasons.map(tr),
        guardiansNotified: e.guardiansNotified,
      }
    default:
      return e
  }
}

// Shared intent tags, translated once so they stay consistent across scenarios.
const intent = {
  impersonation: { en: 'impersonation', th: 'แอบอ้างตัวตน' },
  urgency: { en: 'urgency', th: 'เร่งรีบ' },
  asksForOtp: { en: 'asks for OTP', th: 'ขอรหัส OTP' },
  asksForId: { en: 'asks for ID number', th: 'ขอเลขบัตรประชาชน' },
  asksForCard: { en: 'asks for card number', th: 'ขอเลขหลังบัตร' },
  authority: { en: 'authority', th: 'อ้างอำนาจหน้าที่' },
  legalThreat: { en: 'legal threat', th: 'ข่มขู่ทางกฎหมาย' },
  paymentDemand: { en: 'payment demand', th: 'เรียกเก็บเงิน' },
  familyImpersonation: { en: 'family impersonation', th: 'แอบอ้างเป็นคนในครอบครัว' },
  isolation: { en: 'isolation', th: 'กันไม่ให้ปรึกษาผู้อื่น' },
  moneyTransfer: { en: 'money transfer', th: 'โอนเงิน' },
  personal: { en: 'personal', th: 'เรื่องส่วนตัว' },
  healthcare: { en: 'healthcare', th: 'เรื่องสุขภาพ' },
  appointment: { en: 'appointment', th: 'นัดหมาย' },
  lowRisk: { en: 'low risk', th: 'ความเสี่ยงต่ำ' },
} satisfies Record<string, Loc>

// Final "Response" debrief stage, shared across the scam scenarios.
const scamResponseStage = {
  title: { en: 'Response', th: 'การตอบสนอง' },
  description: {
    en: 'An alert was shown immediately and your guardian was notified in real time.',
    th: 'ระบบแสดงการแจ้งเตือนทันที และแจ้งผู้ดูแลของคุณแบบเรียลไทม์',
  },
}

// Final "Response" debrief stage, shared across the safe scenarios.
const safeResponseStage = {
  title: { en: 'Response', th: 'การตอบสนอง' },
  description: {
    en: 'No alert was needed — PaTuean stayed quiet and let the call go on as normal.',
    th: 'ไม่จำเป็นต้องแจ้งเตือน ป้าเตือน เงียบไว้และปล่อยให้สายดำเนินไปตามปกติ',
  },
}

// 1) Fake arrest warrant — real human voice, social-engineering scam.
// Timings are matched to the recorded call (~42s). The voice is genuine, so the
// spoof ring stays low; the alert is driven by language (authority + secrecy +
// legal threat) and fires once the risk crosses threshold, before the final ask.
const fakeArrestWarrant: ScenarioDefinition = {
  list: {
    id: 'fake-arrest-warrant',
    title: { en: 'Fake arrest warrant (DSI)', th: 'หมายจับปลอม (กรมสอบสวนคดีพิเศษ)' },
    tag: { en: 'Real voice · scam', th: 'เสียงจริง · หลอกลวง' },
    description: {
      en: 'A caller posing as a special-investigation officer says your account is tied to money laundering, then asks for your ID card number.',
      th: 'สายที่อ้างเป็นเจ้าหน้าที่กรมสอบสวนคดีพิเศษ อ้างว่าบัญชีของคุณพัวพันคดีฟอกเงิน แล้วขอเลขบัตรประชาชน',
    },
    icon: 'authority',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 300,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: {
          en: 'Hello, this is the Department of Special Investigation. Am I speaking with ..., holder of the account ending five-two-seven?',
          th: 'สวัสดีครับ ที่นี่กรมสอบสวนคดีพิเศษนะครับ ขอเรียนสายคุณ... ใช่เจ้าของบัญชีธนาคารเลขที่ลงท้ายห้าสองเจ็ดใช่ไหมครับ',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 7 } },
    {
      t: 6200,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'user',
        text: {
          en: "Yes... that's me. What is this about?",
          th: 'ค่ะ... ใช่ค่ะ มีอะไรหรือคะ',
        },
      },
    },
    {
      t: 10600,
      event: {
        type: 'transcript',
        seq: 3,
        speaker: 'caller',
        text: {
          en: 'Our investigation found your account is linked to a money-laundering case worth twelve million baht. A summons has already been issued.',
          th: 'ทางตำรวจตรวจสอบพบว่าบัญชีของคุณเกี่ยวข้องกับคดีฟอกเงินมูลค่าสิบสองล้านบาทครับ ตอนนี้มีหมายเรียกออกมาแล้ว',
        },
      },
    },
    { t: 11200, event: { type: 'spoof_score', seq: 4, score: 9 } },
    { t: 11400, event: { type: 'risk_score', score: 46, threshold: 70 } },
    {
      t: 12000,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller claims to be a government investigator and says your account is tied to a criminal case.',
          th: 'ผู้โทรอ้างเป็นเจ้าหน้าที่สอบสวนของรัฐ และอ้างว่าบัญชีของคุณพัวพันคดีอาญา',
        },
        intents: [intent.impersonation, intent.authority],
      },
    },
    {
      t: 21300,
      event: {
        type: 'transcript',
        seq: 5,
        speaker: 'user',
        text: {
          en: "I didn't do anything. I really don't know anything about this.",
          th: 'ดิฉันไม่ได้ทำนะคะ ดิฉันไม่รู้เรื่องเลยจริงๆ',
        },
      },
    },
    {
      t: 27900,
      event: {
        type: 'transcript',
        seq: 6,
        speaker: 'caller',
        text: {
          en: "Many people are framed like this lately. But for now you must not tell anyone, including your children — this case is an official secret, and a leak would add to your charges.",
          th: 'ช่วงนี้มีหลายรายที่โดนสวมรอยแบบนี้เหมือนกันครับ แต่ระหว่างนี้ห้ามบอกใครนะครับ รวมถึงลูกหลานด้วย คดีนี้เป็นความลับทางราชการ ถ้าเรื่องรั่วไหลคุณจะมีความผิดเพิ่มครับ',
        },
      },
    },
    { t: 28400, event: { type: 'spoof_score', seq: 7, score: 8 } },
    { t: 28600, event: { type: 'risk_score', score: 78, threshold: 70 } },
    {
      t: 29200,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller warns you to keep the call secret from family and threatens extra charges.',
          th: 'ผู้โทรกำชับให้ปิดเป็นความลับจากคนในครอบครัว และขู่ว่าจะมีความผิดเพิ่ม',
        },
        intents: [intent.impersonation, intent.authority, intent.isolation, intent.legalThreat],
      },
    },
    { t: 29400, event: { type: 'state', value: 'suspicious' } },
    {
      t: 30400,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'Caller is impersonating an investigation agency and pressuring you into secrecy.',
          th: 'ผู้โทรแอบอ้างเป็นหน่วยงานสอบสวนและกดดันให้คุณปิดเป็นความลับ',
        },
        reasons: [
          { en: 'Impersonated a government investigation agency', th: 'แอบอ้างเป็นหน่วยงานสอบสวนของรัฐ' },
          { en: 'Told you to keep the call secret from family', th: 'สั่งให้ปิดเป็นความลับจากคนในครอบครัว' },
          { en: 'Threatened extra charges to pressure you', th: 'ขู่ว่าจะมีความผิดเพิ่มเพื่อกดดันคุณ' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 30600, event: { type: 'state', value: 'alerted' } },
    {
      t: 33000,
      event: {
        type: 'transcript',
        seq: 8,
        speaker: 'user',
        text: {
          en: 'So what do I have to do?',
          th: 'แล้วดิฉันต้องทำยังไงคะ',
        },
      },
    },
    {
      t: 35200,
      event: {
        type: 'transcript',
        seq: 9,
        speaker: 'caller',
        text: {
          en: "I'll transfer you to the investigating officer. But first, give me your thirteen-digit national ID number to verify your identity.",
          th: 'ผมจะโอนสายให้พนักงานสอบสวนครับ แต่ก่อนอื่นขอเลขบัตรประชาชนสิบสามหลักเพื่อยืนยันตัวตนก่อนนะครับ',
        },
      },
    },
    { t: 35800, event: { type: 'risk_score', score: 93, threshold: 70 } },
    {
      t: 36300,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is now demanding your 13-digit national ID number.',
          th: 'ผู้โทรกำลังขอเลขบัตรประชาชน 13 หลักของคุณโดยตรง',
        },
        intents: [intent.impersonation, intent.authority, intent.asksForId],
      },
    },
    {
      t: 39400,
      event: {
        type: 'transcript',
        seq: 10,
        speaker: 'user',
        text: {
          en: 'Three... one... four...',
          th: 'สามหนึ่งสี่...',
        },
      },
    },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 30 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 30 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The voice was a real human — this scam relies on intimidation, not a voice clone, so the fake-voice score stayed low.',
          th: 'เสียงเป็นมนุษย์จริง กลโกงนี้อาศัยการข่มขู่ ไม่ใช่การโคลนเสียง คะแนนเสียงปลอมจึงต่ำ',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Authority impersonation, enforced secrecy, and legal threats triggered the context model.',
          th: 'การแอบอ้างอำนาจหน้าที่ การบังคับให้ปิดเป็นความลับ และการขู่ทางกฎหมายทำให้โมเดลวิเคราะห์บริบทแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'Real agencies never ask for your full national ID number over the phone to "verify" you.',
          th: 'หน่วยงานจริงไม่มีทางขอเลขบัตรประชาชนเต็มทางโทรศัพท์เพื่อ "ยืนยันตัวตน"',
        },
      },
      scamResponseStage,
    ],
  },
}

// 2) Cloned son / accident — synthetic voice + scam. Timings matched to the
// recorded call (~42s). The cloned voice is caught early, so the alert fires on
// the fake-voice signal well before the OTP ask lands.
const clonedSon: ScenarioDefinition = {
  list: {
    id: 'cloned-son-accident',
    title: { en: 'Cloned son in an accident', th: 'โคลนเสียงลูกชายอ้างอุบัติเหตุ' },
    tag: { en: 'Cloned voice · scam', th: 'เสียงปลอม · หลอกลวง' },
    description: {
      en: 'A synthetic voice imitating your son claims he hit someone with the car, then asks you to read out an OTP.',
      th: 'เสียงสังเคราะห์เลียนแบบลูกชาย อ้างว่าขับรถชนคน แล้วหลอกให้อ่านรหัส OTP',
    },
    icon: 'family',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 1000,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: {
          en: "Mom, it's me — I'm calling from a friend's phone, my battery died. My voice might sound a bit strange.",
          th: 'แม่ ผมเองครับ ผมโทรจากเบอร์เพื่อนนะ มือถือผมแบตหมด เสียงอาจจะแปลกๆ หน่อย',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 66 } },
    {
      t: 11400,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'user',
        text: {
          en: "Oh, son, what's wrong? You don't sound like yourself.",
          th: 'อ้าว ลูก มีอะไรเหรอ เสียงไม่เหมือนเลยนะ',
        },
      },
    },
    {
      t: 19600,
      event: {
        type: 'transcript',
        seq: 3,
        speaker: 'caller',
        text: {
          en: 'Mom, I have to tell you something. This morning I hit someone with the car and they got badly hurt. I\'m at the police station now.',
          th: 'แม่ ผมมีเรื่องต้องบอก เมื่อเช้าผมขับรถไปชนคน เขาเจ็บหนัก ตอนนี้ผมอยู่ที่โรงพักครับ',
        },
      },
    },
    { t: 20000, event: { type: 'spoof_score', seq: 4, score: 87 } },
    { t: 20200, event: { type: 'risk_score', score: 73, threshold: 70 } },
    {
      t: 20600,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller claims to be your son in an emergency, but the voice shows strong cloning artifacts.',
          th: 'ผู้โทรอ้างเป็นลูกชายที่กำลังฉุกเฉิน แต่เสียงมีร่องรอยการโคลนอย่างชัดเจน',
        },
        intents: [intent.familyImpersonation, intent.urgency],
      },
    },
    { t: 20800, event: { type: 'state', value: 'suspicious' } },
    {
      t: 22000,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'This voice is likely AI-cloned — it is not your real son.',
          th: 'เสียงนี้น่าจะถูกโคลนด้วย AI ไม่ใช่ลูกชายตัวจริงของคุณ',
        },
        reasons: [
          { en: 'Voice cloning artifacts strongly detected', th: 'ตรวจพบร่องรอยการโคลนเสียงอย่างชัดเจน' },
          { en: '"Borrowed phone / odd voice" is a common cover story', th: '"ยืมมือถือ / เสียงแปลก" เป็นข้ออ้างที่พบบ่อย' },
          { en: 'Emotional emergency used to rush you', th: 'ใช้เหตุฉุกเฉินเร้าอารมณ์เพื่อเร่งให้คุณรีบ' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 22200, event: { type: 'state', value: 'alerted' } },
    {
      t: 25600,
      event: {
        type: 'transcript',
        seq: 5,
        speaker: 'user',
        text: {
          en: 'Oh no, are you badly hurt?',
          th: 'ตายจริง ลูกเป็นอะไรมากไหม',
        },
      },
    },
    {
      t: 27500,
      event: {
        type: 'transcript',
        seq: 6,
        speaker: 'caller',
        text: {
          en: "I'm okay, but the police said if I pay for the damages first it ends here — no court. Don't tell Dad yet, he'll be furious and make it worse.",
          th: 'ผมไม่เป็นไรครับ แต่ตำรวจบอกว่าถ้าจ่ายค่าเสียหายให้เขาก่อน เรื่องจะจบไม่ต้องขึ้นศาล แม่อย่าเพิ่งบอกพ่อนะครับ เดี๋ยวพ่อโมโหเรื่องจะยิ่งใหญ่',
        },
      },
    },
    { t: 28000, event: { type: 'spoof_score', seq: 7, score: 91 } },
    { t: 28200, event: { type: 'risk_score', score: 86, threshold: 70 } },
    {
      t: 29000,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller demands payment to settle and tells you not to tell the rest of the family.',
          th: 'ผู้โทรเรียกให้จ่ายเงินเพื่อจบเรื่อง และห้ามบอกคนอื่นในครอบครัว',
        },
        intents: [intent.familyImpersonation, intent.urgency, intent.isolation, intent.paymentDemand],
      },
    },
    {
      t: 33000,
      event: {
        type: 'transcript',
        seq: 8,
        speaker: 'user',
        text: {
          en: 'How much do you need?',
          th: 'แล้วต้องใช้เท่าไหร่ลูก',
        },
      },
    },
    {
      t: 34800,
      event: {
        type: 'transcript',
        seq: 9,
        speaker: 'caller',
        text: {
          en: "It's thirty thousand. Can you transfer it first? A text will come to your phone — read me the six-digit number.",
          th: 'สามหมื่นครับ แม่โอนมาก่อนได้ไหม เดี๋ยวจะมี SMS เข้ามือถือแม่ แม่อ่านเลขหกหลักให้ผมหน่อย',
        },
      },
    },
    { t: 35400, event: { type: 'spoof_score', seq: 10, score: 95 } },
    { t: 35600, event: { type: 'risk_score', score: 96, threshold: 70 } },
    {
      t: 36000,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is asking you to read out a one-time passcode (OTP) from your phone.',
          th: 'ผู้โทรกำลังขอให้อ่านรหัสผ่านใช้ครั้งเดียว (OTP) จากมือถือของคุณ',
        },
        intents: [intent.familyImpersonation, intent.moneyTransfer, intent.asksForOtp],
      },
    },
    {
      t: 39800,
      event: {
        type: 'transcript',
        seq: 11,
        speaker: 'user',
        text: {
          en: 'Okay, okay, let me check... the number is eight-two...',
          th: 'ได้ๆ เดี๋ยวแม่ดูก่อน... เลขแปดสอง...',
        },
      },
    },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 22 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 22 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The voice matched an AI clone, not your real son — the "borrowed phone" excuse was cover for the odd sound.',
          th: 'เสียงตรงกับเสียงที่สร้างด้วย AI ไม่ใช่ลูกชายตัวจริง ข้ออ้าง "ยืมมือถือเพื่อน" เป็นการกลบเกลื่อนเสียงที่ผิดปกติ',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Emotional urgency plus "don\'t tell Dad" isolation language reinforced the alert.',
          th: 'การเร้าอารมณ์ให้เร่งรีบร่วมกับการกันไม่ให้บอกคนอื่น ("อย่าบอกพ่อ") ตอกย้ำการแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'An urgent transfer plus reading out an OTP is a hallmark of the family-emergency scam.',
          th: 'การขอโอนเงินด่วนพร้อมให้อ่านรหัส OTP เป็นสัญญาณเด่นของกลโกงอ้างเหตุฉุกเฉินในครอบครัว',
        },
      },
      scamResponseStage,
    ],
  },
}

// 3) Hospital appointment reminder — real voice, legitimate. Timings matched to
// the recorded call (~28s). Both rings stay low; no alert.
const hospitalAppointment: ScenarioDefinition = {
  list: {
    id: 'hospital-appointment',
    title: { en: 'Hospital appointment reminder', th: 'นัดหมายโรงพยาบาล' },
    tag: { en: 'Real voice · safe', th: 'เสียงจริง · ปลอดภัย' },
    description: {
      en: 'A hospital clerk calls to remind you of a check-up and confirms a date of birth. See how PaTuean stays quiet.',
      th: 'เจ้าหน้าที่โรงพยาบาลโทรแจ้งเตือนวันนัดตรวจและยืนยันวันเกิด ดูว่า ป้าเตือน เงียบอย่างไร',
    },
    icon: 'hospital',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 800,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: {
          en: 'Hello, this is Sanpasitthiprasong Hospital, appointments desk.',
          th: 'สวัสดีค่ะ โรงพยาบาลสรรพสิทธิประสงค์ แผนกนัดหมายนะคะ',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 6 } },
    {
      t: 5000,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'user',
        text: { en: 'Yes?', th: 'ค่ะ' },
      },
    },
    {
      t: 6000,
      event: {
        type: 'transcript',
        seq: 3,
        speaker: 'caller',
        text: {
          en: "I'm calling to remind you of Grandma's check-up on Thursday the twenty-first at nine in the morning. Please have no food or water after midnight.",
          th: 'โทรมาแจ้งเตือนนัดตรวจของคุณยายนะคะ วันพฤหัสบดีที่ยี่สิบเอ็ด เวลาเก้าโมงเช้าค่ะ รบกวนงดน้ำงดอาหารหลังเที่ยงคืนด้วยนะคะ',
        },
      },
    },
    { t: 6500, event: { type: 'spoof_score', seq: 4, score: 8 } },
    { t: 6700, event: { type: 'risk_score', score: 9, threshold: 70 } },
    {
      t: 8000,
      event: {
        type: 'context_update',
        summary: {
          en: 'A hospital appointment reminder — no money, codes, or pressure involved.',
          th: 'การแจ้งเตือนนัดหมายของโรงพยาบาล ไม่มีเรื่องเงิน รหัส หรือการกดดัน',
        },
        intents: [intent.healthcare, intent.appointment, intent.lowRisk],
      },
    },
    {
      t: 14500,
      event: {
        type: 'transcript',
        seq: 5,
        speaker: 'user',
        text: { en: "Alright, I've noted it.", th: 'ได้ค่ะ จำได้แล้ว' },
      },
    },
    {
      t: 16500,
      event: {
        type: 'transcript',
        seq: 6,
        speaker: 'caller',
        text: {
          en: 'Could you confirm the date of birth so I can check it matches our records?',
          th: 'ขอยืนยันวันเดือนปีเกิดหน่อยได้ไหมคะ เพื่อเช็คว่าตรงกับในระบบ',
        },
      },
    },
    { t: 17000, event: { type: 'spoof_score', seq: 7, score: 7 } },
    { t: 17200, event: { type: 'risk_score', score: 18, threshold: 70 } },
    {
      t: 20000,
      event: {
        type: 'transcript',
        seq: 8,
        speaker: 'user',
        text: {
          en: 'The twelfth of March, 2495.',
          th: 'วันที่สิบสอง เดือนมีนาคม ปีสองสี่เก้าห้าค่ะ',
        },
      },
    },
    {
      t: 23500,
      event: {
        type: 'transcript',
        seq: 9,
        speaker: 'caller',
        text: {
          en: "That's correct. If something comes up and you can't make it, just call back this number — there's no charge at all.",
          th: 'ถูกต้องค่ะ ถ้าติดธุระมาไม่ได้ โทรกลับเบอร์นี้ได้เลยนะคะ ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้นค่ะ',
        },
      },
    },
    { t: 25000, event: { type: 'spoof_score', seq: 10, score: 6 } },
    { t: 25200, event: { type: 'risk_score', score: 8, threshold: 70 } },
  ],
  debrief: {
    verdict: 'safe',
    caption: {
      en: 'PaTuean stayed quiet — nothing suspicious was detected.',
      th: 'ป้าเตือน เงียบไว้ ไม่พบสิ่งน่าสงสัย',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The voice was a consistent, unmodified human voice throughout.',
          th: 'เสียงเป็นเสียงมนุษย์จริงที่ไม่ถูกดัดแปลงตลอดการสนทนา',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'No urgency, threats, or financial requests — just an appointment reminder.',
          th: 'ไม่มีการเร่งรีบ ข่มขู่ หรือขอเรื่องเงิน เป็นเพียงการแจ้งเตือนนัดหมาย',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'Confirming a date of birth for an existing record is a normal, low-risk check.',
          th: 'การยืนยันวันเกิดเพื่อตรวจกับข้อมูลที่มีอยู่แล้วเป็นการตรวจสอบปกติที่ความเสี่ยงต่ำ',
        },
      },
      safeResponseStage,
    ],
  },
}

// 5) Cloned daughter / accident — synthetic Isan voice + scam. No recording yet,
// so timings are the default ~22s pacing (retune once the audio is added).
const clonedDaughter: ScenarioDefinition = {
  list: {
    id: 'cloned-daughter-accident',
    title: { en: 'Cloned daughter in an accident', th: 'โคลนเสียงลูกสาวอ้างอุบัติเหตุ' },
    tag: { en: 'Cloned voice · scam', th: 'เสียงปลอม · หลอกลวง' },
    description: {
      en: 'A synthetic Isan voice imitating your daughter says she was in an accident, then asks you to read the number on the back of your ATM card.',
      th: 'เสียงสังเคราะห์ภาษาอีสานเลียนแบบลูกสาว อ้างว่าถูกรถชน แล้วขอให้อ่านเลขหลังบัตร ATM',
    },
    icon: 'family',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 1500,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: {
          en: "Mom... it's me. Can you hear me? The signal's bad.",
          th: 'แม่ ข้อยเอง ได้ยินบ่ สัญญาณบ่ค่อยดี',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 70 } },
    {
      t: 4500,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'user',
        text: {
          en: 'Oh, dear, your voice sounds strange — what\'s wrong?',
          th: 'อ้าว ลูก เสียงแปลกๆ เป็นหยังน้อ',
        },
      },
    },
    {
      t: 7000,
      event: {
        type: 'transcript',
        seq: 3,
        speaker: 'caller',
        text: {
          en: "I've got a cold, Mom. I need to tell you something — a car hit me this morning. I'm at Ubon hospital now.",
          th: 'ข้อยเป็นหวัดเด้อแม่ แม่ ข้อยมีเรื่องสิเว้า ข้อยถืกรถชนตอนเช้า ตอนนี้อยู่โรงบาลอุบลฯ',
        },
      },
    },
    { t: 7500, event: { type: 'spoof_score', seq: 4, score: 88 } },
    { t: 7700, event: { type: 'risk_score', score: 73, threshold: 70 } },
    {
      t: 8300,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller claims to be your daughter in an emergency, but the voice shows strong cloning artifacts.',
          th: 'ผู้โทรอ้างเป็นลูกสาวที่กำลังฉุกเฉิน แต่เสียงมีร่องรอยการโคลนอย่างชัดเจน',
        },
        intents: [intent.familyImpersonation, intent.urgency],
      },
    },
    { t: 8500, event: { type: 'state', value: 'suspicious' } },
    {
      t: 9500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'This voice is likely AI-cloned — it is not your real daughter.',
          th: 'เสียงนี้น่าจะถูกโคลนด้วย AI ไม่ใช่ลูกสาวตัวจริงของคุณ',
        },
        reasons: [
          { en: 'Voice cloning artifacts strongly detected', th: 'ตรวจพบร่องรอยการโคลนเสียงอย่างชัดเจน' },
          { en: '"Cold / bad signal" is a common cover story', th: '"เป็นหวัด / สัญญาณไม่ดี" เป็นข้ออ้างที่พบบ่อย' },
          { en: 'Emotional emergency used to rush you', th: 'ใช้เหตุฉุกเฉินเร้าอารมณ์เพื่อเร่งให้คุณรีบ' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 9700, event: { type: 'state', value: 'alerted' } },
    {
      t: 11000,
      event: {
        type: 'transcript',
        seq: 5,
        speaker: 'user',
        text: {
          en: "Oh no! Are you badly hurt? I'll come to you.",
          th: 'ตายแล้ว! เจ็บหนักบ่ลูก แม่สิไปหา',
        },
      },
    },
    {
      t: 13000,
      event: {
        type: 'transcript',
        seq: 6,
        speaker: 'caller',
        text: {
          en: "Don't come, it's too far, I'm not badly hurt. But the doctor wants payment first. And don't tell my brother yet — he'll worry and driving over would be dangerous.",
          th: 'บ่ต้องมาดอกแม่ ไกลเกิน ข้อยบ่เป็นหยังหนักดอก แต่หมอสิให้จ่ายค่ารักษาก่อนเด้อ แล้วอย่าเพิ่งบอกอ้ายเด้อแม่ เดี๋ยวเพิ่นเป็นห่วงขับรถมาแล้วสิอันตราย',
        },
      },
    },
    { t: 13500, event: { type: 'spoof_score', seq: 7, score: 92 } },
    { t: 13700, event: { type: 'risk_score', score: 86, threshold: 70 } },
    {
      t: 14300,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller demands payment before treatment and tells you not to tell family.',
          th: 'ผู้โทรเรียกให้จ่ายเงินก่อนรักษา และห้ามบอกคนในครอบครัว',
        },
        intents: [intent.familyImpersonation, intent.urgency, intent.isolation, intent.paymentDemand],
      },
    },
    {
      t: 17000,
      event: {
        type: 'transcript',
        seq: 8,
        speaker: 'user',
        text: {
          en: 'So what should I do, dear?',
          th: 'แล้วสิเฮ็ดจั่งใด๋ลูก',
        },
      },
    },
    {
      t: 19000,
      event: {
        type: 'transcript',
        seq: 9,
        speaker: 'caller',
        text: {
          en: "Can you transfer fifty thousand first? If you can't do a transfer, just read me the number on the back of your ATM card and I'll do it myself.",
          th: 'แม่โอนมาห้าหมื่นก่อนได้บ่ ถ้าโอนบ่เป็น แม่อ่านเลขหลังบัตร ATM ให้ข้อยกะได้ เดี๋ยวข้อยเฮ็ดให้เอง',
        },
      },
    },
    { t: 19500, event: { type: 'spoof_score', seq: 10, score: 95 } },
    { t: 19700, event: { type: 'risk_score', score: 96, threshold: 70 } },
    {
      t: 20000,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is asking you to read out the number on the back of your ATM card.',
          th: 'ผู้โทรกำลังขอให้อ่านเลขหลังบัตร ATM ของคุณ',
        },
        intents: [intent.familyImpersonation, intent.moneyTransfer, intent.asksForCard],
      },
    },
    {
      t: 22500,
      event: {
        type: 'transcript',
        seq: 11,
        speaker: 'user',
        text: {
          en: 'Okay, okay, let me get the card...',
          th: 'ได้ๆ เดี๋ยวแม่เอาบัตรมาก่อน...',
        },
      },
    },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 10 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 10 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The Isan-dialect voice matched an AI clone, not your real daughter — the "cold" and "bad signal" excuses covered the artifacts.',
          th: 'เสียงสำเนียงอีสานตรงกับเสียงที่สร้างด้วย AI ไม่ใช่ลูกสาวตัวจริง ข้ออ้าง "เป็นหวัด" และ "สัญญาณไม่ดี" กลบร่องรอยการโคลน',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Emotional urgency plus "don\'t tell your brother" isolation language reinforced the alert.',
          th: 'การเร้าอารมณ์ให้เร่งรีบร่วมกับการกันไม่ให้บอกคนอื่น ("อย่าบอกอ้าย") ตอกย้ำการแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'The number on the back of an ATM card (the CVV) plus urgency is a classic card-theft scam.',
          th: 'เลขหลังบัตร ATM (รหัส CVV) ร่วมกับการเร่งรีบเป็นกลโกงขโมยข้อมูลบัตรที่พบบ่อย',
        },
      },
      scamResponseStage,
    ],
  },
}

// 7) Bank fraud-prevention officer — real voice + scam. No recording yet, so
// timings are the default ~14s pacing (retune once the audio is added).
const bankFraudOfficer: ScenarioDefinition = {
  list: {
    id: 'bank-fraud-officer',
    title: { en: 'Fake bank fraud officer', th: 'แอบอ้างฝ่ายป้องกันการทุจริตของธนาคาร' },
    tag: { en: 'Cloned voice · scam', th: 'เสียงปลอม · หลอกลวง' },
    description: {
      en: 'A synthetic voice posing as a bank fraud officer reports a suspicious transfer and sets a 30-minute deadline before asking for your ID number — then you answer, and the live engine analyses your reply.',
      th: 'เสียงสังเคราะห์อ้างเป็นเจ้าหน้าที่ป้องกันการทุจริตของธนาคาร แจ้งรายการโอนผิดปกติและตั้งเวลา 30 นาทีบีบให้รีบ ก่อนขอเลขบัตรประชาชน แล้วคุณตอบกลับ ระบบจริงจะวิเคราะห์คำตอบของคุณ',
    },
    icon: 'bank',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 200,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: {
          en: "Hello, I'm Somchai from the fraud-prevention department at Krung Thai Bank.",
          th: 'สวัสดีครับ ผมสมชาย เจ้าหน้าที่ฝ่ายป้องกันการทุจริต ธนาคารกรุงไทยครับ',
        },
      },
    },
    { t: 2500, event: { type: 'spoof_score', seq: 1, score: 61 } },
    {
      t: 5300,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'caller',
        text: {
          en: 'Our system found your debit card ending four-four-seven-one was used last night at 2:47 a.m. — a transfer of forty-eight thousand nine hundred baht to a merchant in Malaysia.',
          th: 'ระบบพบการใช้บัตรเดบิตลงท้ายสี่สี่เจ็ดหนึ่ง เมื่อคืนตีสองสี่สิบเจ็ดนาที โอนออกสี่หมื่นแปดพันเก้าร้อยบาท ไปร้านค้าในประเทศมาเลเซีย',
        },
      },
    },
    { t: 6800, event: { type: 'spoof_score', seq: 3, score: 87 } },
    { t: 7000, event: { type: 'risk_score', score: 58, threshold: 70 } },
    { t: 7400, event: { type: 'state', value: 'suspicious' } },
    {
      t: 8000,
      event: {
        type: 'context_update',
        summary: {
          en: 'The voice shows cloning artifacts, and the caller — claiming to be your bank — reports a suspicious foreign transfer.',
          th: 'เสียงมีร่องรอยการโคลน และผู้โทรที่อ้างเป็นธนาคารแจ้งว่ามีรายการโอนไปต่างประเทศที่ผิดปกติ',
        },
        intents: [intent.impersonation, intent.authority],
      },
    },
    {
      t: 9500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'This voice is likely AI-cloned and is impersonating your bank.',
          th: 'เสียงนี้น่าจะถูกโคลนด้วย AI และกำลังแอบอ้างเป็นธนาคารของคุณ',
        },
        reasons: [
          { en: 'Voice cloning artifacts strongly detected', th: 'ตรวจพบร่องรอยการโคลนเสียงอย่างชัดเจน' },
          { en: 'Impersonated a bank fraud-prevention officer', th: 'แอบอ้างเป็นเจ้าหน้าที่ป้องกันการทุจริตของธนาคาร' },
          { en: 'Claimed an unverified suspicious transfer to rush you', th: 'อ้างรายการโอนผิดปกติที่ยังไม่ยืนยันเพื่อเร่งให้คุณรีบ' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 9700, event: { type: 'state', value: 'alerted' } },
    {
      t: 15100,
      event: {
        type: 'transcript',
        seq: 4,
        speaker: 'caller',
        text: {
          en: 'Your account is temporarily frozen and will auto-unlock in thirty minutes.',
          th: 'ตอนนี้บัญชีถูกระงับชั่วคราว จะปลดล็อกอัตโนมัติในสามสิบนาที',
        },
      },
    },
    { t: 15800, event: { type: 'spoof_score', seq: 5, score: 92 } },
    { t: 16500, event: { type: 'risk_score', score: 80, threshold: 70 } },
    {
      t: 16800,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller says your account is frozen and sets an artificial 30-minute deadline.',
          th: 'ผู้โทรอ้างว่าบัญชีถูกระงับ และตั้งเส้นตาย 30 นาทีที่สร้างขึ้นเพื่อกดดัน',
        },
        intents: [intent.impersonation, intent.authority, intent.urgency],
      },
    },
    {
      t: 19500,
      event: {
        type: 'transcript',
        seq: 6,
        speaker: 'caller',
        text: {
          en: 'To verify your identity, please give me your thirteen-digit national ID number.',
          th: 'รบกวนแจ้งเลขบัตรประชาชนสิบสามหลักเพื่อยืนยันตัวตนครับ',
        },
      },
    },
    { t: 20000, event: { type: 'spoof_score', seq: 7, score: 95 } },
    { t: 20200, event: { type: 'risk_score', score: 94, threshold: 70 } },
    {
      t: 20400,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller sets an artificial 30-minute deadline and is now demanding your 13-digit national ID number.',
          th: 'ผู้โทรตั้งเส้นตาย 30 นาทีที่สร้างขึ้น และกำลังขอเลขบัตรประชาชน 13 หลักของคุณ',
        },
        intents: [intent.impersonation, intent.authority, intent.urgency, intent.asksForId],
      },
    },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 10 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 10 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The caller\'s voice matched an AI clone, not a real bank officer — the fake-voice score rose early and stayed high.',
          th: 'เสียงของผู้โทรตรงกับเสียงที่สร้างด้วย AI ไม่ใช่เจ้าหน้าที่ธนาคารตัวจริง คะแนนเสียงปลอมสูงตั้งแต่ต้นและสูงต่อเนื่อง',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Bank impersonation plus an artificial "unlock in 30 minutes" deadline triggered the context model.',
          th: 'การแอบอ้างเป็นธนาคารร่วมกับเส้นตาย "ปลดล็อกใน 30 นาที" ที่สร้างขึ้นทำให้โมเดลวิเคราะห์บริบทแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'A real bank never asks for your full national ID number to "unlock" an account.',
          th: 'ธนาคารจริงไม่มีทางขอเลขบัตรประชาชนเต็มเพื่อ "ปลดล็อก" บัญชี',
        },
      },
      scamResponseStage,
    ],
  },
}

const scenarios: Record<string, ScenarioDefinition> = {
  [fakeArrestWarrant.list.id]: fakeArrestWarrant,
  [clonedSon.list.id]: clonedSon,
  [hospitalAppointment.list.id]: hospitalAppointment,
  [clonedDaughter.list.id]: clonedDaughter,
  [bankFraudOfficer.list.id]: bankFraudOfficer,
}

export function listScenarios(): DemoScenarioListItem[] {
  return Object.values(scenarios).map((s) => ({
    id: s.list.id,
    title: tr(s.list.title),
    tag: tr(s.list.tag),
    description: tr(s.list.description),
    icon: s.list.icon,
  }))
}

export function getScenarioDetail(id: string): DemoScenarioDetail | null {
  const s = scenarios[id]
  if (!s) return null
  const events: TimedEvent[] = s.events.map((e) => ({ t: e.t, event: resolveEvent(e.event) }))
  return { id, audioUrl: `/audio/scenario/${id}.mp3`, events }
}

export function getScenarioDebrief(id: string): DemoScenarioDebrief | null {
  const s = scenarios[id]
  if (!s) return null
  return {
    verdict: s.debrief.verdict,
    caption: tr(s.debrief.caption),
    stages: s.debrief.stages.map((st) => ({ title: tr(st.title), description: tr(st.description) })),
  }
}

export function getScenarioCallerName(id: string): { name: string; icon: string } {
  const s = scenarios[id]
  return s
    ? { name: tr(s.list.title), icon: s.list.icon }
    : { name: tr({ en: 'Unknown caller', th: 'ผู้โทรไม่ทราบชื่อ' }), icon: 'phone' }
}
