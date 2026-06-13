import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const dbName = process.env.DB_NAME || "school_management";
const SCHEMA_PATH = path.join(__dirname, "..", "..", "schema.sql");
const DATA_PATH = path.join(__dirname, "..", "data.json");

function toUUID(str: any): number {
  if (str === null || str === undefined) return 0;
  const s = String(str).trim();
  if (/^\d+$/.test(s)) {
    const val = parseInt(s, 10);
    if (val > 0 && val <= 2147483647) return val;
  }
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash) || 1;
  return (positiveHash % 2147483647) + 1;
}

async function ensureDatabaseExists() {
  const tempPool = new pg.Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: "postgres", // Connect to system database first
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "admin123",
  });

  try {
    const res = await tempPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rowCount === 0) {
      console.log(`⏳ Database "${dbName}" does not exist. Creating...`);
      await tempPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully.`);
    } else {
      console.log(`✅ Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error("❌ Error checking/creating database:", err);
    throw err;
  } finally {
    await tempPool.end();
  }
}

async function ensureStudentExists(appQuery: any, studentId: string, name: string, rollNumber: string, className: string, sectionName: string, schoolId: string) {
  const studentUuid = toUUID(studentId);
  const res = await appQuery("SELECT 1 FROM students WHERE id = $1", [studentUuid]);
  if (res.rowCount > 0) return;

  console.log(`ℹ️ Student "${name}" (${studentId}) does not exist. Creating dynamically...`);
  const userUuid = toUUID("student_user_" + studentId);
  
  await appQuery(
    `INSERT INTO users (id, school_id, name, email, password, role, is_active)
     OVERRIDING SYSTEM VALUE
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [userUuid, toUUID(schoolId), name, `student_${studentId}@school.com`, "admin123", "student", true]
  );

  const classRes = await appQuery(
    "SELECT id FROM classes WHERE school_id = $1 AND name = $2 AND section = $3 LIMIT 1",
    [toUUID(schoolId), className, sectionName]
  );
  const classId = classRes.rows[0]?.id || null;

  await appQuery(
    `INSERT INTO students (id, school_id, user_id, class_id, roll_no, gender, admission_date)
     OVERRIDING SYSTEM VALUE
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
     ON CONFLICT (id) DO NOTHING`,
    [studentUuid, toUUID(schoolId), userUuid, classId, rollNumber || studentId, "other"]
  );
}

async function ensureTeacherExists(appQuery: any, teacherId: string, name: string, schoolId: string) {
  const teacherUuid = toUUID(teacherId);
  const res = await appQuery("SELECT 1 FROM users WHERE id = $1 AND role = 'teacher'", [teacherUuid]);
  if (res.rowCount > 0) return;

  console.log(`ℹ️ Teacher "${name}" (${teacherId}) does not exist. Creating dynamically...`);
  await appQuery(
    `INSERT INTO users (id, school_id, name, email, password, role, is_active)
     OVERRIDING SYSTEM VALUE
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [teacherUuid, toUUID(schoolId), name, `teacher_${teacherId}@school.com`, "admin123", "teacher", true]
  );

  await appQuery(
    `INSERT INTO salary_structures (id, school_id, teacher_id, basic_salary, effective_from, is_active)
     OVERRIDING SYSTEM VALUE
     VALUES ($1, $2, $3, $4, CURRENT_DATE, TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [toUUID("sal_struct_" + teacherId), toUUID(schoolId), teacherUuid, 50000]
  );
}

async function initializeDatabase() {
  console.log("🚀 Starting PostgreSQL initialization...");

  try {
    // 1. Ensure target database exists
    await ensureDatabaseExists();

    // 2. Connect to the actual application database
    const appPool = new pg.Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: dbName,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "admin123",
    });

    const appQuery = async (text: string, params?: any[]) => {
      return appPool.query(text, params);
    };

    // 3. Drop existing tables for a clean slate
    console.log("⏳ Dropping existing public schema (if any) to ensure clean schema.sql application...");
    await appQuery(`
      DROP SCHEMA IF EXISTS public CASCADE;
    `);

    // 4. Read and execute schema.sql DDL
    console.log("⏳ Applying schema.sql DDL...");
    if (!fs.existsSync(SCHEMA_PATH)) {
      throw new Error(`schema.sql not found at ${SCHEMA_PATH}`);
    }
    const sql = fs.readFileSync(SCHEMA_PATH, "utf-8");
    await appQuery(sql);
    console.log("✅ Database schema initialized successfully.");

    // 5. Seed database from data.json if table is empty
    if (!fs.existsSync(DATA_PATH)) {
      console.log("ℹ️ No data.json found. Skipping data seeding.");
      await appPool.end();
      return;
    }

    console.log("⏳ Loading data.json for migration/seeding...");
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw);

    const isTableEmpty = async (tableName: string): Promise<boolean> => {
      const res = await appQuery(`SELECT COUNT(*)::int as count FROM ${tableName}`);
      return res.rows[0].count === 0;
    };

    // --- Migrate Schools ---
    if (data.schools && (await isTableEmpty("schools"))) {
      console.log(`⏳ Seeding ${data.schools.length} schools...`);
      for (const s of data.schools) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        await appQuery(
          `INSERT INTO schools (id, name, slug, address, phone, email, logo_url, board, academic_year, is_active, subscription, max_students)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            toUUID(s.id),
            s.name,
            slug,
            s.address || null,
            s.phone || null,
            s.email || null,
            s.theme || "default", // store theme under logo_url
            s.type || "CBSE School", // store type under board
            "2024-25",
            true,
            "free",
            500,
          ]
        );
      }
      console.log("✅ Schools seeded.");
    }

    // --- Migrate Users (with ID mapping to prevent duplication mismatches) ---
    if (data.users && (await isTableEmpty("users"))) {
      console.log(`⏳ Seeding ${data.users.length} identity users...`);
      for (const u of data.users) {
        let role = u.role;
        let schoolId: any = null;
        if (role === "admin") {
          role = u.schoolIds && u.schoolIds.length === 1 ? "school_admin" : "super_admin";
          schoolId = u.schoolIds && u.schoolIds.length === 1 ? toUUID(u.schoolIds[0]) : null;
        } else {
          schoolId = u.schoolIds && u.schoolIds.length > 0 ? toUUID(u.schoolIds[0]) : null;
        }

        // Map ID to teacher list ID or student list ID if they match
        let userId = toUUID(u.id);
        if (role === "teacher") {
          const matchedTeacher = data.teachers?.find(
            (t: any) => t.email === u.email || t.name === u.name
          );
          if (matchedTeacher) {
            userId = toUUID(matchedTeacher.id);
          }
        } else if (role === "student") {
          const matchedStudent = data.students?.find(
            (s: any) => s.email === u.email || s.name === u.name
          );
          if (matchedStudent) {
            userId = toUUID("student_user_" + matchedStudent.id);
          }
        }

        await appQuery(
          `INSERT INTO users (id, school_id, name, email, password, role, phone, avatar_url, is_active)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            userId,
            schoolId,
            u.name,
            u.email,
            "admin123", // default password
            role,
            u.phone || null,
            u.avatar || null,
            true,
          ]
        );
      }
      console.log("✅ Users seeded.");
    }

    // --- Migrate Teachers ---
    if (data.teachers) {
      console.log(`⏳ Verifying and seeding ${data.teachers.length} teachers...`);
      for (const t of data.teachers) {
        const teacherUserId = toUUID(t.id);
        const userRes = await appQuery("SELECT 1 FROM users WHERE id = $1", [teacherUserId]);

        if (userRes.rowCount === 0) {
          await appQuery(
            `INSERT INTO users (id, school_id, name, email, password, role, phone, is_active)
             OVERRIDING SYSTEM VALUE
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [teacherUserId, toUUID(t.schoolId), t.name, t.email, "admin123", "teacher", t.phone || null, true]
          );
        } else {
          await appQuery(
            `UPDATE users SET school_id = $1, phone = COALESCE(phone, $2) WHERE id = $3`,
            [toUUID(t.schoolId), t.phone || null, teacherUserId]
          );
        }

        // Insert salary structure
        await appQuery(
          `INSERT INTO salary_structures (id, school_id, teacher_id, basic_salary, effective_from, is_active)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, CURRENT_DATE, TRUE)
           ON CONFLICT (id) DO NOTHING`,
          [toUUID("sal_struct_" + t.id), toUUID(t.schoolId), teacherUserId, t.salary || 0]
        );
      }
      console.log("✅ Teachers and salary structures seeded.");
    }

    // --- Migrate Classes & Class Subjects ---
    if (data.classes && (await isTableEmpty("classes"))) {
      console.log(`⏳ Seeding ${data.classes.length} classes and subjects...`);
      for (const c of data.classes) {
        await appQuery(
          `INSERT INTO classes (id, school_id, name, section, teacher_id, academic_year)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [
            toUUID(c.id),
            toUUID(c.schoolId),
            c.name,
            c.section,
            c.teacherId ? toUUID(c.teacherId) : null,
            "2024-25",
          ]
        );

        if (c.subjects && Array.isArray(c.subjects)) {
          for (const sub of c.subjects) {
            await appQuery(
              `INSERT INTO subjects (id, school_id, name, code, class_id, teacher_id)
               OVERRIDING SYSTEM VALUE
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (id) DO NOTHING`,
              [
                toUUID(c.id + "_" + sub),
                toUUID(c.schoolId),
                sub,
                sub.toUpperCase(),
                toUUID(c.id),
                c.teacherId ? toUUID(c.teacherId) : null,
              ]
            );
          }
        }
      }
      console.log("✅ Classes and subjects seeded.");
    }

    // --- Migrate Students & Student User accounts ---
    if (data.students && (await isTableEmpty("students"))) {
      console.log(`⏳ Seeding ${data.students.length} students and user accounts...`);
      for (const s of data.students) {
        const userUuid = toUUID("student_user_" + s.id);
        const userRes = await appQuery("SELECT 1 FROM users WHERE id = $1", [userUuid]);

        if (userRes.rowCount === 0) {
          await appQuery(
            `INSERT INTO users (id, school_id, name, email, password, role, phone, is_active)
             OVERRIDING SYSTEM VALUE
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [userUuid, toUUID(s.schoolId), s.name, s.email, "admin123", "student", s.phone || null, true]
          );
        } else {
          await appQuery(
            `UPDATE users SET school_id = $1, phone = COALESCE(phone, $2) WHERE id = $3`,
            [toUUID(s.schoolId), s.phone || null, userUuid]
          );
        }

        // Lookup matching class ID
        const classRes = await appQuery(
          "SELECT id FROM classes WHERE school_id = $1 AND name = $2 AND section = $3 LIMIT 1",
          [toUUID(s.schoolId), s.class, s.section]
        );
        const classId = classRes.rows[0]?.id || null;

        // Clean gender
        let gender: string | null = s.gender ? s.gender.toLowerCase() : null;
        if (gender !== "male" && gender !== "female" && gender !== "other") {
          gender = "other";
        }

        // Insert student profile
        await appQuery(
          `INSERT INTO students (id, school_id, user_id, class_id, roll_no, dob, gender, blood_group, address, guardian_name, guardian_phone, admission_date)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO NOTHING`,
          [
            toUUID(s.id),
            toUUID(s.schoolId),
            userUuid,
            classId,
            s.rollNumber,
            s.dateOfBirth || null,
            gender,
            s.bloodGroup || null,
            s.address || null,
            s.parentName || null,
            s.parentPhone || null,
            s.admissionDate || s.joinDate || null,
          ]
        );
      }
      console.log("✅ Students seeded.");
    }

    // --- Migrate Attendance ---
    if (data.attendance && (await isTableEmpty("attendance"))) {
      console.log(`⏳ Seeding ${data.attendance.length} attendance records...`);
      for (const a of data.attendance) {
        // Guarantee referential integrity for student
        await ensureStudentExists(appQuery, a.studentId, a.studentName || "Student " + a.studentId, a.rollNumber, a.class || "5", a.section || "A", a.schoolId);

        const classRes = await appQuery(
          "SELECT id FROM classes WHERE school_id = $1 AND name = $2 AND section = $3 LIMIT 1",
          [toUUID(a.schoolId), a.class, a.section]
        );
        const classId = classRes.rows[0]?.id || null;

        let status = a.status ? a.status.toLowerCase() : "present";
        if (status !== "present" && status !== "absent" && status !== "late" && status !== "excused") {
          status = "present";
        }

        let markedByUuid: any = null;
        if (a.markedBy) {
          const teacherRes = await appQuery("SELECT id FROM users WHERE name = $1 LIMIT 1", [a.markedBy]);
          markedByUuid = teacherRes.rows[0]?.id || null;
        }

        await appQuery(
          `INSERT INTO attendance (id, school_id, student_id, class_id, date, status, marked_by)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [toUUID(a.id), toUUID(a.schoolId), toUUID(a.studentId), classId, a.date, status, markedByUuid]
        );
      }
      console.log("✅ Attendance seeded.");
    }

    // --- Migrate Fees ---
    if (data.fees && (await isTableEmpty("fees"))) {
      console.log(`⏳ Seeding ${data.fees.length} fee records...`);
      for (const f of data.fees) {
        // Guarantee referential integrity for student
        await ensureStudentExists(appQuery, f.studentId, f.studentName || "Student " + f.studentId, f.rollNumber, f.class || "5", f.section || "A", f.schoolId);

        const validFeeTypes = ["tuition", "exam", "sports", "library", "transport", "other"];
        const dbFeeType = validFeeTypes.includes(f.feeType) ? f.feeType : "other";
        const description = f.feeType !== dbFeeType ? f.feeType : null;

        let status = f.status ? f.status.toLowerCase() : "pending";
        if (status !== "pending" && status !== "paid" && status !== "overdue" && status !== "waived") {
          status = "pending";
        }

        await appQuery(
          `INSERT INTO fees (id, school_id, student_id, amount, fee_type, description, due_date, status, paid_at)
           OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [
            toUUID(f.id),
            toUUID(f.schoolId),
            toUUID(f.studentId),
            f.amount,
            dbFeeType,
            description,
            f.dueDate,
            status,
            f.paidDate || null,
          ]
        );
      }
      console.log("✅ Fees seeded.");
    }

    // --- Migrate Salaries ---
    if (data.salaries && (await isTableEmpty("salary_records"))) {
      console.log(`⏳ Seeding ${data.salaries.length} salary records...`);
      for (const sa of data.salaries) {
        // Guarantee referential integrity for teacher
        await ensureTeacherExists(appQuery, sa.teacherId, sa.teacherName || "Teacher " + sa.teacherId, sa.schoolId);

        let status = sa.status ? sa.status.toLowerCase() : "pending";
        if (status !== "pending" && status !== "approved" && status !== "paid" && status !== "on_hold") {
          status = "pending";
        }

        const baseSalary = sa.baseSalary || 0;
        const allowances = sa.allowances || 0;
        const deductions = sa.deductions || 0;
        const grossSalary = baseSalary + allowances;
        const netSalary = grossSalary - deductions;

        await appQuery(
          `INSERT INTO salary_records (
             id, school_id, teacher_id, salary_structure_id, month, year, basic_salary, other_allowances, other_deductions,
             gross_salary, total_deductions, net_salary, status, paid_at
           ) OVERRIDING SYSTEM VALUE
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            toUUID(sa.id),
            toUUID(sa.schoolId),
            toUUID(sa.teacherId),
            toUUID("sal_struct_" + sa.teacherId),
            sa.month,
            sa.year,
            baseSalary,
            allowances,
            deductions,
            grossSalary,
            deductions,
            netSalary,
            status,
            sa.paidDate || null,
          ]
        );
      }
      console.log("✅ Salary records seeded.");
    }

    // --- Seed Notices ---
    if (await isTableEmpty("notices")) {
      console.log("⏳ Seeding notice board...");
      const notices = [
        {
          title: "Annual Sports Day 2026",
          content: "The annual sports meet will be held on June 25th. All students are invited to participate in track and field events.",
          audience: "all",
          is_pinned: true,
          schoolId: "school-1"
        },
        {
          title: "Staff Meeting",
          content: "A mandatory staff meeting is scheduled for Monday at 3:30 PM in the conference hall to discuss terminal exams.",
          audience: "teacher",
          is_pinned: false,
          schoolId: "school-1"
        },
        {
          title: "Fee Clearance Notice",
          content: "All students are requested to clear their pending tuition fees for Term 1 before June 20th to avoid late fines.",
          audience: "student",
          is_pinned: true,
          schoolId: "school-1"
        }
      ];

      for (const n of notices) {
        await appQuery(
          `INSERT INTO notices (school_id, title, content, audience, is_pinned)
           VALUES ($1, $2, $3, $4, $5)`,
          [toUUID(n.schoolId), n.title, n.content, n.audience, n.is_pinned]
        );
      }
      console.log("✅ Notices seeded.");
    }

    // --- Seed Marks ---
    if (data.examResults && (await isTableEmpty("marks"))) {
      console.log("⏳ Seeding student marks...");
      for (const er of data.examResults) {
        const studentId = toUUID(er.studentId);
        const schoolId = toUUID(er.schoolId);
        
        for (const [subjName, score] of Object.entries(er.marks)) {
          const subRes = await appQuery(
            "SELECT id FROM subjects WHERE school_id = $1 AND name = $2 LIMIT 1",
            [schoolId, subjName]
          );
          const subjectId = subRes.rows[0]?.id;
          if (subjectId) {
            await appQuery(
              `INSERT INTO marks (school_id, student_id, subject_id, exam_type, score, max_score, exam_date)
               VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
               ON CONFLICT DO NOTHING`,
              [schoolId, studentId, subjectId, 'final', score, 50]
            );
          }
        }
      }
      console.log("✅ Marks seeded.");
    }

    // --- Seed Timetables ---
    if (await isTableEmpty("timetables")) {
      console.log("⏳ Seeding timetable slots...");
      const schoolId = toUUID("school-1");
      const classRes = await appQuery("SELECT id FROM classes WHERE school_id = $1 LIMIT 1", [schoolId]);
      const classId = classRes.rows[0]?.id;

      if (classId) {
        const subRes = await appQuery("SELECT id, name FROM subjects WHERE school_id = $1 AND class_id = $2", [schoolId, classId]);
        const subjects = subRes.rows;

        if (subjects.length > 0) {
          const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
          const timeSlots = [
            { start: "08:30:00", end: "09:30:00" },
            { start: "09:30:00", end: "10:30:00" },
            { start: "11:00:00", end: "12:00:00" },
            { start: "12:00:00", end: "13:00:00" }
          ];

          for (const day of days) {
            for (let idx = 0; idx < timeSlots.length; idx++) {
              const subject = subjects[idx % subjects.length];
              const slot = timeSlots[idx];
              await appQuery(
                `INSERT INTO timetables (school_id, class_id, subject_id, day_of_week, start_time, end_time, classroom)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT DO NOTHING`,
                [schoolId, classId, subject.id, day, slot.start, slot.end, `Room ${100 + idx}`]
              );
            }
          }
        }
      }
      console.log("✅ Timetable slots seeded.");
    }

    // --- Seed Homework ---
    if (await isTableEmpty("homework")) {
      console.log("⏳ Seeding homework assignments...");
      const schoolId = toUUID("school-1");
      const classRes = await appQuery("SELECT id, teacher_id FROM classes WHERE school_id = $1 LIMIT 1", [schoolId]);
      const classId = classRes.rows[0]?.id;
      const teacherId = classRes.rows[0]?.teacher_id;

      if (classId) {
        const subRes = await appQuery("SELECT id FROM subjects WHERE school_id = $1 AND class_id = $2 LIMIT 2", [schoolId, classId]);
        const subjects = subRes.rows;

        if (subjects.length > 0) {
          await appQuery(
            `INSERT INTO homework (school_id, class_id, subject_id, teacher_id, title, description, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE + INTERVAL '3 days')`,
            [schoolId, classId, subjects[0].id, teacherId, "Algebraic Equations", "Solve problems 1 to 10 on page 42 of your Maths textbook."]
          );
        }
        if (subjects.length > 1) {
          await appQuery(
            `INSERT INTO homework (school_id, class_id, subject_id, teacher_id, title, description, due_date)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE + INTERVAL '5 days')`,
            [schoolId, classId, subjects[1].id, teacherId, "Water Cycle Essay", "Write a 500-word essay explaining the different stages of the water cycle with diagrams."]
          );
        }
      }
      console.log("✅ Homework assignments seeded.");
    }

    console.log("⏳ Syncing identity sequences...");
    const tables = [
      "schools", "users", "classes", "subjects", "students", "timetables", 
      "attendance", "class_subjects", "fees", "homework", "marks", 
      "salary_structures", "salary_records", "notices"
    ];
    for (const table of tables) {
      await appQuery(`
        SELECT setval(
          pg_get_serial_sequence('public.${table}', 'id'), 
          COALESCE(MAX(id), 1), 
          MAX(id) IS NOT NULL
        ) FROM public.${table};
      `);
    }
    console.log("✅ Identity sequences synced.");

    console.log("🎉 Database initialization and seeding completed successfully!");
    await appPool.end();
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

initializeDatabase();
