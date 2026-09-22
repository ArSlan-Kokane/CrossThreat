// SQLite database integration for recruitment applications
// This provides a robust, scalable solution for handling high volumes of applications

import Database from 'better-sqlite3';
import { RecruitmentApplication, RecruitmentFormData, ApplicationStatus } from './schema';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = process.env.DATABASE_PATH || './data/recruitment.db';

// Initialize database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Initialize tables
    initializeTables();
  }
  return db;
}

function initializeTables() {
  if (!db) return;
  
  // Create applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL,
      personal_info TEXT NOT NULL,
      department_interest TEXT NOT NULL,
      skills TEXT NOT NULL,
      responses TEXT NOT NULL,
      resume_url TEXT,
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
    CREATE INDEX IF NOT EXISTS idx_applications_personal_info ON applications(personal_info);
  `);
}

// Create new application
export function createApplicationDB(formData: RecruitmentFormData): RecruitmentApplication {
  const database = getDatabase();
  
  const id = uuidv4();
  const submittedAt = new Date().toISOString();
  const status: ApplicationStatus = 'pending';
  
  const stmt = database.prepare(`
    INSERT INTO applications (
      id, submitted_at, status, personal_info, department_interest, 
      skills, responses, resume_url, admin_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    submittedAt,
    status,
    JSON.stringify(formData.personalInfo),
    JSON.stringify(formData.departmentInterest),
    JSON.stringify(formData.skills),
    JSON.stringify(formData.responses),
    formData.resumeUrl || null,
    null
  );
  
  return {
    id,
    submittedAt,
    status,
    ...formData,
  };
}

// Get all applications
export function getAllApplicationsDB(): RecruitmentApplication[] {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM applications ORDER BY submitted_at DESC');
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status as ApplicationStatus,
    personalInfo: JSON.parse(row.personal_info),
    departmentInterest: JSON.parse(row.department_interest),
    skills: JSON.parse(row.skills),
    responses: JSON.parse(row.responses),
    resumeUrl: row.resume_url,
    adminNotes: row.admin_notes,
  }));
}

// Get application by ID
export function getApplicationByIdDB(id: string): RecruitmentApplication | null {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM applications WHERE id = ?');
  const row = stmt.get(id) as any;
  
  if (!row) return null;
  
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status as ApplicationStatus,
    personalInfo: JSON.parse(row.personal_info),
    departmentInterest: JSON.parse(row.department_interest),
    skills: JSON.parse(row.skills),
    responses: JSON.parse(row.responses),
    resumeUrl: row.resume_url,
    adminNotes: row.admin_notes,
  };
}

// Update application status
export function updateApplicationStatusDB(
  id: string, 
  status: ApplicationStatus,
  adminNotes?: string
): RecruitmentApplication | null {
  const database = getDatabase();
  
  const stmt = database.prepare(`
    UPDATE applications 
    SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(status, adminNotes || null, id);
  
  if (result.changes === 0) return null;
  
  return getApplicationByIdDB(id);
}

// Delete application
export function deleteApplicationDB(id: string): boolean {
  const database = getDatabase();
  
  const stmt = database.prepare('DELETE FROM applications WHERE id = ?');
  const result = stmt.run(id);
  
  return result.changes > 0;
}

// Filter applications by status
export function getApplicationsByStatusDB(status: ApplicationStatus): RecruitmentApplication[] {
  const database = getDatabase();
  
  const stmt = database.prepare('SELECT * FROM applications WHERE status = ? ORDER BY submitted_at DESC');
  const rows = stmt.all(status) as any[];
  
  return rows.map(row => ({
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status as ApplicationStatus,
    personalInfo: JSON.parse(row.personal_info),
    departmentInterest: JSON.parse(row.department_interest),
    skills: JSON.parse(row.skills),
    responses: JSON.parse(row.responses),
    resumeUrl: row.resume_url,
    adminNotes: row.admin_notes,
  }));
}

// Filter applications by department
export function getApplicationsByDepartmentDB(department: string): RecruitmentApplication[] {
  const database = getDatabase();
  
  const stmt = database.prepare(`
    SELECT * FROM applications 
    WHERE json_extract(department_interest, '$.firstChoice') = ? 
       OR json_extract(department_interest, '$.secondChoice') = ? 
       OR json_extract(department_interest, '$.thirdChoice') = ?
    ORDER BY submitted_at DESC
  `);
  
  const rows = stmt.all(department, department, department) as any[];
  
  return rows.map(row => ({
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status as ApplicationStatus,
    personalInfo: JSON.parse(row.personal_info),
    departmentInterest: JSON.parse(row.department_interest),
    skills: JSON.parse(row.skills),
    responses: JSON.parse(row.responses),
    resumeUrl: row.resume_url,
    adminNotes: row.admin_notes,
  }));
}

// Search applications
export function searchApplicationsDB(query: string): RecruitmentApplication[] {
  const database = getDatabase();
  
  const stmt = database.prepare(`
    SELECT * FROM applications 
    WHERE personal_info LIKE ? 
       OR id LIKE ?
    ORDER BY submitted_at DESC
  `);
  
  const searchPattern = `%${query}%`;
  const rows = stmt.all(searchPattern, searchPattern) as any[];
  
  return rows.map(row => ({
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status as ApplicationStatus,
    personalInfo: JSON.parse(row.personal_info),
    departmentInterest: JSON.parse(row.department_interest),
    skills: JSON.parse(row.skills),
    responses: JSON.parse(row.responses),
    resumeUrl: row.resume_url,
    adminNotes: row.admin_notes,
  }));
}

// Get application statistics
export function getApplicationStatsDB(): {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byDepartment: Record<string, number>;
} {
  const database = getDatabase();
  
  const totalStmt = database.prepare('SELECT COUNT(*) as count FROM applications');
  const totalResult = totalStmt.get() as { count: number };
  
  const statusStmt = database.prepare('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
  const statusRows = statusStmt.all() as { status: ApplicationStatus; count: number }[];
  
  const byStatus: Record<ApplicationStatus, number> = {
    pending: 0,
    review: 0,
    interview: 0,
    accepted: 0,
    rejected: 0,
  };
  
  statusRows.forEach(row => {
    byStatus[row.status] = row.count;
  });
  
  const deptStmt = database.prepare(`
    SELECT 
      json_extract(department_interest, '$.firstChoice') as dept,
      COUNT(*) as count 
    FROM applications 
    GROUP BY dept
  `);
  
  const deptRows = deptStmt.all() as { dept: string; count: number }[];
  const byDepartment: Record<string, number> = {};
  
  deptRows.forEach(row => {
    byDepartment[row.dept] = row.count;
  });
  
  return {
    total: totalResult.count,
    byStatus,
    byDepartment,
  };
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}