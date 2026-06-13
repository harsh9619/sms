-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.attendance_id_seq;

CREATE SEQUENCE public.attendance_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.attendance_id_seq TO postgres;

-- DROP SEQUENCE public.class_subjects_id_seq;

CREATE SEQUENCE public.class_subjects_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.class_subjects_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.class_subjects_id_seq TO postgres;

-- DROP SEQUENCE public.classes_id_seq;

CREATE SEQUENCE public.classes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.classes_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.classes_id_seq TO postgres;

-- DROP SEQUENCE public.fees_id_seq;

CREATE SEQUENCE public.fees_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.fees_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.fees_id_seq TO postgres;

-- DROP SEQUENCE public.homework_id_seq;

CREATE SEQUENCE public.homework_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.homework_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.homework_id_seq TO postgres;

-- DROP SEQUENCE public.marks_id_seq;

CREATE SEQUENCE public.marks_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.marks_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.marks_id_seq TO postgres;

-- DROP SEQUENCE public.notices_id_seq;

CREATE SEQUENCE public.notices_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.notices_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.notices_id_seq TO postgres;

-- DROP SEQUENCE public.salary_records_id_seq;

CREATE SEQUENCE public.salary_records_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.salary_records_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.salary_records_id_seq TO postgres;

-- DROP SEQUENCE public.salary_structures_id_seq;

CREATE SEQUENCE public.salary_structures_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.salary_structures_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.salary_structures_id_seq TO postgres;

-- DROP SEQUENCE public.schools_id_seq;

CREATE SEQUENCE public.schools_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.schools_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.schools_id_seq TO postgres;

-- DROP SEQUENCE public.students_id_seq;

CREATE SEQUENCE public.students_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.students_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.students_id_seq TO postgres;

-- DROP SEQUENCE public.subjects_id_seq;

CREATE SEQUENCE public.subjects_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.subjects_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.subjects_id_seq TO postgres;

-- DROP SEQUENCE public.timetables_id_seq;

CREATE SEQUENCE public.timetables_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.timetables_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.timetables_id_seq TO postgres;

-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.users_id_seq TO postgres;
-- public.schools definition

-- Drop table

-- DROP TABLE public.schools;

CREATE TABLE public.schools (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"name" text NOT NULL,
	slug text NOT NULL,
	address text NULL,
	city text NULL,
	state text NULL,
	phone text NULL,
	email text NULL,
	logo_url text NULL,
	website text NULL,
	board text NULL,
	academic_year text DEFAULT '2024-25'::text NOT NULL,
	is_active bool DEFAULT true NULL,
	"subscription" text DEFAULT 'free'::text NULL,
	max_students int4 DEFAULT 500 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT schools_pkey PRIMARY KEY (id),
	CONSTRAINT schools_slug_key UNIQUE (slug),
	CONSTRAINT schools_subscription_check CHECK ((subscription = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text])))
);

-- Permissions

ALTER TABLE public.schools OWNER TO postgres;
GRANT ALL ON TABLE public.schools TO postgres;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NULL,
	"name" text NOT NULL,
	email text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	phone text NULL,
	avatar_url text NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT users_email_school_id_key UNIQUE (email, school_id),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['super_admin'::text, 'school_admin'::text, 'teacher'::text, 'student'::text, 'parent'::text]))),
	CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);
CREATE INDEX idx_users_school ON public.users USING btree (school_id);
CREATE UNIQUE INDEX users_email_per_school ON public.users USING btree (email, school_id) WHERE (school_id IS NOT NULL);
CREATE UNIQUE INDEX users_email_super_admin ON public.users USING btree (email) WHERE (school_id IS NULL);

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;


-- public.classes definition

-- Drop table

-- DROP TABLE public.classes;

CREATE TABLE public.classes (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	"name" text NOT NULL,
	"section" text NOT NULL,
	teacher_id int4 NULL,
	academic_year text DEFAULT '2024-25'::text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT classes_pkey PRIMARY KEY (id),
	CONSTRAINT classes_school_id_name_section_academic_year_key UNIQUE (school_id, name, section, academic_year),
	CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_classes_school ON public.classes USING btree (school_id);

-- Permissions

ALTER TABLE public.classes OWNER TO postgres;
GRANT ALL ON TABLE public.classes TO postgres;


-- public.notices definition

-- Drop table

-- DROP TABLE public.notices;

CREATE TABLE public.notices (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	title text NOT NULL,
	"content" text NOT NULL,
	audience text DEFAULT 'all'::text NOT NULL,
	is_pinned bool DEFAULT false NULL,
	created_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT notices_pkey PRIMARY KEY (id),
	CONSTRAINT notices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT notices_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE
);
CREATE INDEX idx_notices_school ON public.notices USING btree (school_id);

-- Permissions

ALTER TABLE public.notices OWNER TO postgres;
GRANT ALL ON TABLE public.notices TO postgres;


-- public.salary_structures definition

-- Drop table

-- DROP TABLE public.salary_structures;

CREATE TABLE public.salary_structures (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	teacher_id int4 NULL,
	basic_salary numeric(10, 2) DEFAULT 0 NOT NULL,
	hra numeric(10, 2) DEFAULT 0 NOT NULL,
	da numeric(10, 2) DEFAULT 0 NOT NULL,
	ta numeric(10, 2) DEFAULT 0 NOT NULL,
	medical numeric(10, 2) DEFAULT 0 NOT NULL,
	other_allowances numeric(10, 2) DEFAULT 0 NOT NULL,
	pf_deduction numeric(10, 2) DEFAULT 0 NOT NULL,
	esi_deduction numeric(10, 2) DEFAULT 0 NOT NULL,
	professional_tax numeric(10, 2) DEFAULT 0 NOT NULL,
	tds numeric(10, 2) DEFAULT 0 NOT NULL,
	effective_from date DEFAULT CURRENT_DATE NOT NULL,
	is_active bool DEFAULT true NULL,
	created_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT salary_structures_pkey PRIMARY KEY (id),
	CONSTRAINT salary_structures_school_id_teacher_id_effective_from_key UNIQUE (school_id, teacher_id, effective_from),
	CONSTRAINT salary_structures_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT salary_structures_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT salary_structures_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.salary_structures OWNER TO postgres;
GRANT ALL ON TABLE public.salary_structures TO postgres;


-- public.students definition

-- Drop table

-- DROP TABLE public.students;

CREATE TABLE public.students (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	user_id int4 NULL,
	class_id int4 NULL,
	roll_no text NOT NULL,
	dob date NULL,
	gender text NULL,
	blood_group text NULL,
	address text NULL,
	guardian_name text NULL,
	guardian_phone text NULL,
	admission_date date DEFAULT CURRENT_DATE NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT students_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))),
	CONSTRAINT students_pkey PRIMARY KEY (id),
	CONSTRAINT students_school_id_class_id_roll_no_key UNIQUE (school_id, class_id, roll_no),
	CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL,
	CONSTRAINT students_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_students_class ON public.students USING btree (class_id);
CREATE INDEX idx_students_school ON public.students USING btree (school_id);

-- Permissions

ALTER TABLE public.students OWNER TO postgres;
GRANT ALL ON TABLE public.students TO postgres;


-- public.subjects definition

-- Drop table

-- DROP TABLE public.subjects;

CREATE TABLE public.subjects (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	"name" text NOT NULL,
	code text NOT NULL,
	class_id int4 NULL,
	teacher_id int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT subjects_pkey PRIMARY KEY (id),
	CONSTRAINT subjects_school_id_class_id_code_key UNIQUE (school_id, class_id, code),
	CONSTRAINT subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
	CONSTRAINT subjects_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Permissions

ALTER TABLE public.subjects OWNER TO postgres;
GRANT ALL ON TABLE public.subjects TO postgres;


-- public.timetables definition

-- Drop table

-- DROP TABLE public.timetables;

CREATE TABLE public.timetables (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	class_id int4 NOT NULL,
	subject_id int4 NOT NULL,
	day_of_week text NOT NULL,
	start_time time NOT NULL,
	end_time time NOT NULL,
	classroom text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT timetables_day_of_week_check CHECK ((day_of_week = ANY (ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text, 'saturday'::text]))),
	CONSTRAINT timetables_pkey PRIMARY KEY (id),
	CONSTRAINT timetables_school_id_class_id_day_of_week_start_time_key UNIQUE (school_id, class_id, day_of_week, start_time),
	CONSTRAINT timetables_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
	CONSTRAINT timetables_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT timetables_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE
);
CREATE INDEX idx_timetables_class ON public.timetables USING btree (class_id);
CREATE INDEX idx_timetables_school ON public.timetables USING btree (school_id);

-- Permissions

ALTER TABLE public.timetables OWNER TO postgres;
GRANT ALL ON TABLE public.timetables TO postgres;


-- public.attendance definition

-- Drop table

-- DROP TABLE public.attendance;

CREATE TABLE public.attendance (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	student_id int4 NULL,
	class_id int4 NULL,
	"date" date NOT NULL,
	status text NOT NULL,
	marked_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT attendance_pkey PRIMARY KEY (id),
	CONSTRAINT attendance_school_id_student_id_date_key UNIQUE (school_id, student_id, date),
	CONSTRAINT attendance_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text, 'excused'::text]))),
	CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
	CONSTRAINT attendance_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT attendance_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);
CREATE INDEX idx_attendance_date ON public.attendance USING btree (date);
CREATE INDEX idx_attendance_school ON public.attendance USING btree (school_id);

-- Permissions

ALTER TABLE public.attendance OWNER TO postgres;
GRANT ALL ON TABLE public.attendance TO postgres;


-- public.class_subjects definition

-- Drop table

-- DROP TABLE public.class_subjects;

CREATE TABLE public.class_subjects (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	class_id int4 NOT NULL,
	subject_id int4 NOT NULL,
	CONSTRAINT class_subjects_class_id_subject_id_key UNIQUE (class_id, subject_id),
	CONSTRAINT class_subjects_pkey PRIMARY KEY (id),
	CONSTRAINT class_subjects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
	CONSTRAINT class_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

-- Permissions

ALTER TABLE public.class_subjects OWNER TO postgres;
GRANT ALL ON TABLE public.class_subjects TO postgres;


-- public.fees definition

-- Drop table

-- DROP TABLE public.fees;

CREATE TABLE public.fees (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	student_id int4 NULL,
	amount numeric(10, 2) NOT NULL,
	fee_type text NOT NULL,
	description text NULL,
	due_date date NOT NULL,
	status text DEFAULT 'pending'::text NOT NULL,
	paid_at timestamptz NULL,
	payment_method text NULL,
	transaction_id text NULL,
	created_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT fees_fee_type_check CHECK ((fee_type = ANY (ARRAY['tuition'::text, 'exam'::text, 'sports'::text, 'library'::text, 'transport'::text, 'other'::text]))),
	CONSTRAINT fees_pkey PRIMARY KEY (id),
	CONSTRAINT fees_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'waived'::text]))),
	CONSTRAINT fees_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT fees_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT fees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE
);
CREATE INDEX idx_fees_school ON public.fees USING btree (school_id);
CREATE INDEX idx_fees_status ON public.fees USING btree (status);

-- Permissions

ALTER TABLE public.fees OWNER TO postgres;
GRANT ALL ON TABLE public.fees TO postgres;


-- public.homework definition

-- Drop table

-- DROP TABLE public.homework;

CREATE TABLE public.homework (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	class_id int4 NOT NULL,
	subject_id int4 NOT NULL,
	teacher_id int4 NULL,
	title text NOT NULL,
	description text NOT NULL,
	due_date date NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT homework_pkey PRIMARY KEY (id),
	CONSTRAINT homework_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
	CONSTRAINT homework_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT homework_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
	CONSTRAINT homework_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_homework_class ON public.homework USING btree (class_id);
CREATE INDEX idx_homework_school ON public.homework USING btree (school_id);

-- Permissions

ALTER TABLE public.homework OWNER TO postgres;
GRANT ALL ON TABLE public.homework TO postgres;


-- public.marks definition

-- Drop table

-- DROP TABLE public.marks;

CREATE TABLE public.marks (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	student_id int4 NULL,
	subject_id int4 NULL,
	exam_type text NOT NULL,
	score numeric(5, 2) NOT NULL,
	max_score numeric(5, 2) DEFAULT 100 NOT NULL,
	exam_date date NULL,
	entered_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT marks_exam_type_check CHECK ((exam_type = ANY (ARRAY['unit_test'::text, 'midterm'::text, 'final'::text, 'assignment'::text, 'practical'::text]))),
	CONSTRAINT marks_pkey PRIMARY KEY (id),
	CONSTRAINT marks_school_id_student_id_subject_id_exam_type_exam_date_key UNIQUE (school_id, student_id, subject_id, exam_type, exam_date),
	CONSTRAINT marks_entered_by_fkey FOREIGN KEY (entered_by) REFERENCES public.users(id) ON DELETE SET NULL,
	CONSTRAINT marks_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
	CONSTRAINT marks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- Permissions

ALTER TABLE public.marks OWNER TO postgres;
GRANT ALL ON TABLE public.marks TO postgres;


-- public.salary_records definition

-- Drop table

-- DROP TABLE public.salary_records;

CREATE TABLE public.salary_records (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	school_id int4 NOT NULL,
	teacher_id int4 NULL,
	salary_structure_id int4 NULL,
	"month" text NOT NULL,
	"year" int4 NOT NULL,
	basic_salary numeric(10, 2) NOT NULL,
	hra numeric(10, 2) DEFAULT 0 NOT NULL,
	da numeric(10, 2) DEFAULT 0 NOT NULL,
	ta numeric(10, 2) DEFAULT 0 NOT NULL,
	medical numeric(10, 2) DEFAULT 0 NOT NULL,
	other_allowances numeric(10, 2) DEFAULT 0 NOT NULL,
	bonus numeric(10, 2) DEFAULT 0 NOT NULL,
	pf_deduction numeric(10, 2) DEFAULT 0 NOT NULL,
	esi_deduction numeric(10, 2) DEFAULT 0 NOT NULL,
	professional_tax numeric(10, 2) DEFAULT 0 NOT NULL,
	tds numeric(10, 2) DEFAULT 0 NOT NULL,
	other_deductions numeric(10, 2) DEFAULT 0 NOT NULL,
	gross_salary numeric(10, 2) NOT NULL,
	total_deductions numeric(10, 2) NOT NULL,
	net_salary numeric(10, 2) NOT NULL,
	status text DEFAULT 'pending'::text NOT NULL,
	payment_method text NULL,
	transaction_id text NULL,
	paid_at timestamptz NULL,
	approved_by int4 NULL,
	created_by int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT salary_records_pkey PRIMARY KEY (id),
	CONSTRAINT salary_records_school_id_teacher_id_month_key UNIQUE (school_id, teacher_id, month),
	CONSTRAINT salary_records_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'paid'::text, 'on_hold'::text]))),
	CONSTRAINT salary_records_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id),
	CONSTRAINT salary_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
	CONSTRAINT salary_records_salary_structure_id_fkey FOREIGN KEY (salary_structure_id) REFERENCES public.salary_structures(id),
	CONSTRAINT salary_records_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
	CONSTRAINT salary_records_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_salary_month ON public.salary_records USING btree (month);
CREATE INDEX idx_salary_school ON public.salary_records USING btree (school_id);

-- Permissions

ALTER TABLE public.salary_records OWNER TO postgres;
GRANT ALL ON TABLE public.salary_records TO postgres;




-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;