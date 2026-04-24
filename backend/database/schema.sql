-- ========================================
-- SRES V1.2 (UPDATED WITH FAMILY_DETAILS)
-- ========================================
-- ADMIN
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'SUPERADMIN' CHECK (role IN ('SUPERADMIN', 'MODERATOR')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- STUDENT
CREATE TABLE student (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    dob DATE,
    gender VARCHAR(10),

    aadhar_number VARCHAR(12) UNIQUE,

    highest_qualification VARCHAR(20) CHECK (
        highest_qualification IN ('10th', '12th', 'Diploma', 'Undergraduate', 'Postgraduate')
    ),

    profile_photo_url TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'ENROLLED')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADDRESS
CREATE TABLE address (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('current', 'permanent')),
    state VARCHAR(100),
    district VARCHAR(100),
    pincode VARCHAR(10),
    village VARCHAR(100),
    UNIQUE(student_id, type),
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- FAMILY DETAILS (UPDATED)
CREATE TABLE family_details (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,

    father_name VARCHAR(100) NOT NULL,
    father_phone VARCHAR(15) NOT NULL,

    mother_name VARCHAR(100) NOT NULL,
    mother_phone VARCHAR(15) NOT NULL,

    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),

    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- ACADEMIC DETAILS
CREATE TABLE academic_details (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,

    class10_board VARCHAR(100),
    class10_percentage DECIMAL(5,2),
    class10_passing_year INT,
    class10_school VARCHAR(150),

    class12_board VARCHAR(100),
    class12_percentage DECIMAL(5,2),
    class12_passing_year INT,
    class12_school VARCHAR(150),

    ug_university VARCHAR(150),
    ug_percentage DECIMAL(5,2),
    ug_passing_year INT,
    ug_college VARCHAR(150),

    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- DOCUMENTS
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,

    type VARCHAR(50) CHECK (
        type IN (
            'aadhar_card',
            '10th_marksheet',
            '10th_certificate',
            '12th_marksheet',
            '12th_certificate',
            'ug_marksheet',
            'ug_certificate'
        )
    ),

    file_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

-- LEVEL
CREATE TABLE level (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- PROGRAM
CREATE TABLE program (
    id SERIAL PRIMARY KEY,
    level_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (level_id) REFERENCES level(id) ON DELETE CASCADE
);

-- BRANCH
CREATE TABLE branch (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE
);

-- ENROLLMENT
CREATE TABLE enrollment (
    id SERIAL PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,
    branch_id INT NOT NULL,

    current_semester INT DEFAULT 1,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
);

-- SUBJECT (Global Catalog)
CREATE TABLE subject (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    credits INT DEFAULT 3
);

-- BRANCH_SUBJECT (Curriculum Mapping)
CREATE TABLE branch_subject (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester INT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    UNIQUE(branch_id, subject_id, semester)
);

-- INITIAL DATA
INSERT INTO level (name) VALUES ('UG'), ('PG');

INSERT INTO program (level_id, name) VALUES
(1, 'B.Tech'),
(2, 'M.Tech');

INSERT INTO branch (program_id, name, capacity) VALUES
(1, 'CSE', 60),
(1, 'IT', 60),
(1, 'ECE', 60),
(2, 'CSE', 30),
(2, 'IT', 30),
(2, 'ECE', 30);
