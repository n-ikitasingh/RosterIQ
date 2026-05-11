export type DatasetColumn = { name: string; type: string; description?: string };
export type Dataset = {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
  table: string;
  file: string;
  rows: number;
  columns: DatasetColumn[];
  sampleQuestions: string[];
  insights: string[];
};

export const DATASETS: Dataset[] = [
  {
    id: "healthcare_providers",
    name: "Healthcare Providers",
    description: "National provider directory with claims volume and approval rates.",
    domain: "Healthcare",
    icon: "Stethoscope",
    table: "providers",
    file: "/datasets/healthcare_providers.csv",
    rows: 400,
    columns: [
      { name: "provider_id", type: "VARCHAR" },
      { name: "name", type: "VARCHAR" },
      { name: "specialty", type: "VARCHAR" },
      { name: "state", type: "VARCHAR" },
      { name: "city", type: "VARCHAR" },
      { name: "npi", type: "BIGINT" },
      { name: "years_experience", type: "INT" },
      { name: "patient_volume", type: "INT" },
      { name: "avg_rating", type: "DOUBLE" },
      { name: "accepts_medicare", type: "BOOLEAN" },
      { name: "claim_count", type: "INT" },
      { name: "approval_rate", type: "DOUBLE" },
    ],
    sampleQuestions: [
      "Show top 10 providers by claim volume",
      "Average approval rate by specialty",
      "Which states have the lowest provider ratings?",
      "Compare Medicare vs non-Medicare provider performance",
    ],
    insights: ["400 providers · 10 specialties · 10 states", "Approval rates: 55% – 98%"],
  },
  {
    id: "insurance_claims",
    name: "Insurance Claims",
    description: "1,500 claims across 5 lines of business with status, region and denial reasons.",
    domain: "Healthcare",
    icon: "FileText",
    table: "claims",
    file: "/datasets/insurance_claims.csv",
    rows: 1500,
    columns: [
      { name: "claim_id", type: "VARCHAR" },
      { name: "provider_id", type: "VARCHAR" },
      { name: "patient_id", type: "VARCHAR" },
      { name: "claim_amount", type: "DOUBLE" },
      { name: "approved_amount", type: "DOUBLE" },
      { name: "status", type: "VARCHAR" },
      { name: "line_of_business", type: "VARCHAR" },
      { name: "submitted_date", type: "DATE" },
      { name: "processed_date", type: "DATE" },
      { name: "region", type: "VARCHAR" },
      { name: "denial_reason", type: "VARCHAR" },
    ],
    sampleQuestions: [
      "Claim approval rate by region",
      "Top denial reasons for Medicaid",
      "Total approved amount by line of business",
      "Average processing time per status",
    ],
    insights: ["1,500 claims · 5 LOBs", "Status: APPROVED / DENIED / PENDING / PROCESSING / REJECTED"],
  },
  {
    id: "sales_analytics",
    name: "Sales Analytics",
    description: "Quarterly orders by product, region and channel with revenue.",
    domain: "Revenue",
    icon: "TrendingUp",
    table: "sales",
    file: "/datasets/sales_analytics.csv",
    rows: 1200,
    columns: [
      { name: "order_id", type: "VARCHAR" },
      { name: "customer_id", type: "VARCHAR" },
      { name: "product", type: "VARCHAR" },
      { name: "region", type: "VARCHAR" },
      { name: "quarter", type: "VARCHAR" },
      { name: "year", type: "INT" },
      { name: "quantity", type: "INT" },
      { name: "unit_price", type: "DOUBLE" },
      { name: "revenue", type: "DOUBLE" },
      { name: "sales_rep", type: "VARCHAR" },
      { name: "channel", type: "VARCHAR" },
    ],
    sampleQuestions: [
      "Revenue trend by quarter",
      "Top 5 products by revenue",
      "Compare channel performance in EMEA",
      "Which sales reps closed the most enterprise deals?",
    ],
    insights: ["1,200 orders · 6 products · 4 regions"],
  },
  {
    id: "hr_analytics",
    name: "HR Analytics",
    description: "Employee roster with tenure, performance, engagement and remote status.",
    domain: "People",
    icon: "Users",
    table: "hr",
    file: "/datasets/hr_analytics.csv",
    rows: 600,
    columns: [
      { name: "employee_id", type: "VARCHAR" },
      { name: "name", type: "VARCHAR" },
      { name: "department", type: "VARCHAR" },
      { name: "role", type: "VARCHAR" },
      { name: "tenure_years", type: "DOUBLE" },
      { name: "salary", type: "INT" },
      { name: "performance_score", type: "DOUBLE" },
      { name: "engagement_score", type: "DOUBLE" },
      { name: "is_remote", type: "BOOLEAN" },
      { name: "manager_id", type: "VARCHAR" },
      { name: "hire_date", type: "DATE" },
    ],
    sampleQuestions: [
      "Average performance by department",
      "Engagement score for remote vs onsite",
      "Highest paid roles by department",
      "Tenure distribution across the company",
    ],
    insights: ["600 employees · 10 departments"],
  },
  {
    id: "customer_churn",
    name: "Customer Churn",
    description: "Subscription customers with tenure, charges, support load and churn outcome.",
    domain: "Growth",
    icon: "Activity",
    table: "churn",
    file: "/datasets/customer_churn.csv",
    rows: 1000,
    columns: [
      { name: "customer_id", type: "VARCHAR" },
      { name: "plan", type: "VARCHAR" },
      { name: "tenure_months", type: "INT" },
      { name: "monthly_charges", type: "DOUBLE" },
      { name: "total_charges", type: "DOUBLE" },
      { name: "contract_type", type: "VARCHAR" },
      { name: "payment_method", type: "VARCHAR" },
      { name: "support_tickets", type: "INT" },
      { name: "churned", type: "BOOLEAN" },
      { name: "churn_reason", type: "VARCHAR" },
      { name: "region", type: "VARCHAR" },
    ],
    sampleQuestions: [
      "Churn rate by plan",
      "Top reasons for churn",
      "Does support ticket volume predict churn?",
      "Compare churn between contract types",
    ],
    insights: ["1,000 customers · 3 plans · 4 regions"],
  },
  {
    id: "financial_transactions",
    name: "Financial Transactions",
    description: "Two years of company spending with vendor, category and risk flags.",
    domain: "Finance",
    icon: "DollarSign",
    table: "txns",
    file: "/datasets/financial_transactions.csv",
    rows: 2000,
    columns: [
      { name: "txn_id", type: "VARCHAR" },
      { name: "date", type: "DATE" },
      { name: "amount", type: "DOUBLE" },
      { name: "currency", type: "VARCHAR" },
      { name: "category", type: "VARCHAR" },
      { name: "vendor", type: "VARCHAR" },
      { name: "department", type: "VARCHAR" },
      { name: "status", type: "VARCHAR" },
      { name: "is_flagged", type: "BOOLEAN" },
      { name: "approved_by", type: "VARCHAR" },
    ],
    sampleQuestions: [
      "Total spend by category",
      "Flagged transactions by department",
      "Monthly spend trend",
      "Top 10 vendors by amount",
    ],
    insights: ["2,000 transactions · 9 categories"],
  },
];

export const getDataset = (id: string) => [...DATASETS, ...customDatasets].find((d) => d.id === id);

// ---- Custom (user-uploaded) datasets ----
const customDatasets: Dataset[] = [];
const listeners = new Set<() => void>();
let snapshot: Dataset[] = [...DATASETS];

export function getAllDatasets(): Dataset[] { return snapshot; }
export function getCustomDatasets(): Dataset[] { return customDatasets.slice(); }
export function subscribeDatasets(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }

function refreshSnapshot() {
  snapshot = [...DATASETS, ...customDatasets];
  listeners.forEach((l) => l());
}

export function registerCustomDataset(name: string, csvText: string): Dataset {
  const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const table = `custom_${id.slice(7)}`;
  const ds: Dataset = {
    id, name, description: "User-uploaded CSV",
    domain: "Custom", icon: "Upload",
    table, file: `inline:${csvText}`,
    rows: Math.max(0, csvText.split("\n").length - 1),
    columns: [], // filled in after first load via DESCRIBE
    sampleQuestions: [
      "Summarize this dataset",
      "Show me the top 10 rows by the most interesting metric",
      "What patterns or outliers stand out?",
    ],
    insights: ["Uploaded from your machine"],
  };
  customDatasets.push(ds);
  refreshSnapshot();
  return ds;
}
