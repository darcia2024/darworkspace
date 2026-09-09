export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'PARKED';

export type LaneType = 'client_delivery' | 'maintenance' | 'bizdev' | 'own_product' | 'operations' | 'parking_lot';

export type BoardColumn = 'DOING' | 'QUEUE' | 'WAITING' | 'PARKED' | 'DONE';

export interface ProjectCard {
  id: string;
  name: string;
  lane: LaneType;
  boardColumn: BoardColumn;
  status: 'Doing' | 'Queue' | 'Waiting Kickoff' | 'Waiting Payment' | 'Waiting Approval' | 'Waiting Client' | 'Active' | 'Discovery / Lead' | 'Parked' | 'Ongoing' | 'Done';
  paymentStatus: 'Paid' | 'Partial' | 'Free' | 'Expected' | 'Deal Confirmed' | 'Waiting Payment' | 'Recurring/Pipeline' | 'Parked';
  valueText: string;
  nominalNumeric: number;
  paidNumeric: number;
  unpaidNumeric: number;
  priority: PriorityLevel;
  currentGoal: string;
  nextAction: string;
  blocker?: string;
  definitionOfDone?: string;
  rule?: string;
  timebox?: string;
  scopeDetails?: string;
  billingMilestone?: string;
  followUpDeadline?: string;
}

export interface TodayBlock {
  projectId?: string;
  id: string;
  blockType: 'Deep Work 1' | 'Deep Work 2' | 'Deep Work 3' | 'Growth Block' | 'Admin/Maintenance' | 'Admin/Product';
  projectName: string;
  action: string;
  timeboxMinutes: number;
  isDone: boolean;
  rule: string;
}

export interface WaitingItem {
  projectId?: string;
  id: string;
  name: string;
  reason: string;
  value: string;
  nextTrigger: string;
  actionToUnblock: string;
  followUpDate: string;
  status: 'Waiting Kickoff' | 'Waiting Payment' | 'Waiting Approval' | 'Waiting Client' | 'Discovery';
}

export interface AssetAccount {
  name: string;
  balance: number;
  isLatest: boolean;
  lastUpdated: string;
  type: 'bank' | 'ewallet' | 'cash';
}

export interface AssetTrajectoryPoint {
  date: string;
  balance: number;
  note?: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer' | 'balance_update';
  amount: number;
  accountName: string;
  toAccountName?: string;
  category: string;
  description: string;
  photoUrl?: string;
  linkedProjectId?: string;
  createdAt: string;
}

export interface MonthlyExpenseItem {
  id: string;
  category: string;
  estimatedAmount: number | 'fleksibel' | 'tidak selalu bulanan';
  amountText: string;
  status: 'Wajib' | 'Produktif / langganan aktif' | 'Wajib, fleksibel';
  isFixed: boolean;
  notes?: string;
  isPaid?: boolean;
  paidDate?: string;
  paidMonth?: string;
}

export interface FinancialReport {
  asOfDate: string;
  totalLiquidBalance: number;
  modeStatus: 'RED MODE - CASH DEFENSE' | 'YELLOW MODE - CAUTION' | 'GREEN MODE - GROWTH';
  hardFloor: number;
  financialDebt: number;
  projectLiabilityNote: string;
  accounts: AssetAccount[];
  trajectory: AssetTrajectoryPoint[];
  transactions: TransactionRecord[];
  monthlyExpenses: MonthlyExpenseItem[];
  fixedMonthlyBurn: number;
  estimatedRealBurn: number;
  runwayDays: number;
  runwayMonths: number;
  dropFrom26Aug: number;
  dropFrom12Aug: number;
  dropPercentageFrom12Aug: number;
  recoveryRoadmap: {
    stage1: string;
    stage2: string;
    stage3: string;
    stage4: string;
  };
  monthlyIncomeTarget?: number;
  defenseProtocolRule: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  projectId?: string;
  projectName: string;
  clientName: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  notes: string;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  createdAt: string;
}

export interface QuickStats {
  paidClientActive: number;
  waitingPaymentKickoff: number;
  maintenanceOpen: number;
  salesAndProductActive: number;
}

export interface TodayPursuit {
  projectId?: string;
  id: string;
  project: string;
  action: string;
  title?: string;
  tag?: string;
  timeEstimate?: string;
  impact?: string;
  isDone?: boolean;
  isCompleted?: boolean;
}

export interface DaruWorkOSState {
  todayPursuit: TodayPursuit[];
  quickStats: QuickStats;
  todayBlocks: TodayBlock[];
  projects: ProjectCard[];
  waitingItems: WaitingItem[];
  financialReport: FinancialReport;
  invoices?: InvoiceRecord[];
  currentFocusTaskId?: string;
}

export type ActiveTabType = 'today' | 'nextgo' | 'lanes' | 'waiting' | 'money' | 'deepwork';
