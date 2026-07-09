import { LegalDocScreen, type LegalSection } from '@/screens/legal/LegalDocScreen'
import { useLang } from '@/i18n/LangProvider'

export function PrivacyScreen() {
  const { t } = useLang()

  const sections: LegalSection[] = [
    {
      id: 'overview',
      heading: t({ en: 'Overview', th: 'ภาพรวม' }),
      blocks: [
        t({
          en: 'PaTuean is a proof-of-concept demo, not a production security product. This policy explains what the demo does and does not do with your information so you can explore it with confidence. Where the real mobile product would behave differently, we say so.',
          th: 'ป้าเตือน เป็นเดโมเชิงพิสูจน์แนวคิด ไม่ใช่ผลิตภัณฑ์ความปลอดภัยเชิงพาณิชย์ นโยบายนี้อธิบายว่าเดโมทำและไม่ทำอะไรกับข้อมูลของคุณ เพื่อให้คุณสำรวจได้อย่างมั่นใจ',
        }),
      ],
    },
    {
      id: 'what-we-collect',
      heading: t({ en: 'What we collect', th: 'ข้อมูลที่เราเก็บ' }),
      blocks: [
        t({
          en: 'To create a demo account we ask for a name, phone number, and email. No verification is performed and no password is stored — this is deliberate, because the demo is not meant to hold real credentials.',
          th: 'ในการสร้างบัญชีเดโม เราขอชื่อ หมายเลขโทรศัพท์ และอีเมล โดยไม่มีการยืนยันตัวตนและไม่เก็บรหัสผ่าน',
        }),
        {
          list: [
            t({ en: 'Account details you enter (name, phone, email).', th: 'ข้อมูลบัญชีที่คุณกรอก (ชื่อ โทรศัพท์ อีเมล)' }),
            t({ en: 'Voice clips you choose to upload or record in the Live Detector.', th: 'คลิปเสียงที่คุณเลือกอัปโหลดหรืออัดในเครื่องตรวจจับสด' }),
            t({ en: 'Basic technical data your browser sends (for the app to function).', th: 'ข้อมูลทางเทคนิคพื้นฐานที่เบราว์เซอร์ส่งมา (เพื่อให้แอปทำงาน)' }),
          ],
        },
      ],
    },
    {
      id: 'call-audio',
      heading: t({ en: 'Call audio & the detection engine', th: 'เสียงสายและเครื่องมือตรวจจับ' }),
      blocks: [
        t({
          en: 'The web demo cannot access your real phone calls — a browser has no way to tap live cellular audio. The only audio involved is the clip you knowingly submit to the Live Detector.',
          th: 'เดโมบนเว็บไม่สามารถเข้าถึงสายโทรศัพท์จริงของคุณได้ เสียงเดียวที่เกี่ยวข้องคือคลิปที่คุณส่งให้เครื่องตรวจจับสดเอง',
        }),
        t({
          en: 'That clip is sent to our analysis pipeline (anti-spoof, speech-to-text, and language models), scored, and returned to you. We do not store the raw audio after analysis, and we never sell it. In the future on-device mobile product, analysis is designed to run on the call in real time without keeping the raw recording.',
          th: 'คลิปนั้นถูกส่งไปยังระบบวิเคราะห์ ให้คะแนน และส่งผลกลับมา เราไม่เก็บไฟล์เสียงต้นฉบับหลังการวิเคราะห์ และไม่ขายข้อมูลนั้น',
        }),
      ],
    },
    {
      id: 'how-we-use',
      heading: t({ en: 'How we use information', th: 'เราใช้ข้อมูลอย่างไร' }),
      blocks: [
        {
          list: [
            t({ en: 'To run the detection you request and show you the result.', th: 'เพื่อรันการตรวจจับที่คุณขอและแสดงผลให้คุณ' }),
            t({ en: 'To keep your session-local test history while you explore.', th: 'เพื่อเก็บประวัติการทดสอบในเซสชันของคุณระหว่างสำรวจ' }),
            t({ en: 'To operate, secure, and improve the demo.', th: 'เพื่อดำเนินการ รักษาความปลอดภัย และปรับปรุงเดโม' }),
          ],
        },
        t({
          en: 'We do not use your information for advertising, and we do not share it with third parties except the infrastructure providers needed to run the analysis.',
          th: 'เราไม่ใช้ข้อมูลของคุณเพื่อการโฆษณา และไม่แบ่งปันกับบุคคลที่สาม ยกเว้นผู้ให้บริการโครงสร้างพื้นฐานที่จำเป็น',
        }),
      ],
    },
    {
      id: 'your-choices',
      heading: t({ en: 'Your choices', th: 'ตัวเลือกของคุณ' }),
      blocks: [
        t({
          en: 'You can log out at any time, and most demo data lives only in your current browser session. Because this is a demo, please avoid entering sensitive real-world personal information.',
          th: 'คุณสามารถออกจากระบบได้ตลอดเวลา และข้อมูลเดโมส่วนใหญ่อยู่ในเซสชันเบราว์เซอร์ปัจจุบันเท่านั้น เนื่องจากเป็นเดโม โปรดหลีกเลี่ยงการกรอกข้อมูลส่วนบุคคลจริงที่ละเอียดอ่อน',
        }),
      ],
    },
    {
      id: 'contact',
      heading: t({ en: 'Contact', th: 'ติดต่อ' }),
      blocks: [
        t({
          en: 'Questions about this demo or its handling of data can be sent to privacy@patuean.example. We will respond as the demo team, not as a commercial data controller.',
          th: 'คำถามเกี่ยวกับเดโมนี้หรือการจัดการข้อมูล ส่งได้ที่ privacy@patuean.example',
        }),
      ],
    },
  ]

  return (
    <LegalDocScreen
      title={t({ en: 'Privacy policy', th: 'นโยบายความเป็นส่วนตัว' })}
      updated={t({ en: 'Last updated · 9 July 2026', th: 'อัปเดตล่าสุด · 9 กรกฎาคม 2026' })}
      intro={t({
        en: 'How PaTuean handles your information — written plainly, because trust is the whole point of a product like this.',
        th: 'ป้าเตือน จัดการข้อมูลของคุณอย่างไร — เขียนอย่างตรงไปตรงมา เพราะความไว้วางใจคือหัวใจของผลิตภัณฑ์แบบนี้',
      })}
      sections={sections}
    />
  )
}
