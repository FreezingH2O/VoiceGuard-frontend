import { LegalDocScreen, type LegalSection } from '@/screens/legal/LegalDocScreen'
import { useLang } from '@/i18n/LangProvider'

export function TermsScreen() {
  const { t } = useLang()

  const sections: LegalSection[] = [
    {
      id: 'acceptance',
      heading: t({ en: 'Acceptance of these terms', th: 'การยอมรับข้อกำหนด' }),
      blocks: [
        t({
          en: 'By creating an account or using VoiceGuard, you agree to these terms. If you do not agree, please do not use the demo. These terms cover the proof-of-concept demo described here, not any future commercial product.',
          th: 'เมื่อสร้างบัญชีหรือใช้ VoiceGuard คุณตกลงตามข้อกำหนดเหล่านี้ หากไม่ตกลง โปรดอย่าใช้เดโม',
        }),
      ],
    },
    {
      id: 'what-it-is',
      heading: t({ en: 'What VoiceGuard is', th: 'VoiceGuard คืออะไร' }),
      blocks: [
        t({
          en: 'VoiceGuard demonstrates real-time scam-call and AI-voice detection. The web demo has two clearly labeled zones: a LIVE detection engine that runs real models on a clip you submit, and a PREVIEW of the future mobile app running on sample data.',
          th: 'VoiceGuard สาธิตการตรวจจับสายหลอกลวงและเสียง AI แบบเรียลไทม์ เดโมมีสองโซนที่ระบุชัดเจน: เครื่องมือ LIVE ที่รันโมเดลจริง และ PREVIEW ของแอปมือถือในอนาคตบนข้อมูลตัวอย่าง',
        }),
      ],
    },
    {
      id: 'not-security',
      heading: t({ en: 'Not a production security service', th: 'ไม่ใช่บริการความปลอดภัยเชิงพาณิชย์' }),
      blocks: [
        t({
          en: 'This is a demo. It may be unavailable, incomplete, or inaccurate, and it must not be relied on to protect you from an actual scam. A verdict from the demo is informational only.',
          th: 'นี่คือเดโม อาจใช้งานไม่ได้ ไม่สมบูรณ์ หรือไม่แม่นยำ และต้องไม่ใช้เพื่อป้องกันการหลอกลวงจริง ผลลัพธ์จากเดโมเป็นเพียงข้อมูลประกอบเท่านั้น',
        }),
        {
          list: [
            t({ en: 'Do not upload audio you do not have the right to share.', th: 'อย่าอัปโหลดเสียงที่คุณไม่มีสิทธิ์แบ่งปัน' }),
            t({ en: 'Do not use the demo for unlawful or harmful purposes.', th: 'อย่าใช้เดโมเพื่อจุดประสงค์ที่ผิดกฎหมายหรือเป็นอันตราย' }),
            t({ en: 'Do not attempt to disrupt, overload, or reverse-engineer the service.', th: 'อย่าพยายามรบกวน ทำให้โอเวอร์โหลด หรือทำวิศวกรรมย้อนกลับบริการ' }),
          ],
        },
      ],
    },
    {
      id: 'accounts',
      heading: t({ en: 'Your account', th: 'บัญชีของคุณ' }),
      blocks: [
        t({
          en: 'You are responsible for the information you enter. Because the demo performs no identity verification, please use non-sensitive test details. You may stop using VoiceGuard and log out at any time.',
          th: 'คุณรับผิดชอบต่อข้อมูลที่กรอก เนื่องจากเดโมไม่มีการยืนยันตัวตน โปรดใช้ข้อมูลทดสอบที่ไม่ละเอียดอ่อน',
        }),
      ],
    },
    {
      id: 'liability',
      heading: t({ en: 'Disclaimer & liability', th: 'ข้อจำกัดความรับผิด' }),
      blocks: [
        t({
          en: 'The demo is provided "as is", without warranties of any kind. To the fullest extent permitted by law, the VoiceGuard team is not liable for any loss arising from your use of, or reliance on, the demo.',
          th: 'เดโมให้บริการ "ตามสภาพ" โดยไม่มีการรับประกันใด ๆ ทีม VoiceGuard ไม่รับผิดต่อความเสียหายที่เกิดจากการใช้หรือพึ่งพาเดโมเท่าที่กฎหมายอนุญาต',
        }),
      ],
    },
    {
      id: 'changes',
      heading: t({ en: 'Changes', th: 'การเปลี่ยนแปลง' }),
      blocks: [
        t({
          en: 'We may update these terms as the demo evolves. Continued use after an update means you accept the revised terms.',
          th: 'เราอาจปรับปรุงข้อกำหนดเมื่อเดโมพัฒนาขึ้น การใช้งานต่อหลังการอัปเดตถือว่าคุณยอมรับข้อกำหนดที่แก้ไขแล้ว',
        }),
      ],
    },
  ]

  return (
    <LegalDocScreen
      title={t({ en: 'Terms of service', th: 'ข้อกำหนดการใช้งาน' })}
      updated={t({ en: 'Last updated · 9 July 2026', th: 'อัปเดตล่าสุด · 9 กรกฎาคม 2026' })}
      intro={t({
        en: 'The ground rules for using the VoiceGuard demo. Short, readable, and honest about what this build is.',
        th: 'กติกาพื้นฐานในการใช้เดโม VoiceGuard สั้น อ่านง่าย และตรงไปตรงมาเกี่ยวกับสิ่งที่บิลด์นี้เป็น',
      })}
      sections={sections}
    />
  )
}
