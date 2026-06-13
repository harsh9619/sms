import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { query, toIntID } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 4000);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// GET list of all schools
app.get("/api/schools", async (_req, res) => {
  try {
    const result = await query(
      `SELECT 
         id::text, 
         name, 
         address, 
         phone, 
         email, 
         board AS type, 
         logo_url AS theme 
       FROM schools`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET students
app.get("/api/students", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         s.id::text,
         u.name,
         u.email,
         u.phone,
         c.name AS class,
         c.section AS section,
         s.roll_no AS "rollNumber",
         s.guardian_name AS "parentName",
         s.guardian_phone AS "parentPhone",
         s.address,
         s.dob::text AS "dateOfBirth",
         s.gender,
         u.avatar_url AS avatar,
         s.admission_date::text AS "admissionDate",
         s.blood_group AS "bloodGroup",
         s.school_id::text AS "schoolId"
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE ($1::int IS NULL OR s.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET teachers
app.get("/api/teachers", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         u.id::text AS id,
         u.name,
         u.email,
         u.phone,
         COALESCE(
           (SELECT string_agg(sub.name, ', ') FROM subjects sub WHERE sub.teacher_id = u.id),
           'Mathematics'
         ) AS subject,
         'Science' AS department,
         'B.Ed' AS qualification,
         '5 years' AS experience,
         u.avatar_url AS avatar,
         u.created_at::text AS "joinDate",
         COALESCE(
           (SELECT basic_salary::numeric::float FROM salary_structures ss WHERE ss.teacher_id = u.id AND ss.is_active = TRUE LIMIT 1),
           50000
         ) AS salary,
         u.school_id::text AS "schoolId"
       FROM users u
       WHERE u.role = 'teacher'
         AND ($1::int IS NULL OR u.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET classes
app.get("/api/classes", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         c.id::text,
         c.name,
         c.section,
         c.teacher_id::text AS "teacherId",
         u.name AS "teacherName",
         (SELECT COUNT(*)::int FROM students s WHERE s.class_id = c.id) AS "studentCount",
         COALESCE(
           (SELECT json_agg(sub.name) FROM subjects sub WHERE sub.class_id = c.id),
           '[]'::json
         ) AS subjects,
         c.school_id::text AS "schoolId"
       FROM classes c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE ($1::int IS NULL OR c.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST class
app.post("/api/classes", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { name, section, teacherId, subjects } = req.body;

    if (!name || !section) {
      return res.status(400).json({ error: "Class name and section are required." });
    }

    const dbTeacherId = teacherId ? toIntID(String(teacherId)) : null;

    // 1. Insert class record
    const classResult = await query(
      `INSERT INTO classes (school_id, name, section, teacher_id, academic_year)
       VALUES ($1, $2, $3, $4, '2024-25')
       RETURNING *`,
      [schoolId, name, section, dbTeacherId]
    );
    const newClass = classResult.rows[0];

    // 2. Insert subjects if provided
    if (subjects && Array.isArray(subjects)) {
      for (const sub of subjects) {
        const cleanSub = String(sub).trim();
        if (!cleanSub) continue;
        await query(
          `INSERT INTO subjects (school_id, name, code, class_id, teacher_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [schoolId, cleanSub, cleanSub.toUpperCase(), newClass.id, dbTeacherId]
        );
      }
    }

    // 3. Return full record matching getClasses representation
    const fullRecord = await query(
      `SELECT 
         c.id::text,
         c.name,
         c.section,
         c.teacher_id::text AS "teacherId",
         u.name AS "teacherName",
         (SELECT COUNT(*)::int FROM students s WHERE s.class_id = c.id) AS "studentCount",
         COALESCE(
           (SELECT json_agg(sub.name) FROM subjects sub WHERE sub.class_id = c.id),
           '[]'::json
         ) AS subjects,
         c.school_id::text AS "schoolId"
       FROM classes c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [newClass.id]
    );

    res.status(201).json(fullRecord.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "A class with this name and section already exists." });
    }
    res.status(500).json({ error: String(err) });
  }
});

// PUT class
app.put("/api/classes/:id", async (req, res) => {
  try {
    const classId = toIntID(req.params.id);
    const existing = await query("SELECT * FROM classes WHERE id = $1", [classId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    const schoolId = existing.rows[0].school_id;

    const { name, section, teacherId, subjects } = req.body;
    if (!name || !section) {
      return res.status(400).json({ error: "Class name and section are required." });
    }

    const dbTeacherId = teacherId ? toIntID(String(teacherId)) : null;

    // 1. Update class details
    await query(
      `UPDATE classes 
       SET name = $1, section = $2, teacher_id = $3
       WHERE id = $4`,
      [name, section, dbTeacherId, classId]
    );

    // 2. Differential sync for subjects
    if (subjects && Array.isArray(subjects)) {
      const cleanSubjects = subjects.map((s: any) => String(s).trim()).filter(Boolean);
      
      const existingSubjectsRes = await query("SELECT id, name FROM subjects WHERE class_id = $1", [classId]);
      const existingSubjects = existingSubjectsRes.rows;
      const existingNames = existingSubjects.map(s => s.name);

      // Delete subjects that are no longer in the list
      const toDelete = existingSubjects.filter(s => !cleanSubjects.includes(s.name));
      for (const sub of toDelete) {
        await query("DELETE FROM subjects WHERE id = $1", [sub.id]);
      }

      // Add new subjects
      const toAdd = cleanSubjects.filter(name => !existingNames.includes(name));
      for (const sub of toAdd) {
        await query(
          `INSERT INTO subjects (school_id, name, code, class_id, teacher_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [schoolId, sub, sub.toUpperCase(), classId, dbTeacherId]
        );
      }

      // Sync teacher for all current subjects under this class
      await query(
        `UPDATE subjects SET teacher_id = $1 WHERE class_id = $2`,
        [dbTeacherId, classId]
      );
    }

    // 3. Return full record matching getClasses representation
    const fullRecord = await query(
      `SELECT 
         c.id::text,
         c.name,
         c.section,
         c.teacher_id::text AS "teacherId",
         u.name AS "teacherName",
         (SELECT COUNT(*)::int FROM students s WHERE s.class_id = c.id) AS "studentCount",
         COALESCE(
           (SELECT json_agg(sub.name) FROM subjects sub WHERE sub.class_id = c.id),
           '[]'::json
         ) AS subjects,
         c.school_id::text AS "schoolId"
       FROM classes c
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [classId]
    );

    res.json(fullRecord.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "A class with this name and section already exists." });
    }
    res.status(500).json({ error: String(err) });
  }
});

// DELETE class
app.delete("/api/classes/:id", async (req, res) => {
  try {
    const classId = toIntID(req.params.id);
    const existing = await query(
      `SELECT 
         c.id::text,
         c.name,
         c.section,
         c.school_id::text AS "schoolId"
       FROM classes c
       WHERE c.id = $1`,
      [classId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Delete class record (subjects and timetables will cascade delete or NULLify as defined in DB schema)
    await query("DELETE FROM classes WHERE id = $1", [classId]);
    res.json(existing.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


// GET subjects
app.get("/api/subjects", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const classIdStr = req.query.classId;
    const classId = classIdStr ? toIntID(String(classIdStr)) : null;

    const result = await query(
      `SELECT id::text, school_id::text AS "schoolId", name, code, class_id::text AS "classId", teacher_id::text AS "teacherId"
       FROM subjects
       WHERE ($1::int IS NULL OR school_id = $1::int)
         AND ($2::int IS NULL OR class_id = $2::int)`,
      [schoolId, classId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET attendance
app.get("/api/attendance", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         a.id::text,
         a.student_id::text AS "studentId",
         u.name AS "studentName",
         s.roll_no AS "rollNumber",
         c.name AS class,
         c.section AS section,
         a.date::text AS date,
         a.status,
         ub.name AS "markedBy",
         a.created_at::text AS "markedAt",
         a.school_id::text AS "schoolId"
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON a.class_id = c.id
       LEFT JOIN users ub ON a.marked_by = ub.id
       WHERE ($1::int IS NULL OR a.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET users
app.get("/api/users", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const showAll = req.query.all === "true";

    let result;
    if (schoolId && !showAll) {
      result = await query(
        `SELECT 
           u.id::text,
           u.name,
           u.email,
           CASE 
             WHEN u.role = 'super_admin' THEN 'admin'
             WHEN u.role = 'school_admin' THEN 'admin'
             ELSE u.role
           END AS role,
           u.phone,
           u.avatar_url AS avatar,
           u.created_at::text AS "joinDate",
           CASE WHEN u.school_id IS NULL THEN ARRAY[]::text[] ELSE ARRAY[u.school_id::text] END AS "schoolIds"
         FROM users u
         WHERE u.school_id = $1 OR u.school_id IS NULL`,
        [schoolId]
      );
    } else {
      result = await query(
        `SELECT 
           u.id::text,
           u.name,
           u.email,
           CASE 
             WHEN u.role = 'super_admin' THEN 'admin'
             WHEN u.role = 'school_admin' THEN 'admin'
             ELSE u.role
           END AS role,
           u.phone,
           u.avatar_url AS avatar,
           u.created_at::text AS "joinDate",
           CASE WHEN u.school_id IS NULL THEN ARRAY[]::text[] ELSE ARRAY[u.school_id::text] END AS "schoolIds"
         FROM users u`
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, phone, role, schoolId } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required." });
    }

    const dbRole =
      role === "admin"
        ? "school_admin"
        : role === "teacher"
        ? "teacher"
        : role === "student"
        ? "student"
        : "teacher";

    const schoolInt = schoolId ? toIntID(String(schoolId)) : null;
    if (dbRole !== "super_admin" && !schoolInt) {
      return res.status(400).json({ error: "School assignment is required for this role." });
    }

    await query("BEGIN");
    const insertRes = await query(
      `INSERT INTO users (school_id, name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [schoolInt, name, email, "password123", dbRole, phone || null]
    );

    const userId = insertRes.rows[0].id;
    if (dbRole === "student") {
      await query(
        `INSERT INTO students (school_id, user_id, roll_no, gender, admission_date)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
        [schoolInt, userId, "N/A", "other"]
      );
    }
    await query("COMMIT");

    const userResult = await query(
      `SELECT
         u.id::text,
         u.name,
         u.email,
         CASE
           WHEN u.role = 'super_admin' THEN 'admin'
           WHEN u.role = 'school_admin' THEN 'admin'
           ELSE u.role
         END AS role,
         u.phone,
         u.avatar_url AS avatar,
         u.created_at::text AS "joinDate",
         CASE WHEN u.school_id IS NULL THEN ARRAY[]::text[] ELSE ARRAY[u.school_id::text] END AS "schoolIds"
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );

    res.status(201).json(userResult.rows[0]);
  } catch (err: any) {
    await query("ROLLBACK").catch(() => {});
    if (err.code === "23505") {
      return res.status(400).json({ error: "A user with this email already exists." });
    }
    res.status(500).json({ error: String(err) });
  }
});

// PUT user
app.put("/api/users/:id", async (req, res) => {
  try {
    const userId = toIntID(req.params.id);
    const existing = await query("SELECT * FROM users WHERE id = $1", [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, phone, role, schoolId } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required." });
    }

    const dbRole =
      role === "admin"
        ? "school_admin"
        : role === "teacher"
        ? "teacher"
        : role === "student"
        ? "student"
        : "teacher";

    const schoolInt = schoolId ? toIntID(String(schoolId)) : null;
    if (dbRole !== "super_admin" && !schoolInt) {
      return res.status(400).json({ error: "School assignment is required for this role." });
    }

    await query("BEGIN");
    await query(
      `UPDATE users
       SET name = $1,
           email = $2,
           phone = $3,
           role = $4,
           school_id = $5,
           updated_at = now()
       WHERE id = $6`,
      [name, email, phone || null, dbRole, schoolInt, userId]
    );

    const studentRecord = await query("SELECT id FROM students WHERE user_id = $1", [userId]);
    if (dbRole === "student") {
      if (studentRecord.rows.length === 0) {
        await query(
          `INSERT INTO students (school_id, user_id, roll_no, gender, admission_date)
           VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
          [schoolInt, userId, "N/A", "other"]
        );
      } else {
        await query("UPDATE students SET school_id = $1 WHERE user_id = $2", [schoolInt, userId]);
      }
    } else if (studentRecord.rows.length > 0) {
      await query("DELETE FROM students WHERE user_id = $1", [userId]);
    }

    await query("COMMIT");

    const userResult = await query(
      `SELECT
         u.id::text,
         u.name,
         u.email,
         CASE
           WHEN u.role = 'super_admin' THEN 'admin'
           WHEN u.role = 'school_admin' THEN 'admin'
           ELSE u.role
         END AS role,
         u.phone,
         u.avatar_url AS avatar,
         u.created_at::text AS "joinDate",
         CASE WHEN u.school_id IS NULL THEN ARRAY[]::text[] ELSE ARRAY[u.school_id::text] END AS "schoolIds"
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );

    res.json(userResult.rows[0]);
  } catch (err: any) {
    await query("ROLLBACK").catch(() => {});
    if (err.code === "23505") {
      return res.status(400).json({ error: "A user with this email already exists." });
    }
    res.status(500).json({ error: String(err) });
  }
});

// DELETE user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = toIntID(req.params.id);
    const existing = await query(
      `SELECT
         u.id::text,
         u.name,
         u.email,
         CASE
           WHEN u.role = 'super_admin' THEN 'admin'
           WHEN u.role = 'school_admin' THEN 'admin'
           ELSE u.role
         END AS role,
         u.phone,
         u.avatar_url AS avatar,
         u.created_at::text AS "joinDate",
         CASE WHEN u.school_id IS NULL THEN ARRAY[]::text[] ELSE ARRAY[u.school_id::text] END AS "schoolIds"
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await query("DELETE FROM users WHERE id = $1", [userId]);
    res.json(existing.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET fees
app.get("/api/fees", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         f.id::text,
         f.student_id::text AS "studentId",
         u.name AS "studentName",
         s.roll_no AS "rollNumber",
         c.name AS class,
         c.section AS section,
         f.fee_type AS "feeType",
         f.amount::numeric::float AS amount,
         f.due_date::text AS "dueDate",
         f.paid_at::text AS "paidDate",
         f.status,
         COALESCE(f.description, '') AS remarks,
         f.school_id::text AS "schoolId"
       FROM fees f
       JOIN students s ON f.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE ($1::int IS NULL OR f.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET salaries
app.get("/api/salaries", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;

    const result = await query(
      `SELECT 
         sr.id::text,
         sr.teacher_id::text AS "teacherId",
         u.name AS "teacherName",
         COALESCE(
           (SELECT string_agg(sub.name, ', ') FROM subjects sub WHERE sub.teacher_id = sr.teacher_id),
           'Mathematics'
         ) AS subject,
         sr.basic_salary::numeric::float AS "baseSalary",
         (sr.hra + sr.da + sr.ta + sr.medical + sr.other_allowances + sr.bonus)::numeric::float AS allowances,
         (sr.pf_deduction + sr.esi_deduction + sr.professional_tax + sr.tds + sr.other_deductions)::numeric::float AS deductions,
         sr.month,
         sr.year,
         sr.status,
         sr.paid_at::text AS "paidDate",
         sr.school_id::text AS "schoolId"
       FROM salary_records sr
       JOIN users u ON sr.teacher_id = u.id
       WHERE ($1::int IS NULL OR sr.school_id = $1::int)`,
      [schoolId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Fees POST
app.post("/api/fees", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { studentId, amount, feeType, dueDate, paidDate, status, remarks } = req.body;

    const dbStudentId = toIntID(String(studentId));

    const validFeeTypes = ['tuition', 'exam', 'sports', 'library', 'transport', 'other'];
    const dbFeeType = validFeeTypes.includes(feeType) ? feeType : 'other';
    const description = remarks || (feeType !== dbFeeType ? feeType : null);

    const result = await query(
      `INSERT INTO fees (school_id, student_id, amount, fee_type, description, due_date, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        schoolId,
        dbStudentId,
        amount,
        dbFeeType,
        description,
        dueDate || new Date(),
        status || 'pending',
        paidDate || null
      ]
    );

    const fullRecord = await query(
      `SELECT 
        f.id::text,
        f.student_id::text AS "studentId",
        u.name AS "studentName",
        s.roll_no AS "rollNumber",
        c.name AS class,
        c.section AS section,
        f.fee_type AS "feeType",
        f.amount::numeric::float AS amount,
        f.due_date::text AS "dueDate",
        f.paid_at::text AS "paidDate",
        f.status,
        COALESCE(f.description, '') AS remarks,
        f.school_id::text AS "schoolId"
       FROM fees f
       JOIN students s ON f.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE f.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(fullRecord.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Fees PUT
app.put("/api/fees/:id", async (req, res) => {
  try {
    const feeId = toIntID(req.params.id);
    const existing = await query("SELECT * FROM fees WHERE id = $1", [feeId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Fee record not found" });
    }
    const current = existing.rows[0];
    const amount = req.body.amount !== undefined ? req.body.amount : current.amount;
    const feeType = req.body.feeType !== undefined ? req.body.feeType : current.fee_type;
    const remarks = req.body.remarks !== undefined ? req.body.remarks : current.description;
    const dueDate = req.body.dueDate !== undefined ? req.body.dueDate : current.due_date;
    const status = req.body.status !== undefined ? req.body.status : current.status;
    const paidDate = req.body.paidDate !== undefined ? req.body.paidDate : current.paid_at;

    const validFeeTypes = ['tuition', 'exam', 'sports', 'library', 'transport', 'other'];
    const dbFeeType = validFeeTypes.includes(feeType) ? feeType : 'other';
    const description = remarks || (feeType !== dbFeeType ? feeType : null);

    await query(
      `UPDATE fees 
       SET amount = $1, fee_type = $2, description = $3, due_date = $4, status = $5, paid_at = $6
       WHERE id = $7`,
      [amount, dbFeeType, description, dueDate, status, paidDate || null, feeId]
    );

    const fullRecord = await query(
      `SELECT 
        f.id::text,
        f.student_id::text AS "studentId",
        u.name AS "studentName",
        s.roll_no AS "rollNumber",
        c.name AS class,
        c.section AS section,
        f.fee_type AS "feeType",
        f.amount::numeric::float AS amount,
        f.due_date::text AS "dueDate",
        f.paid_at::text AS "paidDate",
        f.status,
        COALESCE(f.description, '') AS remarks,
        f.school_id::text AS "schoolId"
       FROM fees f
       JOIN students s ON f.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE f.id = $1`,
      [feeId]
    );

    res.json(fullRecord.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Fees DELETE
app.delete("/api/fees/:id", async (req, res) => {
  try {
    const feeId = toIntID(req.params.id);
    const existing = await query(
      `SELECT 
        f.id::text,
        f.student_id::text AS "studentId",
        u.name AS "studentName",
        s.roll_no AS "rollNumber",
        c.name AS class,
        c.section AS section,
        f.fee_type AS "feeType",
        f.amount::numeric::float AS amount,
        f.due_date::text AS "dueDate",
        f.paid_at::text AS "paidDate",
        f.status,
        COALESCE(f.description, '') AS remarks,
        f.school_id::text AS "schoolId"
       FROM fees f
       JOIN students s ON f.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE f.id = $1`,
      [feeId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    await query("DELETE FROM fees WHERE id = $1", [feeId]);
    res.json(existing.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Salaries POST
app.post("/api/salaries", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { teacherId, baseSalary, allowances, deductions, month, year, status, paidDate } = req.body;

    const dbTeacherId = toIntID(String(teacherId));

    const dbBaseSalary = baseSalary || 0;
    const dbAllowances = allowances || 0;
    const dbDeductions = deductions || 0;
    const grossSalary = dbBaseSalary + dbAllowances;
    const netSalary = grossSalary - dbDeductions;

    const validStatuses = ['pending', 'approved', 'paid', 'on_hold'];
    const dbStatus = validStatuses.includes(status) ? status : 'pending';

    const result = await query(
      `INSERT INTO salary_records (
         school_id, teacher_id, month, year, basic_salary, other_allowances, other_deductions, 
         gross_salary, total_deductions, net_salary, status, paid_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        schoolId,
        dbTeacherId,
        month,
        year,
        dbBaseSalary,
        dbAllowances,
        dbDeductions,
        grossSalary,
        dbDeductions,
        netSalary,
        dbStatus,
        paidDate || null
      ]
    );

    const fullRecord = await query(
      `SELECT 
        sr.id::text,
        sr.teacher_id::text AS "teacherId",
        u.name AS "teacherName",
        COALESCE(
          (SELECT string_agg(sub.name, ', ') FROM subjects sub WHERE sub.teacher_id = sr.teacher_id),
          'Mathematics'
        ) AS subject,
        sr.basic_salary::numeric::float AS "baseSalary",
        (sr.hra + sr.da + sr.ta + sr.medical + sr.other_allowances + sr.bonus)::numeric::float AS allowances,
        (sr.pf_deduction + sr.esi_deduction + sr.professional_tax + sr.tds + sr.other_deductions)::numeric::float AS deductions,
        sr.month,
        sr.year,
        sr.status,
        sr.paid_at::text AS "paidDate",
        sr.school_id::text AS "schoolId"
       FROM salary_records sr
       JOIN users u ON sr.teacher_id = u.id
       WHERE sr.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(fullRecord.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Salaries PUT
app.put("/api/salaries/:id", async (req, res) => {
  try {
    const recordId = toIntID(req.params.id);
    const existing = await query("SELECT * FROM salary_records WHERE id = $1", [recordId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Salary record not found" });
    }
    const current = existing.rows[0];
    const baseSalary = req.body.baseSalary !== undefined ? req.body.baseSalary : Number(current.basic_salary);
    const allowances = req.body.allowances !== undefined ? req.body.allowances : Number(current.other_allowances);
    const deductions = req.body.deductions !== undefined ? req.body.deductions : Number(current.other_deductions);
    const month = req.body.month !== undefined ? req.body.month : current.month;
    const year = req.body.year !== undefined ? req.body.year : current.year;
    const status = req.body.status !== undefined ? req.body.status : current.status;
    const paidDate = req.body.paidDate !== undefined ? req.body.paidDate : current.paid_at;

    const grossSalary = baseSalary + allowances;
    const netSalary = grossSalary - deductions;

    const validStatuses = ['pending', 'approved', 'paid', 'on_hold'];
    const dbStatus = validStatuses.includes(status) ? status : 'pending';

    await query(
      `UPDATE salary_records 
       SET basic_salary = $1, other_allowances = $2, other_deductions = $3, 
           gross_salary = $4, total_deductions = $5, net_salary = $6, 
           month = $7, year = $8, status = $9, paid_at = $10
       WHERE id = $11`,
      [
        baseSalary,
        allowances,
        deductions,
        grossSalary,
        deductions,
        netSalary,
        month,
        year,
        dbStatus,
        paidDate || null,
        recordId
      ]
    );

    const fullRecord = await query(
      `SELECT 
        sr.id::text,
        sr.teacher_id::text AS "teacherId",
        u.name AS "teacherName",
        COALESCE(
          (SELECT string_agg(sub.name, ', ') FROM subjects sub WHERE sub.teacher_id = sr.teacher_id),
          'Mathematics'
        ) AS subject,
        sr.basic_salary::numeric::float AS "baseSalary",
        (sr.hra + sr.da + sr.ta + sr.medical + sr.other_allowances + sr.bonus)::numeric::float AS allowances,
        (sr.pf_deduction + sr.esi_deduction + sr.professional_tax + sr.tds + sr.other_deductions)::numeric::float AS deductions,
        sr.month,
        sr.year,
        sr.status,
        sr.paid_at::text AS "paidDate",
        sr.school_id::text AS "schoolId"
       FROM salary_records sr
       JOIN users u ON sr.teacher_id = u.id
       WHERE sr.id = $1`,
      [recordId]
    );

    res.json(fullRecord.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Salaries DELETE
app.delete("/api/salaries/:id", async (req, res) => {
  try {
    const recordId = toIntID(req.params.id);
    const existing = await query(
      `SELECT 
        sr.id::text,
        sr.teacher_id::text AS "teacherId",
        u.name AS "teacherName",
        COALESCE(
          (SELECT string_agg(sub.name, ', ') FROM subjects sub WHERE sub.teacher_id = sr.teacher_id),
          'Mathematics'
        ) AS subject,
        sr.basic_salary::numeric::float AS "baseSalary",
        (sr.hra + sr.da + sr.ta + sr.medical + sr.other_allowances + sr.bonus)::numeric::float AS allowances,
        (sr.pf_deduction + sr.esi_deduction + sr.professional_tax + sr.tds + sr.other_deductions)::numeric::float AS deductions,
        sr.month,
        sr.year,
        sr.status,
        sr.paid_at::text AS "paidDate",
        sr.school_id::text AS "schoolId"
       FROM salary_records sr
       JOIN users u ON sr.teacher_id = u.id
       WHERE sr.id = $1`,
      [recordId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    await query("DELETE FROM salary_records WHERE id = $1", [recordId]);
    res.json(existing.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET timetables
app.get("/api/timetables", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const classIdStr = req.query.classId;
    const classId = classIdStr ? toIntID(String(classIdStr)) : null;
    const teacherIdStr = req.query.teacherId;
    const teacherId = teacherIdStr ? toIntID(String(teacherIdStr)) : null;

    let q = `
      SELECT 
        t.id::text,
        t.school_id::text AS "schoolId",
        t.class_id::text AS "classId",
        c.name AS "className",
        c.section AS "section",
        t.subject_id::text AS "subjectId",
        sub.name AS "subjectName",
        t.day_of_week AS "dayOfWeek",
        t.start_time::text AS "startTime",
        t.end_time::text AS "endTime",
        t.classroom,
        sub.teacher_id::text AS "teacherId",
        u.name AS "teacherName"
      FROM timetables t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects sub ON t.subject_id = sub.id
      LEFT JOIN users u ON sub.teacher_id = u.id
      WHERE ($1::int IS NULL OR t.school_id = $1::int)
        AND ($2::int IS NULL OR t.class_id = $2::int)
        AND ($3::int IS NULL OR sub.teacher_id = $3::int)
      ORDER BY 
        CASE t.day_of_week
          WHEN 'monday' THEN 1
          WHEN 'tuesday' THEN 2
          WHEN 'wednesday' THEN 3
          WHEN 'thursday' THEN 4
          WHEN 'friday' THEN 5
          WHEN 'saturday' THEN 6
          ELSE 7
        END,
        t.start_time
    `;
    const result = await query(q, [schoolId, classId, teacherId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST timetable
app.post("/api/timetables", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { classId, subjectId, dayOfWeek, startTime, endTime, classroom } = req.body;

    const result = await query(
      `INSERT INTO timetables (school_id, class_id, subject_id, day_of_week, start_time, end_time, classroom)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [schoolId, toIntID(classId), toIntID(subjectId), dayOfWeek.toLowerCase(), startTime, endTime, classroom]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT timetable
app.put("/api/timetables/:id", async (req, res) => {
  try {
    const timetableId = toIntID(req.params.id);
    const { classId, subjectId, dayOfWeek, startTime, endTime, classroom } = req.body;

    const result = await query(
      `UPDATE timetables 
       SET class_id = $1, subject_id = $2, day_of_week = $3, start_time = $4, end_time = $5, classroom = $6
       WHERE id = $7
       RETURNING *`,
      [toIntID(classId), toIntID(subjectId), dayOfWeek.toLowerCase(), startTime, endTime, classroom, timetableId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Timetable slot not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE timetable
app.delete("/api/timetables/:id", async (req, res) => {
  try {
    const timetableId = toIntID(req.params.id);
    const result = await query("DELETE FROM timetables WHERE id = $1 RETURNING *", [timetableId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Timetable slot not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET homework
app.get("/api/homework", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const classIdStr = req.query.classId;
    const classId = classIdStr ? toIntID(String(classIdStr)) : null;
    const teacherIdStr = req.query.teacherId;
    const teacherId = teacherIdStr ? toIntID(String(teacherIdStr)) : null;

    let q = `
      SELECT 
        h.id::text,
        h.school_id::text AS "schoolId",
        h.class_id::text AS "classId",
        c.name AS "className",
        c.section AS "section",
        h.subject_id::text AS "subjectId",
        sub.name AS "subjectName",
        h.teacher_id::text AS "teacherId",
        u.name AS "teacherName",
        h.title,
        h.description,
        h.due_date::text AS "dueDate",
        h.created_at::text AS "createdAt"
      FROM homework h
      JOIN classes c ON h.class_id = c.id
      JOIN subjects sub ON h.subject_id = sub.id
      LEFT JOIN users u ON h.teacher_id = u.id
      WHERE ($1::int IS NULL OR h.school_id = $1::int)
        AND ($2::int IS NULL OR h.class_id = $2::int)
        AND ($3::int IS NULL OR h.teacher_id = $3::int)
      ORDER BY h.due_date ASC
    `;
    const result = await query(q, [schoolId, classId, teacherId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST homework
app.post("/api/homework", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { classId, subjectId, teacherId, title, description, dueDate } = req.body;

    const result = await query(
      `INSERT INTO homework (school_id, class_id, subject_id, teacher_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [schoolId, toIntID(classId), toIntID(subjectId), toIntID(teacherId), title, description, dueDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT homework
app.put("/api/homework/:id", async (req, res) => {
  try {
    const homeworkId = toIntID(req.params.id);
    const { classId, subjectId, title, description, dueDate } = req.body;

    const result = await query(
      `UPDATE homework 
       SET class_id = $1, subject_id = $2, title = $3, description = $4, due_date = $5
       WHERE id = $6
       RETURNING *`,
      [toIntID(classId), toIntID(subjectId), title, description, dueDate, homeworkId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Homework not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE homework
app.delete("/api/homework/:id", async (req, res) => {
  try {
    const homeworkId = toIntID(req.params.id);
    const result = await query("DELETE FROM homework WHERE id = $1 RETURNING *", [homeworkId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Homework not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET notices
app.get("/api/notices", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const audience = req.query.audience;

    let q = `
      SELECT 
        n.id::text,
        n.school_id::text AS "schoolId",
        n.title,
        n.content,
        n.audience,
        n.is_pinned AS "isPinned",
        n.created_by::text AS "createdBy",
        u.name AS "creatorName",
        n.created_at::text AS "createdAt"
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE ($1::int IS NULL OR n.school_id = $1::int)
        AND ($2::text IS NULL OR n.audience = $2::text OR n.audience = 'all')
      ORDER BY n.is_pinned DESC, n.created_at DESC
    `;
    const result = await query(q, [schoolId, audience || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST notice
app.post("/api/notices", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { title, content, audience, isPinned, createdBy } = req.body;

    const result = await query(
      `INSERT INTO notices (school_id, title, content, audience, is_pinned, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [schoolId, title, content, audience || 'all', isPinned || false, createdBy ? toIntID(createdBy) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT notice
app.put("/api/notices/:id", async (req, res) => {
  try {
    const noticeId = toIntID(req.params.id);
    const { title, content, audience, isPinned } = req.body;

    const result = await query(
      `UPDATE notices 
       SET title = $1, content = $2, audience = $3, is_pinned = $4
       WHERE id = $5
       RETURNING *`,
      [title, content, audience, isPinned, noticeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE notice
app.delete("/api/notices/:id", async (req, res) => {
  try {
    const noticeId = toIntID(req.params.id);
    const result = await query("DELETE FROM notices WHERE id = $1 RETURNING *", [noticeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET marks
app.get("/api/marks", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId;
    const schoolId = schoolIdStr ? toIntID(String(schoolIdStr)) : null;
    const studentIdStr = req.query.studentId;
    const studentId = studentIdStr ? toIntID(String(studentIdStr)) : null;
    const subjectIdStr = req.query.subjectId;
    const subjectId = subjectIdStr ? toIntID(String(subjectIdStr)) : null;
    const classIdStr = req.query.classId;
    const classId = classIdStr ? toIntID(String(classIdStr)) : null;

    let q = `
      SELECT 
        m.id::text,
        m.school_id::text AS "schoolId",
        m.student_id::text AS "studentId",
        u.name AS "studentName",
        s.roll_no AS "rollNumber",
        m.subject_id::text AS "subjectId",
        sub.name AS "subjectName",
        m.exam_type AS "examType",
        m.score::numeric::float AS score,
        m.max_score::numeric::float AS "maxScore",
        m.exam_date::text AS "examDate",
        m.entered_by::text AS "enteredBy",
        m.created_at::text AS "createdAt"
      FROM marks m
      JOIN students s ON m.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE ($1::int IS NULL OR m.school_id = $1::int)
        AND ($2::int IS NULL OR m.student_id = $2::int)
        AND ($3::int IS NULL OR m.subject_id = $3::int)
        AND ($4::int IS NULL OR s.class_id = $4::int)
      ORDER BY m.exam_date DESC, sub.name ASC
    `;
    const result = await query(q, [schoolId, studentId, subjectId, classId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST marks
app.post("/api/marks", async (req, res) => {
  try {
    const schoolIdStr = req.headers["x-school-id"] || req.query.schoolId || req.body.schoolId;
    const schoolId = toIntID(String(schoolIdStr));
    const { studentId, subjectId, examType, score, maxScore, examDate, enteredBy } = req.body;

    const result = await query(
      `INSERT INTO marks (school_id, student_id, subject_id, exam_type, score, max_score, exam_date, entered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (school_id, student_id, subject_id, exam_type, exam_date) 
       DO UPDATE SET score = EXCLUDED.score, max_score = EXCLUDED.max_score, entered_by = EXCLUDED.entered_by
       RETURNING *`,
      [
        schoolId,
        toIntID(studentId),
        toIntID(subjectId),
        examType,
        score,
        maxScore || 100,
        examDate || new Date(),
        enteredBy ? toIntID(enteredBy) : null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT marks
app.put("/api/marks/:id", async (req, res) => {
  try {
    const markId = toIntID(req.params.id);
    const { score, maxScore, examDate } = req.body;

    const result = await query(
      `UPDATE marks 
       SET score = $1, max_score = $2, exam_date = $3
       WHERE id = $4
       RETURNING *`,
      [score, maxScore, examDate, markId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Marks record not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE marks
app.delete("/api/marks/:id", async (req, res) => {
  try {
    const markId = toIntID(req.params.id);
    const result = await query("DELETE FROM marks WHERE id = $1 RETURNING *", [markId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Marks record not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
