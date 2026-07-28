export type Msg =
  | { from: 'them' | 'us'; kind: 'text'; text: string; rtl?: boolean; typing?: number }
  | {
      from: 'us'
      kind: 'product'
      title: string
      price: string
      stock: string
      meta: string
      swatch: string
      typing?: number
    }
  | { from: 'us'; kind: 'order'; id: string; item: string; total: string; note: string; typing?: number }
  | { from: 'us'; kind: 'booking'; when: string; who: string; note: string; typing?: number }

export type Thread = {
  id: 'whatsapp' | 'instagram' | 'messenger'
  channel: string
  brand: string
  accent: string
  handle: string
  person: string
  status: string
  messages: Msg[]
  /** Agent actions, revealed in step with the message of the same index. */
  events: { at: number; label: string; detail: string }[]
}

export const THREADS: Thread[] = [
  {
    id: 'whatsapp',
    channel: 'WhatsApp',
    brand: 'Cartiva AI',
    accent: 'var(--color-wa)',
    handle: '+20 10 •• •• 4412',
    person: 'Nour H.',
    status: 'online',
    messages: [
      {
        from: 'them',
        kind: 'text',
        rtl: true,
        text: 'السلام عليكم، الجاكيت الجلد اللي في الاستوري ده متوفر؟ وبكام؟',
      },
      {
        from: 'us',
        kind: 'product',
        typing: 1400,
        title: 'Leather Biker Jacket',
        price: 'EGP 2,450',
        stock: '6 in stock',
        meta: 'Sizes M · L · XL',
        swatch: 'linear-gradient(135deg,#3a2a22,#7a5a44)',
      },
      {
        from: 'us',
        kind: 'text',
        rtl: true,
        typing: 700,
        text: 'أيوه متوفر 👌 السعر ٢٤٥٠ جنيه، والمقاسات M و L و XL. تحب أحجزلك مقاس؟',
      },
      { from: 'them', kind: 'text', rtl: true, text: 'تمام، ابعتلي L. والدفع عند الاستلام' },
      {
        from: 'us',
        kind: 'order',
        typing: 1600,
        id: '#1042',
        item: 'Leather Biker Jacket — L',
        total: 'EGP 2,450 · COD',
        note: 'Created in Shopify',
      },
      {
        from: 'us',
        kind: 'text',
        rtl: true,
        typing: 600,
        text: 'اتسجل ✅ طلبك رقم #1042، هيوصلك خلال ٢-٣ أيام. هنبعتلك رقم الشحنة أول ما يخرج.',
      },
    ],
    events: [
      { at: 0, label: 'classify', detail: 'intent=product_inquiry · ar-EG · 0.94' },
      { at: 1, label: 'catalogue.search', detail: 'match: SKU CRT-JKT-118' },
      { at: 1, label: 'shopify.inventory', detail: '6 available · 3 variants' },
      { at: 3, label: 'classify', detail: 'intent=purchase_intent · 0.97' },
      { at: 4, label: 'shopify.orders.create', detail: 'order #1042 · EGP 2,450 · COD' },
      { at: 5, label: 'lead.score', detail: '91 / 100 — high potential' },
    ],
  },
  {
    id: 'instagram',
    channel: 'Instagram',
    brand: 'Cartiva AI',
    accent: 'var(--color-ig)',
    handle: '@nadine.k',
    person: 'Nadine K.',
    status: 'Active now',
    messages: [
      {
        from: 'them',
        kind: 'text',
        text: 'hey! saw the linen shirt on your reel — do you ship to Alexandria?',
      },
      {
        from: 'us',
        kind: 'text',
        typing: 1100,
        text: 'We do — 2 days to Alexandria, EGP 60 shipping. The Linen Shirt is EGP 890.',
      },
      {
        from: 'us',
        kind: 'product',
        typing: 500,
        title: 'Oversized Linen Shirt',
        price: 'EGP 890',
        stock: '14 in stock',
        meta: 'Sand · Olive · Black',
        swatch: 'linear-gradient(135deg,#cbb894,#6d7355)',
      },
      { from: 'them', kind: 'text', text: 'perfect, size M in sand please 🙌' },
      {
        from: 'us',
        kind: 'text',
        typing: 1200,
        text: 'Reserved for 30 minutes. Checkout → cartiva.shop/c/8f21 — I’ll confirm the second it goes through.',
      },
    ],
    events: [
      { at: 0, label: 'classify', detail: 'intent=shipping_query · en · 0.91' },
      { at: 0, label: 'kb.retrieve', detail: 'policies/shipping · 2 passages' },
      { at: 1, label: 'catalogue.search', detail: 'match: SKU CRT-SHR-042' },
      { at: 3, label: 'inventory.reserve', detail: 'M / Sand · held 30 min' },
      { at: 4, label: 'checkout.link', detail: 'cartiva.shop/c/8f21' },
    ],
  },
  {
    id: 'messenger',
    channel: 'Messenger',
    brand: 'Opsy AI',
    accent: 'var(--color-msgr)',
    handle: 'Tarek Samir',
    person: 'Tarek S.',
    status: 'Typically replies instantly',
    messages: [
      { from: 'them', kind: 'text', text: 'Do you have a slot for a consultation this week?' },
      {
        from: 'us',
        kind: 'text',
        typing: 1000,
        text: 'Thursday 4:00 PM or Saturday 11:30 AM are open — both 45 minutes, on Google Meet.',
      },
      { from: 'them', kind: 'text', text: 'Thursday works. Can you send an invite to tarek@…?' },
      {
        from: 'us',
        kind: 'booking',
        typing: 1500,
        when: 'Thu 4:00 PM — 4:45 PM',
        who: 'Consultation · Google Meet',
        note: 'Added to Google Calendar',
      },
      {
        from: 'us',
        kind: 'text',
        typing: 500,
        text: 'Confirmed and invited. You’ll get a reminder an hour before — reply here to move it.',
      },
    ],
    events: [
      { at: 0, label: 'classify', detail: 'intent=booking_request · en · 0.96' },
      { at: 1, label: 'calendar.freebusy', detail: '2 slots found this week' },
      { at: 3, label: 'calendar.events.create', detail: 'Thu 16:00 · invite sent' },
      { at: 3, label: 'meetings.upsert', detail: 'row created · status=confirmed' },
      { at: 4, label: 'reminder.schedule', detail: 'T-60 min · WhatsApp + email' },
    ],
  },
]
