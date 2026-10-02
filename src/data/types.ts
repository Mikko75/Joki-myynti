export type ProposalSectionStatus = "draft" | "sent" | "approved" | "changes_requested" | "expired"

export interface ProposalSection {
  sectionKey: string
  sentAt: string | null
  status: ProposalSectionStatus
  clientComment?: string
  deadline?: string
}

export type WorkOrderStatus =
  | 'uusi'
  | 'tyonalla'
  | 'asiakkaalla'
  | 'vahvistettu'
  | 'ei_toteudu'

export type SectionStatus = 'ei_aloitettu' | 'kaynnissa' | 'valmis'

export type CateringStatus =
  | 'ei_aloitettu'
  | 'luonnos'
  | 'kumppanilla'
  | 'vastattu'
  | 'valmis'

export type OfferStatus =
  | 'luonnos'
  | 'asiakkaalla'
  | 'muutoksia_pyydetty'
  | 'hyvaksytty'
  | 'hylatty'

export type ScheduleItemType = 'ajankohta' | 'ohjelma' | 'catering' | 'av' | 'lisapalvelu'

export type ScheduleItemStatus = 'luonnos' | 'valmis'

export type EventSource = 'web' | 'sahkoposti' | 'puhelin'

export type EventNature = 'yritys_sisainen' | 'julkinen' | 'yksityinen' | ''
export type SeatingStyle = 'teatteri' | 'luokkahuone' | 'u_muoto' | 'banketti' | 'cocktail' | 'muu' | ''
export type BudgetRange = 'alle_5000' | '5000_15000' | '15000_50000' | 'yli_50000' | ''

export interface WorkOrder {
  id: string
  number: string
  customerName: string
  customerCompany: string
  customerEmail?: string
  customerPhone?: string
  eventType: string
  status: WorkOrderStatus
  participantEstimate: number
  source: EventSource
  currentOfferVersion: number
  changeRound: number
  nextStep: string
  sectionStatuses: {
    tila: SectionStatus
    catering: SectionStatus
    av: SectionStatus
  }
  offerPhase: 'optio' | 'tarjous'
  eventDays: EventDay[]
  participants: Participant[]

  // Laajennetut perustiedot
  eventName?: string
  eventDescription?: string
  eventNature?: EventNature
  participantConfirmed?: number
  guestProfile?: string
  vipGuests?: string
  accessibilityNeeds?: string
  seatingStyle?: SeatingStyle
  needsBreakoutRooms?: boolean
  breakoutRoomCount?: number
  needsCatering?: 'yes' | 'no' | 'unknown'
  needsAV?: 'yes' | 'no'
  budgetRange?: BudgetRange
  budgetNotes?: string
  decisionMaker?: string
  decisionDeadline?: string
  isCompetitiveBid?: boolean
  additionalNotes?: string
  notes?: { id: string; text: string; createdAt: string }[]
  sectionNotes?: Record<string, string>
  attachments?: Attachment[]
  selectedAddOns?: { productId: string; quantity?: number }[]
  proposalSections?: ProposalSection[]
  customSections?: CustomSection[]
}

export interface ScheduleTemplateItem {
  title: string
  startTime: string
  endTime: string
  type: ScheduleItemType
}

export interface EventTemplate {
  id: string
  name: string
  description: string
  color: string
  isCustom?: boolean
  eventType: string
  eventNature?: EventNature
  seatingStyle?: SeatingStyle
  participantEstimate: number
  needsBreakoutRooms?: boolean
  breakoutRoomCount?: number
  needsCatering?: 'yes' | 'no' | 'unknown'
  needsAV?: 'yes' | 'no'
  budgetRange?: BudgetRange
  scheduleTemplate?: ScheduleTemplateItem[]
  suggestedSpaces?: string[]
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  addedAt: string
  addedBy: string
}

export interface CustomSection {
  id: string
  type: string
  title: string
  description: string
  price?: number
  attachments?: Attachment[]
  showToClient: boolean
}

export interface Participant {
  id: string
  name: string
  role: string
  initials: string
  color: string
}

export interface EventDay {
  id: string
  date: string
  label: string
  eventType: string
  bookingStart: string
  bookingEnd: string
  programStart: string
  programEnd: string
  doorsOpen: string
  guestsLeave: string
  spaces: EventSpace[]
  scheduleItems: ScheduleItem[]
}

export interface Space {
  id: string
  name: string
  description: string
  capacity: number
  type: string
  pricePerDay: number
  features: string[]
  available: boolean
  availableStart: string
  availableEnd: string
  image?: string
}

export interface EventSpace {
  spaceId: string
  spaceName: string
  role: string
  optionStatus: string
  price: number
}

export interface ScheduleItem {
  id: string
  type: ScheduleItemType
  title: string
  startTime: string
  endTime: string
  spaceName: string
  status: ScheduleItemStatus
  sourceLabel: string
}

export interface CateringPlan {
  id: string
  eventDayId: string
  partnerId: string
  status: CateringStatus
  participantCount: number
  dietaryNeeds: string
  servingArea: string
  servingPoints: number
  staffNeeded: string
  notes: string
  moments: CateringMoment[]
}

export interface CateringMoment {
  id: string
  title: string
  startTime: string
  endTime: string
  spaceName: string
  menuId: string
  menuName: string
  price: number
  status: string
}

export interface Menu {
  id: string
  partnerId: string
  name: string
  description: string
  pricePerPerson: number
  products: Product[]
  status: string
}

export interface Product {
  id: string
  d365Code: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  unit: string
  unitPrice: number
  vatPercent: number
  dietaryTags: string[]
  category: string
  validFrom: string
  validTo: string
  version: number
  active: boolean
}

export interface MenuCategory {
  id: string
  name: string
  sortOrder: number
}

export interface AVPlan {
  id: string
  eventDayId: string
  partnerId: string
  status: CateringStatus
  microphones: string
  audio: string
  screens: string
  streaming: string
  recording: string
  price: number
}

export interface Offer {
  id: string
  workOrderId: string
  version: number
  status: OfferStatus
  sentAt: string | null
  acceptedAt: string | null
  totalExVat: number
  vat: number
  totalIncVat: number
}

export interface ConversationMessage {
  id: string
  sender: string
  senderInitials: string
  senderColor: string
  content: string
  createdAt: string
  visibility: 'internal' | 'customer'
}
