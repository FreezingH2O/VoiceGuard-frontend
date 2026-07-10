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
  authority: { en: 'authority', th: 'อ้างอำนาจหน้าที่' },
  paymentDemand: { en: 'payment demand', th: 'เรียกเก็บเงิน' },
  familyImpersonation: { en: 'family impersonation', th: 'แอบอ้างเป็นคนในครอบครัว' },
  isolation: { en: 'isolation', th: 'กันไม่ให้ปรึกษาผู้อื่น' },
  moneyTransfer: { en: 'money transfer', th: 'โอนเงิน' },
  personal: { en: 'personal', th: 'เรื่องส่วนตัว' },
  lowRisk: { en: 'low risk', th: 'ความเสี่ยงต่ำ' },
} satisfies Record<string, Loc>

// Final "Response" debrief stage is identical across the three scam scenarios.
const scamResponseStage = {
  title: { en: 'Response', th: 'การตอบสนอง' },
  description: {
    en: 'An alert was shown immediately and your guardian was notified in real time.',
    th: 'ระบบแสดงการแจ้งเตือนทันที และแจ้งผู้ดูแลของคุณแบบเรียลไทม์',
  },
}

const bankOfficer: ScenarioDefinition = {
  list: {
    id: 'bank-officer',
    title: { en: 'Fake bank security officer', th: 'แอบอ้างเป็นเจ้าหน้าที่ความปลอดภัยของธนาคาร' },
    tag: { en: 'Classic', th: 'พบบ่อย' },
    description: {
      en: 'A caller claims your account is compromised and asks you to confirm your OTP.',
      th: 'สายที่อ้างว่าบัญชีของคุณถูกแฮ็ก แล้วขอให้ยืนยันรหัส OTP',
    },
    icon: 'bank',
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
          en: "Hello, this is calling from Bangkok Bank's security department.",
          th: 'สวัสดีครับ โทรจากฝ่ายความปลอดภัยของธนาคารกรุงเทพนะครับ',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 58 } },
    {
      t: 4500,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'caller',
        text: {
          en: "We've detected unusual activity on your account and need to verify your identity.",
          th: 'เราตรวจพบความเคลื่อนไหวผิดปกติในบัญชีของคุณ จึงต้องขอยืนยันตัวตนครับ',
        },
      },
    },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 74 } },
    { t: 5500, event: { type: 'risk_score', score: 55, threshold: 70 } },
    {
      t: 7500,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller claims to be from your bank and is building urgency.',
          th: 'ผู้โทรอ้างว่าเป็นเจ้าหน้าที่ธนาคารและกำลังสร้างความเร่งรีบ',
        },
        intents: [intent.impersonation, intent.urgency],
      },
    },
    {
      t: 9500,
      event: {
        type: 'transcript',
        seq: 4,
        speaker: 'caller',
        text: {
          en: 'Please read out the one-time code we just texted to your phone.',
          th: 'รบกวนอ่านรหัสใช้ครั้งเดียวที่เพิ่งส่ง SMS ไปยังมือถือของคุณด้วยครับ',
        },
      },
    },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 89 } },
    { t: 10500, event: { type: 'risk_score', score: 91, threshold: 70 } },
    {
      t: 10800,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is now directly requesting your one-time passcode (OTP).',
          th: 'ผู้โทรกำลังขอรหัสผ่านใช้ครั้งเดียว (OTP) ของคุณโดยตรง',
        },
        intents: [intent.impersonation, intent.urgency, intent.asksForOtp],
      },
    },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'This voice is likely fake. Caller is asking for your bank OTP.',
          th: 'เสียงนี้มีแนวโน้มเป็นเสียงปลอม ผู้โทรกำลังขอรหัส OTP ธนาคารของคุณ',
        },
        reasons: [
          { en: 'Voice print does not match a known-genuine sample', th: 'ลายเสียงไม่ตรงกับตัวอย่างเสียงจริงที่รู้จัก' },
          { en: 'Caller requested a one-time passcode', th: 'ผู้โทรขอรหัสผ่านใช้ครั้งเดียว' },
          { en: 'High urgency / pressure language detected', th: 'ตรวจพบการใช้ถ้อยคำเร่งรัดและกดดันสูง' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 12.5 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: "The caller's voice showed cloning artifacts inconsistent with a real bank officer.",
          th: 'เสียงของผู้โทรมีร่องรอยการโคลนเสียงที่ไม่สอดคล้องกับเจ้าหน้าที่ธนาคารตัวจริง',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Urgency and authority-impersonation language triggered the context model.',
          th: 'ถ้อยคำเร่งรีบและการแอบอ้างอำนาจหน้าที่ทำให้โมเดลวิเคราะห์บริบทแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'A request for a one-time passcode is a hallmark of an account-takeover scam.',
          th: 'การขอรหัสผ่านใช้ครั้งเดียวเป็นสัญญาณเด่นของการหลอกยึดบัญชี',
        },
      },
      scamResponseStage,
    ],
  },
}

const policeOfficer: ScenarioDefinition = {
  list: {
    id: 'police-officer',
    title: { en: 'Fake police officer', th: 'แอบอ้างเป็นเจ้าหน้าที่ตำรวจ' },
    tag: { en: 'Aggressive', th: 'กดดันหนัก' },
    description: {
      en: 'A caller impersonates law enforcement about an illegal parcel in your name.',
      th: 'ผู้โทรแอบอ้างเป็นเจ้าหน้าที่รัฐ อ้างว่ามีพัสดุผิดกฎหมายในชื่อของคุณ',
    },
    icon: 'authority',
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
          en: 'This is Officer Somchai from the Customs Investigation Unit.',
          th: 'นี่คือเจ้าหน้าที่สมชายจากหน่วยสืบสวนศุลกากรครับ',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 49 } },
    {
      t: 4500,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'caller',
        text: {
          en: 'We intercepted a parcel with illegal substances registered under your name.',
          th: 'เราตรวจยึดพัสดุที่มีสิ่งผิดกฎหมายซึ่งลงทะเบียนในชื่อของคุณ',
        },
      },
    },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 68 } },
    { t: 5500, event: { type: 'risk_score', score: 52, threshold: 70 } },
    {
      t: 7500,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is impersonating a law-enforcement authority.',
          th: 'ผู้โทรกำลังแอบอ้างเป็นเจ้าหน้าที่ผู้บังคับใช้กฎหมาย',
        },
        intents: [intent.impersonation, intent.authority],
      },
    },
    {
      t: 9500,
      event: {
        type: 'transcript',
        seq: 4,
        speaker: 'caller',
        text: {
          en: 'You must stay on the line and pay a clearance fee to avoid arrest.',
          th: 'คุณต้องถือสายไว้และชำระค่าดำเนินการเพื่อเลี่ยงการถูกจับกุม',
        },
      },
    },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 81 } },
    { t: 10500, event: { type: 'risk_score', score: 85, threshold: 70 } },
    {
      t: 10800,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is demanding an immediate payment to avoid arrest.',
          th: 'ผู้โทรเรียกให้ชำระเงินทันทีเพื่อเลี่ยงการถูกจับกุม',
        },
        intents: [intent.impersonation, intent.urgency, intent.paymentDemand],
      },
    },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'This voice is likely fake. Caller is threatening arrest to demand payment.',
          th: 'เสียงนี้มีแนวโน้มเป็นเสียงปลอม ผู้โทรขู่จับกุมเพื่อเรียกเงิน',
        },
        reasons: [
          { en: 'Voice cloning artifacts detected', th: 'ตรวจพบร่องรอยการโคลนเสียง' },
          { en: 'Caller impersonated a government authority', th: 'ผู้โทรแอบอ้างเป็นเจ้าหน้าที่รัฐ' },
          { en: 'Payment demanded under threat of arrest', th: 'เรียกเก็บเงินโดยขู่ว่าจะจับกุม' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 12.5 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'Vocal-synthesis artifacts were detected partway through the call.',
          th: 'ตรวจพบร่องรอยการสังเคราะห์เสียงระหว่างการสนทนา',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Authority impersonation and legal threats triggered the context model.',
          th: 'การแอบอ้างอำนาจหน้าที่และการขู่ทางกฎหมายทำให้โมเดลวิเคราะห์บริบทแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'A demand for payment to avoid arrest is a classic law-enforcement impersonation scam.',
          th: 'การเรียกเงินเพื่อเลี่ยงการถูกจับกุมเป็นกลโกงแอบอ้างเจ้าหน้าที่ที่พบบ่อย',
        },
      },
      scamResponseStage,
    ],
  },
}

const grandchild: ScenarioDefinition = {
  list: {
    id: 'grandchild-emergency',
    title: { en: 'Cloned grandchild emergency', th: 'โคลนเสียงหลานอ้างเหตุฉุกเฉิน' },
    tag: { en: 'Voice clone', th: 'โคลนเสียง' },
    description: {
      en: 'A cloned voice pretending to be a grandchild begs for emergency money.',
      th: 'เสียงที่ถูกโคลนแกล้งเป็นหลาน ร้องขอเงินฉุกเฉินอย่างเร่งด่วน',
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
          en: "Grandma, it's me — I'm in trouble, please don't hang up.",
          th: 'ยาย หนูเองนะ หนูมีเรื่องเดือดร้อน อย่าเพิ่งวางสายนะ',
        },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 72 } },
    {
      t: 4500,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'caller',
        text: {
          en: "I got in an accident and I need bail money right now, please don't tell mom and dad.",
          th: 'หนูประสบอุบัติเหตุ ต้องใช้เงินประกันตัวเดี๋ยวนี้ อย่าบอกพ่อกับแม่นะ',
        },
      },
    },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 90 } },
    { t: 5500, event: { type: 'risk_score', score: 80, threshold: 70 } },
    {
      t: 7500,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller claims to be a family member in an emergency and discourages contacting others.',
          th: 'ผู้โทรอ้างเป็นคนในครอบครัวที่กำลังฉุกเฉิน และห้ามไม่ให้ติดต่อคนอื่น',
        },
        intents: [intent.familyImpersonation, intent.urgency, intent.isolation],
      },
    },
    {
      t: 9500,
      event: {
        type: 'transcript',
        seq: 4,
        speaker: 'caller',
        text: {
          en: "Can you send money through the link I'm about to text you? Please hurry.",
          th: 'ยายโอนเงินผ่านลิงก์ที่หนูกำลังจะส่งไปให้ได้ไหม รีบหน่อยนะ',
        },
      },
    },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 95 } },
    { t: 10500, event: { type: 'risk_score', score: 93, threshold: 70 } },
    {
      t: 10800,
      event: {
        type: 'context_update',
        summary: {
          en: 'Caller is requesting an urgent money transfer.',
          th: 'ผู้โทรกำลังขอให้โอนเงินอย่างเร่งด่วน',
        },
        intents: [intent.familyImpersonation, intent.urgency, intent.moneyTransfer],
      },
    },
    { t: 11200, event: { type: 'state', value: 'suspicious' } },
    {
      t: 12500,
      event: {
        type: 'alert',
        level: 'scam',
        reasonMain: {
          en: 'A cloned family voice begs for emergency money.',
          th: 'เสียงคนในครอบครัวที่ถูกโคลนกำลังร้องขอเงินฉุกเฉิน',
        },
        reasons: [
          { en: 'Voice cloning artifacts strongly detected', th: 'ตรวจพบร่องรอยการโคลนเสียงอย่างชัดเจน' },
          {
            en: 'Emergency-money request from an unverified relative claim',
            th: 'มีการขอเงินฉุกเฉินจากผู้ที่อ้างเป็นญาติแต่ยังไม่ได้ยืนยันตัวตน',
          },
          { en: 'Caller discouraged contacting other family members', th: 'ผู้โทรห้ามไม่ให้ติดต่อคนอื่นในครอบครัว' },
        ],
        guardiansNotified: true,
      },
    },
    { t: 12700, event: { type: 'state', value: 'alerted' } },
  ],
  debrief: {
    verdict: 'scam',
    caption: {
      en: 'PaTuean flagged this call as a likely scam in 12.5 seconds.',
      th: 'ป้าเตือน ระบุว่าสายนี้น่าจะเป็นมิจฉาชีพภายใน 12.5 วินาที',
    },
    stages: [
      {
        title: { en: 'Voice analysis', th: 'การวิเคราะห์เสียง' },
        description: {
          en: 'The voice was a strong match for an AI clone, not the real grandchild.',
          th: 'เสียงตรงกับเสียงที่สร้างด้วย AI อย่างมาก ไม่ใช่หลานตัวจริง',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'Emotional urgency plus isolation language ("don\'t tell mom and dad") triggered the model.',
          th: 'การเร้าอารมณ์ให้เร่งรีบร่วมกับการกันไม่ให้ปรึกษาผู้อื่น ("อย่าบอกพ่อกับแม่") ทำให้โมเดลแจ้งเตือน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'An unverified urgent money transfer request is a hallmark of a family-emergency scam.',
          th: 'การขอให้โอนเงินด่วนโดยไม่ยืนยันตัวตนเป็นสัญญาณเด่นของกลโกงอ้างเหตุฉุกเฉินในครอบครัว',
        },
      },
      scamResponseStage,
    ],
  },
}

const legitimate: ScenarioDefinition = {
  list: {
    id: 'legitimate-call',
    title: { en: 'A real, everyday call', th: 'สายปกติในชีวิตประจำวัน' },
    tag: { en: 'Control', th: 'สายปกติ' },
    description: {
      en: 'See how PaTuean stays quiet during an ordinary, safe conversation.',
      th: 'ดูว่า ป้าเตือน เงียบอย่างไรเมื่อเป็นการสนทนาปกติที่ปลอดภัย',
    },
    icon: 'safe',
  },
  events: [
    { t: 0, event: { type: 'state', value: 'monitoring' } },
    {
      t: 1500,
      event: {
        type: 'transcript',
        seq: 0,
        speaker: 'caller',
        text: { en: "Hey, it's me, just calling to check in.", th: 'นี่ฉันเอง โทรมาถามไถ่สารทุกข์สุกดิบเฉย ๆ' },
      },
    },
    { t: 2200, event: { type: 'spoof_score', seq: 1, score: 6 } },
    {
      t: 4500,
      event: {
        type: 'transcript',
        seq: 2,
        speaker: 'caller',
        text: { en: 'Are we still on for dinner on Saturday?', th: 'วันเสาร์เรายังนัดกินข้าวเย็นกันอยู่ใช่ไหม' },
      },
    },
    { t: 5200, event: { type: 'spoof_score', seq: 3, score: 8 } },
    { t: 5500, event: { type: 'risk_score', score: 4, threshold: 70 } },
    {
      t: 7500,
      event: {
        type: 'context_update',
        summary: {
          en: 'Casual personal call, no financial or urgent requests detected.',
          th: 'สายส่วนตัวทั่วไป ไม่พบการขอเรื่องเงินหรือเรื่องเร่งด่วน',
        },
        intents: [intent.personal, intent.lowRisk],
      },
    },
    {
      t: 9500,
      event: {
        type: 'transcript',
        seq: 4,
        speaker: 'caller',
        text: { en: "Great, I'll see you then. Talk soon!", th: 'เยี่ยม งั้นเจอกันวันนั้นนะ ไว้คุยกันใหม่' },
      },
    },
    { t: 10200, event: { type: 'spoof_score', seq: 5, score: 5 } },
    { t: 10500, event: { type: 'risk_score', score: 3, threshold: 70 } },
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
          en: 'The voice print was consistent with a real, unmodified human voice throughout.',
          th: 'ลายเสียงสอดคล้องกับเสียงมนุษย์จริงที่ไม่ถูกดัดแปลงตลอดการสนทนา',
        },
      },
      {
        title: { en: 'Language patterns', th: 'รูปแบบการใช้ภาษา' },
        description: {
          en: 'No urgency, authority, or financial-request language was detected.',
          th: 'ไม่พบถ้อยคำเร่งรีบ อ้างอำนาจ หรือการขอเรื่องเงิน',
        },
      },
      {
        title: { en: 'The ask', th: 'สิ่งที่ผู้โทรร้องขอ' },
        description: {
          en: 'No money, codes, or personal information were requested.',
          th: 'ไม่มีการขอเงิน รหัส หรือข้อมูลส่วนตัว',
        },
      },
      {
        title: { en: 'Response', th: 'การตอบสนอง' },
        description: {
          en: 'No alert was needed — the call was allowed to proceed normally.',
          th: 'ไม่จำเป็นต้องแจ้งเตือน ปล่อยให้สายดำเนินไปตามปกติ',
        },
      },
    ],
  },
}

const scenarios: Record<string, ScenarioDefinition> = {
  [bankOfficer.list.id]: bankOfficer,
  [policeOfficer.list.id]: policeOfficer,
  [grandchild.list.id]: grandchild,
  [legitimate.list.id]: legitimate,
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
  return { id, audioUrl: `mock://scenario/${id}.mp3`, events }
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
